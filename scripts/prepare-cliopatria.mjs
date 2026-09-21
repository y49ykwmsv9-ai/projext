import fs from "node:fs";
import path from "node:path";
import { inflateRawSync, gzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { topology } from "topojson-server";

const VERSION = "v0.2.0";
const SOURCE_URL = `https://github.com/Seshat-Global-History-Databank/cliopatria/raw/refs/tags/${VERSION}/cliopatria.geojson.zip`;
const CACHE_DIR = path.join(process.cwd(), ".cache", "cliopatria");
const CACHE_ZIP = path.join(CACHE_DIR, `cliopatria-${VERSION}.zip`);
const WORK_DIR = path.join(CACHE_DIR, "work");
const OUTPUT_DIR = path.join(process.cwd(), "public", "data", "cliopatria");
const TIME_BUCKET = 25;
const SPATIAL_CELL = 10;
const SHARD_COUNT = 32;
const QUANTIZATION = 100000;

fs.mkdirSync(CACHE_DIR, { recursive: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function downloadSource() {
  if (fs.existsSync(CACHE_ZIP) && fs.statSync(CACHE_ZIP).size > 1_000_000) return;
  console.log(`Downloading Cliopatria ${VERSION}`);
  const response = await fetch(SOURCE_URL, { redirect: "follow" });
  if (!response.ok) throw new Error(`Cliopatria download failed: HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(CACHE_ZIP, buffer);
  console.log(`Downloaded ${(buffer.length / 1048576).toFixed(1)} MiB`);
}

function extractSingleZipEntry(zipPath, outputPath) {
  const data = fs.readFileSync(zipPath);
  const eocd = data.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocd < 0) throw new Error("Invalid Cliopatria zip: EOCD not found");
  const centralOffset = data.readUInt32LE(eocd + 16);
  const entryCount = data.readUInt16LE(eocd + 10);
  let cursor = centralOffset;
  let selected;

  for (let i = 0; i < entryCount; i++) {
    if (data.readUInt32LE(cursor) !== 0x02014b50) throw new Error("Invalid central directory entry");
    const compression = data.readUInt16LE(cursor + 10);
    const compressedSize = data.readUInt32LE(cursor + 20);
    const uncompressedSize = data.readUInt32LE(cursor + 24);
    const nameLength = data.readUInt16LE(cursor + 28);
    const extraLength = data.readUInt16LE(cursor + 30);
    const commentLength = data.readUInt16LE(cursor + 32);
    const localOffset = data.readUInt32LE(cursor + 42);
    const name = data.subarray(cursor + 46, cursor + 46 + nameLength).toString("utf8");
    if (name.endsWith(".geojson")) {
      selected = { compression, compressedSize, uncompressedSize, localOffset };
      break;
    }
    cursor += 46 + nameLength + extraLength + commentLength;
  }

  if (!selected) throw new Error("Cliopatria zip did not contain a GeoJSON entry");
  const local = selected.localOffset;
  const localNameLength = data.readUInt16LE(local + 26);
  const localExtraLength = data.readUInt16LE(local + 28);
  const start = local + 30 + localNameLength + localExtraLength;
  const compressed = data.subarray(start, start + selected.compressedSize);
  const json = selected.compression === 8 ? inflateRawSync(compressed) : compressed;
  if (json.length !== selected.uncompressedSize) throw new Error("Cliopatria GeoJSON size mismatch");
  fs.writeFileSync(outputPath, json);
}

function readSourceGeoJson() {
  fs.mkdirSync(WORK_DIR, { recursive: true });
  const geojsonPath = path.join(WORK_DIR, "cliopatria.geojson");
  if (!fs.existsSync(geojsonPath)) extractSingleZipEntry(CACHE_ZIP, geojsonPath);
  const parsed = JSON.parse(fs.readFileSync(geojsonPath, "utf8"));
  if (parsed?.type !== "FeatureCollection" || !Array.isArray(parsed.features)) {
    throw new Error("Cliopatria GeoJSON is not a FeatureCollection");
  }
  return parsed;
}

function numeric(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function bboxOfGeometry(geometry) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const visit = (node) => {
    if (!Array.isArray(node)) return;
    if (node.length >= 2 && typeof node[0] === "number" && typeof node[1] === "number") {
      minX = Math.min(minX, node[0]); maxX = Math.max(maxX, node[0]);
      minY = Math.min(minY, node[1]); maxY = Math.max(maxY, node[1]);
      return;
    }
    for (const child of node) visit(child);
  };
  visit(geometry?.coordinates);
  return Number.isFinite(minX) ? [minX, minY, maxX, maxY] : null;
}

function stableShard(id) {
  return createHash("sha1").update(id).digest()[0] % SHARD_COUNT;
}

function bucketForYear(year) {
  return Math.floor(year / TIME_BUCKET) * TIME_BUCKET;
}

function addToIndex(map, key, value) {
  const list = map[key] ?? (map[key] = []);
  list.push(value);
}

function cellsForBbox(bbox) {
  if (!bbox) return [];
  let [minX, minY, maxX, maxY] = bbox;
  minX = Math.max(-180, minX); maxX = Math.min(180, maxX);
  minY = Math.max(-90, minY); maxY = Math.min(90, maxY);
  if (maxX < minX || maxY < minY) return [];
  const x0 = Math.floor((minX + 180) / SPATIAL_CELL);
  const x1 = Math.floor((Math.min(180, maxX) + 180 - 1e-9) / SPATIAL_CELL);
  const y0 = Math.floor((minY + 90) / SPATIAL_CELL);
  const y1 = Math.floor((Math.min(90, maxY) + 90 - 1e-9) / SPATIAL_CELL);
  const cells = [];
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) cells.push(`${x}:${y}`);
  return cells;
}

function writeGzipJson(filePath, value) {
  const payload = Buffer.from(JSON.stringify(value));
  const compressed = gzipSync(payload, { level: 9 });
  fs.writeFileSync(filePath, compressed);
  return { raw: payload.length, compressed: compressed.length };
}

async function main() {
  const manifestPath = path.join(OUTPUT_DIR, "manifest.json");
  if (process.env.FORCE_CLIOPATRIA !== "1" && fs.existsSync(manifestPath)) {
    console.log("Cliopatria runtime dataset already exists; skipping rebuild.");
    return;
  }

  await downloadSource();
  const source = readSourceGeoJson();
  const features = source.features;
  const shardFeatures = Array.from({ length: SHARD_COUNT }, () => []);
  const timeIndex = {};
  const spatialIndex = {};
  const recordToShard = {};
  let minYear = Infinity;
  let maxYear = -Infinity;

  features.forEach((feature, index) => {
    const properties = feature.properties ?? {};
    const fromYear = numeric(properties.FromYear ?? properties.fromYear, -3400);
    const toYear = numeric(properties.ToYear ?? properties.toYear, 2024);
    const id = `cp${index.toString(36)}`;
    const bbox = bboxOfGeometry(feature.geometry);
    const normalized = { type: "Feature", id, properties, geometry: feature.geometry, bbox };
    const shard = stableShard(id);

    shardFeatures[shard].push(normalized);
    recordToShard[id] = shard;

    for (let bucket = bucketForYear(Math.max(-3400, fromYear)); bucket <= bucketForYear(Math.min(2024, toYear)); bucket += TIME_BUCKET) {
      addToIndex(timeIndex, String(bucket), id);
    }
    for (const cell of cellsForBbox(bbox)) addToIndex(spatialIndex, cell, id);

    minYear = Math.min(minYear, fromYear);
    maxYear = Math.max(maxYear, toYear);
  });

  for (const map of [timeIndex, spatialIndex]) {
    for (const key of Object.keys(map)) {
      map[key].sort();
      map[key] = [...new Set(map[key])];
    }
  }

  const shards = [];
  let totalRaw = 0;
  let totalCompressed = 0;

  for (let shard = 0; shard < SHARD_COUNT; shard++) {
    const topo = topology({
      polities: { type: "FeatureCollection", features: shardFeatures[shard] },
    }, QUANTIZATION);
    topo.properties = {
      source: "Cliopatria",
      version: VERSION,
      quantization: QUANTIZATION,
      recordCount: shardFeatures[shard].length,
    };

    const file = `shard-${shard.toString().padStart(2, "0")}.topo.json.gz`;
    const stats = writeGzipJson(path.join(OUTPUT_DIR, file), topo);
    totalRaw += stats.raw;
    totalCompressed += stats.compressed;
    shards.push({ id: shard, file, recordCount: shardFeatures[shard].length, compressedBytes: stats.compressed });
  }

  const timeStats = writeGzipJson(path.join(OUTPUT_DIR, "time-index.json.gz"), timeIndex);
  const spatialStats = writeGzipJson(path.join(OUTPUT_DIR, "spatial-index.json.gz"), spatialIndex);
  const routingStats = writeGzipJson(path.join(OUTPUT_DIR, "record-routing.json.gz"), recordToShard);

  const manifest = {
    format: 1,
    source: "Cliopatria",
    version: VERSION,
    sourceUrl: SOURCE_URL,
    attribution: "Bennett, Mutch, Chalstrey et al., Seshat Global History Databank. Cliopatria v0.2.0.",
    license: "CC BY 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    recordCount: features.length,
    yearRange: [minYear, maxYear],
    timeBucketSize: TIME_BUCKET,
    spatialCellDegrees: SPATIAL_CELL,
    quantization: QUANTIZATION,
    shardCount: SHARD_COUNT,
    shards,
    indexes: {
      time: { file: "time-index.json.gz", compressedBytes: timeStats.compressed },
      spatial: { file: "spatial-index.json.gz", compressedBytes: spatialStats.compressed },
      routing: { file: "record-routing.json.gz", compressedBytes: routingStats.compressed },
    },
    compression: "gzip + TopoJSON quantized/delta-encoded arcs",
    sourceArchiveIsNotBundled: true,
    generatedAt: new Date().toISOString(),
    estimatedRawJsonBytes: totalRaw,
    estimatedCompressedShardBytes: totalCompressed,
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Cliopatria prepared: ${features.length} records, ${(totalCompressed / 1048576).toFixed(1)} MiB compressed shards.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
