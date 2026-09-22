import { feature as topoFeature } from "topojson-client";
import { geoContains } from "d3-geo";

export type CliopatriaManifest = {
  format: number;
  source: string;
  version: string;
  sourceUrl: string;
  attribution: string;
  license: string;
  licenseUrl: string;
  recordCount: number;
  yearRange: [number, number];
  timeBucketSize: number;
  spatialCellDegrees: number;
  quantization: number;
  shardCount: number;
  shards: Array<{ id: number; file: string; recordCount: number; compressedBytes: number }>;
  indexes: {
    time: { file: string; compressedBytes: number };
    spatial: { file: string; compressedBytes: number };
    routing: { file: string; compressedBytes: number };
  };
  compression: string;
};

export type CliopatriaFeature = {
  type: "Feature";
  id?: string | number;
  properties?: Record<string, unknown>;
  geometry: GeoJSON.Geometry | null;
  bbox?: [number, number, number, number];
};

type IndexMap = Record<string, string[]>;
type RoutingMap = Record<string, number>;
type AnyTopology = { objects: Record<string, unknown> };

const BASE = "/data/cliopatria";
let manifestPromise: Promise<CliopatriaManifest> | undefined;
let timeIndexPromise: Promise<IndexMap> | undefined;
let spatialIndexPromise: Promise<IndexMap> | undefined;
let routingPromise: Promise<RoutingMap> | undefined;
const shardCache = new Map<number, Promise<CliopatriaFeature[]>>();

async function loadGzipJson<T>(file: string): Promise<T> {
  const response = await fetch(`${BASE}/${file}`);
  if (!response.ok) throw new Error(`Cliopatria asset unavailable: ${file} (${response.status})`);
  if (!response.body) throw new Error("Cliopatria response has no body");
  const stream = response.body.pipeThrough(new DecompressionStream("gzip"));
  return await new Response(stream).json() as T;
}

export function loadCliopatriaManifest() {
  manifestPromise ??= fetch(`${BASE}/manifest.json`).then(async (response) => {
    if (!response.ok) throw new Error(`Cliopatria manifest unavailable (${response.status})`);
    return await response.json() as CliopatriaManifest;
  });
  return manifestPromise;
}

async function loadTimeIndex() {
  timeIndexPromise ??= loadGzipJson<IndexMap>("time-index.json.gz");
  return timeIndexPromise;
}

async function loadSpatialIndex() {
  spatialIndexPromise ??= loadGzipJson<IndexMap>("spatial-index.json.gz");
  return spatialIndexPromise;
}

async function loadRouting() {
  routingPromise ??= loadGzipJson<RoutingMap>("record-routing.json.gz");
  return routingPromise;
}

async function loadShard(shardId: number) {
  const cached = shardCache.get(shardId);
  if (cached) return cached;

  const promise = loadGzipJson<AnyTopology>(
    `shard-${shardId.toString().padStart(2, "0")}.topo.json.gz`,
  ).then((topology) => {
    const object = topology.objects.polities as never;
    const collection = topoFeature(topology as never, object) as unknown as GeoJSON.FeatureCollection;
    return collection.features as CliopatriaFeature[];
  });

  shardCache.set(shardId, promise);
  return promise;
}

function bucketForYear(year: number, bucketSize: number) {
  return Math.floor(year / bucketSize) * bucketSize;
}

function spatialKey(lon: number, lat: number, cellDegrees: number) {
  return `${Math.floor((lon + 180) / cellDegrees)}:${Math.floor((lat + 90) / cellDegrees)}`;
}

function bboxContains(bbox: [number, number, number, number], lon: number, lat: number) {
  return lon >= bbox[0] && lon <= bbox[2] && lat >= bbox[1] && lat <= bbox[3];
}

async function loadFeaturesByIds(ids: string[]) {
  if (!ids.length) return [];
  const routing = await loadRouting();
  const grouped = new Map<number, string[]>();

  for (const id of ids) {
    const shard = routing[id];
    if (shard === undefined) continue;
    const list = grouped.get(shard) ?? [];
    list.push(id);
    grouped.set(shard, list);
  }

  const results: CliopatriaFeature[] = [];
  for (const [shard, wanted] of grouped) {
    const wantedSet = new Set(wanted);
    const features = await loadShard(shard);
    for (const item of features) {
      if (wantedSet.has(String(item.id))) results.push(item);
    }
  }
  return results;
}

function activeAtYear(feature: CliopatriaFeature, year: number, manifest: CliopatriaManifest) {
  const p = feature.properties ?? {};
  const from = Number(p.FromYear ?? p.fromYear ?? manifest.yearRange[0]);
  const to = Number(p.ToYear ?? p.toYear ?? manifest.yearRange[1]);
  return from <= year && year <= to;
}

export async function queryCliopatriaYear(year: number, region?: [number, number, number, number]) {
  const manifest = await loadCliopatriaManifest();
  if (year < manifest.yearRange[0] || year > manifest.yearRange[1]) return [];

  const index = await loadTimeIndex();
  const ids = index[String(bucketForYear(year, manifest.timeBucketSize))] ?? [];
  const features = await loadFeaturesByIds(ids);
  return features.filter((item) => activeAtYear(item, year, manifest));
}

export async function queryCliopatriaPoint(year: number, lon: number, lat: number) {
  const manifest = await loadCliopatriaManifest();
  const [timeIndex, spatialIndex] = await Promise.all([loadTimeIndex(), loadSpatialIndex()]);
  const timeIds = new Set(timeIndex[String(bucketForYear(year, manifest.timeBucketSize))] ?? []);
  const cellIds = spatialIndex[spatialKey(lon, lat, manifest.spatialCellDegrees)] ?? [];
  const ids = cellIds.filter((id) => timeIds.has(id));
  const features = await loadFeaturesByIds(ids);

  return features.filter((item) => {
    if (!activeAtYear(item, year, manifest)) return false;
    if (item.bbox && !bboxContains(item.bbox, lon, lat)) return false;
    return !!item.geometry && geoContains(item as never, [lon, lat]);
  });
}

export async function queryCliopatriaArea(year: number, bbox: [number, number, number, number]) {
  const manifest = await loadCliopatriaManifest();
  const [timeIndex, spatialIndex] = await Promise.all([loadTimeIndex(), loadSpatialIndex()]);
  const timeIds = new Set(timeIndex[String(bucketForYear(year, manifest.timeBucketSize))] ?? []);
  const x0 = Math.floor((bbox[0] + 180) / manifest.spatialCellDegrees);
  const x1 = Math.floor((bbox[2] + 180) / manifest.spatialCellDegrees);
  const y0 = Math.floor((bbox[1] + 90) / manifest.spatialCellDegrees);
  const y1 = Math.floor((bbox[3] + 90) / manifest.spatialCellDegrees);
  const ids = new Set<string>();

  for (let x = x0; x <= x1; x++) {
    for (let y = y0; y <= y1; y++) {
      for (const id of spatialIndex[`${x}:${y}`] ?? []) {
        if (timeIds.has(id)) ids.add(id);
      }
    }
  }

  const features = await loadFeaturesByIds([...ids]);
  return features.filter((item) => activeAtYear(item, year, manifest));
}

export function clearCliopatriaCache() {
  shardCache.clear();
}
