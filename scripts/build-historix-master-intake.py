#!/usr/bin/env python3
"""Build the HISTORIX Master Store polity intake from the pinned Cliopatria source."""
from __future__ import annotations
import csv, datetime as dt, hashlib, json, os, sqlite3, tempfile, urllib.request, zipfile, zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "data" / "historix-master"
DB = OUT_DIR / "historix_master.sqlite"
REPORT = OUT_DIR / "intake_report.json"

CLI_COMMIT = "ad28a691b7c07c1fca89d0e0636d324667d2a258"
CLI_URL = f"https://github.com/Seshat-Global-History-Databank/cliopatria/raw/{CLI_COMMIT}/cliopatria.geojson.zip"
EXPECTED = 1583

def now():
    return dt.datetime.now(dt.timezone.utc).isoformat()

def init_db(db):
    db.executescript("""
    PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS store_meta(
      key TEXT PRIMARY KEY, value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS import_runs(
      run_id TEXT PRIMARY KEY, source_name TEXT, source_hash TEXT, started_at TEXT,
      completed_at TEXT, status TEXT, records_seen INTEGER, records_created INTEGER,
      records_updated INTEGER, records_rejected INTEGER, notes TEXT
    );
    CREATE TABLE IF NOT EXISTS polities(
      polity_id TEXT PRIMARY KEY, canonical_name TEXT NOT NULL, polity_type TEXT,
      start_date TEXT, end_date TEXT, status TEXT, parent_polity_id TEXT,
      predecessor_ids TEXT NOT NULL DEFAULT '[]', successor_ids TEXT NOT NULL DEFAULT '[]',
      alternate_names TEXT NOT NULL DEFAULT '[]', attributes TEXT NOT NULL DEFAULT '{}',
      source_record_ids TEXT NOT NULL DEFAULT '[]'
    );
    CREATE TABLE IF NOT EXISTS aliases(
      alias_id INTEGER PRIMARY KEY AUTOINCREMENT, entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL, alias TEXT NOT NULL, language TEXT, source_id TEXT
    );
    CREATE TABLE IF NOT EXISTS sources(
      source_id TEXT PRIMARY KEY, title TEXT NOT NULL, source_type TEXT, url TEXT, metadata TEXT
    );
    CREATE TABLE IF NOT EXISTS provenance(
      provenance_id INTEGER PRIMARY KEY AUTOINCREMENT, entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL, source_id TEXT NOT NULL, source_record_key TEXT,
      assertion TEXT, confidence TEXT, retrieved_at TEXT, notes TEXT
    );
    CREATE TABLE IF NOT EXISTS duplicate_candidates(
      duplicate_id INTEGER PRIMARY KEY AUTOINCREMENT, entity_type TEXT NOT NULL,
      entity_id_a TEXT NOT NULL, entity_id_b TEXT NOT NULL, reason TEXT,
      confidence TEXT, status TEXT DEFAULT 'unreviewed'
    );
    CREATE INDEX IF NOT EXISTS idx_polities_name ON polities(canonical_name);
    CREATE INDEX IF NOT EXISTS idx_provenance_entity ON provenance(entity_type, entity_id);
    CREATE TABLE IF NOT EXISTS places(
      place_id TEXT PRIMARY KEY, canonical_name TEXT NOT NULL, place_type TEXT NOT NULL,
      start_date TEXT, end_date TEXT, parent_place_id TEXT,
      latitude REAL, longitude REAL, area REAL, geometry BLOB,
      attributes TEXT NOT NULL DEFAULT '{}', source_record_key TEXT
    );
    CREATE TABLE IF NOT EXISTS place_polity(
      place_id TEXT NOT NULL, polity_id TEXT NOT NULL,
      relationship TEXT NOT NULL DEFAULT 'spatial-footprint',
      PRIMARY KEY(place_id, polity_id)
    );
    CREATE INDEX IF NOT EXISTS idx_places_name ON places(canonical_name);
    CREATE INDEX IF NOT EXISTS idx_places_parent ON places(parent_place_id);
    CREATE INDEX IF NOT EXISTS idx_place_polity_polity ON place_polity(polity_id);
    CREATE INDEX IF NOT EXISTS idx_alias_lookup ON aliases(entity_type, alias);
    """)
    meta = {
      "store_name":"HISTORIX Master Store",
      "schema_version":"1.0.0",
      "roadmap_target":"Expansion 3",
      "expected_existing_polities":str(EXPECTED),
      "canonical_domains":"polities,places,events,wars,battles,people",
      "no_fabrication_rule":"Do not synthesize baseline records to satisfy the 1,583 count.",
      "source_baseline":"Cliopatria",
      "source_commit":CLI_COMMIT,
      "roadmap_status":"polity-intake-in-progress"
    }
    for k,v in meta.items():
        db.execute("INSERT OR REPLACE INTO store_meta(key,value) VALUES(?,?)",(k,v))
    db.commit()

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    started = now()
    with tempfile.TemporaryDirectory() as td:
        archive = Path(td) / "cliopatria.geojson.zip"
        urllib.request.urlretrieve(CLI_URL, archive)
        source_hash = hashlib.sha256(archive.read_bytes()).hexdigest()
        with zipfile.ZipFile(archive) as z:
            members = [n for n in z.namelist() if n.endswith(".geojson")]
            if not members:
                raise RuntimeError("Pinned Cliopatria archive contains no GeoJSON file")
            geojson_path = Path(td) / "cliopatria.geojson"
            with z.open(members[0]) as src, open(geojson_path,"wb") as dst:
                dst.write(src.read())
        data = json.loads(geojson_path.read_text(encoding="utf-8"))

    features = data.get("features", [])
    polity_features = []
    by_name = {}
    for f in features:
        p = f.get("properties") or {}
        typ = str(p.get("Type") or p.get("type") or "").upper()
        name = p.get("Name") or p.get("name")
        if typ == "POLITY" and name:
            rec = {
              "name": str(name),
              "from_year": p.get("FromYear"),
              "to_year": p.get("ToYear"),
              "wikidata_id": p.get("Wikidata") or p.get("WikidataID") or p.get("wikidata"),
              "wikipedia": p.get("Wikipedia") or p.get("wikipedia"),
              "seshat_id": p.get("SeshatID") or p.get("seshatid"),
              "member_of": p.get("MemberOf") or p.get("memberof"),
              "geometry": f.get("geometry"),
              "area": p.get("Area") or p.get("area"),
            }
            polity_features.append(rec)
            by_name.setdefault(str(name), []).append(rec)

    names = sorted(by_name)
    if len(names) != EXPECTED:
        raise RuntimeError(f"Cliopatria baseline mismatch: expected {EXPECTED} unique POLITY names, found {len(names)}")

    db = sqlite3.connect(DB)
    init_db(db)
    run_id = hashlib.sha256((CLI_COMMIT + started).encode()).hexdigest()[:20]
    db.execute("""INSERT INTO import_runs(run_id,source_name,source_hash,started_at,status,records_seen,notes)
                  VALUES(?,?,?,?,?,?,?)""",
               (run_id,"cliopatria.geojson.zip",source_hash,started,"running",len(polity_features),
                f"pinned commit {CLI_COMMIT}; unique POLITY names required={EXPECTED}"))
    db.execute("""INSERT OR REPLACE INTO sources(source_id,title,source_type,url,metadata)
                  VALUES(?,?,?,?,?)""",
               ("cliopatria-pinned","Cliopatria pinned polity baseline","geospatial-dataset",CLI_URL,
                json.dumps({"commit":CLI_COMMIT,"unique_polities":EXPECTED,"raw_features":len(features)})))

    created = updated = 0
    places_created = 0
    for name in names:
        rows = by_name[name]
        starts = [r["from_year"] for r in rows if isinstance(r["from_year"],int)]
        ends = [r["to_year"] for r in rows if isinstance(r["to_year"],int)]
        start = min(starts) if starts else None
        end = max(ends) if ends else None
        stable = "cliopatria:" + hashlib.sha1(name.encode("utf-8")).hexdigest()[:16]
        attrs = {
          "source":"Cliopatria",
          "source_commit":CLI_COMMIT,
          "raw_temporal_record_count":len(rows),
          "temporal_records":rows,
          "wikidata_ids":sorted({r["wikidata_id"] for r in rows if r["wikidata_id"]}),
          "wikipedia_pages":sorted({r["wikipedia"] for r in rows if r["wikipedia"]}),
          "seshat_ids":sorted({r["seshat_id"] for r in rows if r["seshat_id"]}),
          "member_of_values":sorted({r["member_of"] for r in rows if r["member_of"]})
        }
        existing = db.execute("SELECT polity_id FROM polities WHERE polity_id=?",(stable,)).fetchone()
        if existing:
            updated += 1
            db.execute("""UPDATE polities SET canonical_name=?,polity_type=?,start_date=?,end_date=?,
                          status=?,attributes=?,source_record_ids=? WHERE polity_id=?""",
                       (name,"historical-polity",str(start) if start is not None else None,
                        str(end) if end is not None else None,"cliopatria-imported",
                        json.dumps(attrs,ensure_ascii=False),json.dumps([name]),stable))
        else:
            created += 1
            db.execute("""INSERT INTO polities(polity_id,canonical_name,polity_type,start_date,end_date,status,
                          attributes,source_record_ids) VALUES(?,?,?,?,?,?,?,?)""",
                       (stable,name,"historical-polity",str(start) if start is not None else None,
                        str(end) if end is not None else None,"cliopatria-imported",
                        json.dumps(attrs,ensure_ascii=False),json.dumps([name])))
        db.execute("DELETE FROM provenance WHERE entity_type='polity' AND entity_id=? AND source_id=?",
                   (stable,"cliopatria-pinned"))
        db.execute("""INSERT INTO provenance(entity_type,entity_id,source_id,source_record_key,assertion,
                      confidence,retrieved_at,notes) VALUES(?,?,?,?,?,?,?,?)""",
                   ("polity",stable,"cliopatria-pinned",name,
                    "Canonical polity record imported from pinned Cliopatria POLITY rows",
                    "source-defined","",f"Cliopatria commit {CLI_COMMIT}"))
        for alias in sorted({r["wikipedia"] for r in rows if r["wikipedia"]}):
            db.execute("INSERT INTO aliases(entity_type,entity_id,alias,language,source_id) VALUES(?,?,?,?,?)",
                       ("polity",stable,alias,None,"cliopatria-pinned"))

    # Expansion 1 first pass: materialize every source-backed spatial footprint as a canonical place.
    # These are actual Cliopatria POLITY geometries, not invented cities or regions.
    for name in names:
        stable = "cliopatria:" + hashlib.sha1(name.encode("utf-8")).hexdigest()[:16]
        for row in by_name[name]:
            geom = row.get("geometry")
            if not geom:
                continue
            raw_geom = json.dumps(geom, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
            geom_hash = hashlib.sha256(raw_geom).hexdigest()[:20]
            place_id = "cliopatria-place:" + hashlib.sha1(
                (name + "|" + str(row.get("from_year")) + "|" + str(row.get("to_year")) + "|" + geom_hash).encode("utf-8")
            ).hexdigest()[:20]
            lon = lat = None
            if geom.get("type") == "Point" and isinstance(geom.get("coordinates"), list) and len(geom["coordinates"]) >= 2:
                lon, lat = float(geom["coordinates"][0]), float(geom["coordinates"][1])
            attrs = {
                "source": "Cliopatria", "source_commit": CLI_COMMIT,
                "geometry_type": geom.get("type"),
                "geometry_sha256": hashlib.sha256(raw_geom).hexdigest(),
                "wikidata_id": row.get("wikidata_id"), "wikipedia": row.get("wikipedia"),
                "seshat_id": row.get("seshat_id"), "member_of": row.get("member_of")
            }
            db.execute("""INSERT OR REPLACE INTO places(
                place_id,canonical_name,place_type,start_date,end_date,latitude,longitude,area,geometry,attributes,source_record_key
            ) VALUES(?,?,?,?,?,?,?,?,?,?,?)""", (
                place_id, name, "territorial-footprint",
                str(row.get("from_year")) if row.get("from_year") is not None else None,
                str(row.get("to_year")) if row.get("to_year") is not None else None,
                lat, lon, row.get("area"), sqlite3.Binary(zlib.compress(raw_geom, 9)),
                json.dumps(attrs, ensure_ascii=False), name
            ))
            db.execute("""INSERT OR REPLACE INTO place_polity(place_id,polity_id,relationship)
                         VALUES(?,?,?)""", (place_id, stable, "spatial-footprint"))
            db.execute("""INSERT OR REPLACE INTO provenance(
                entity_type,entity_id,source_id,source_record_key,assertion,confidence,retrieved_at,notes
            ) VALUES(?,?,?,?,?,?,?,?)""", (
                "place", place_id, "cliopatria-pinned", name,
                "Source-backed territorial footprint imported from Cliopatria POLITY geometry",
                "source-defined", now(), f"Cliopatria commit {CLI_COMMIT}"
            ))
            places_created += 1

    db.execute("""UPDATE import_runs SET completed_at=?,status=?,records_created=?,records_updated=?,
                  records_rejected=?,notes=? WHERE run_id=?""",
               (now(),"completed",created,updated,0,
                f"raw POLITY features={len(polity_features)}; unique POLITY names={len(names)}",
                run_id))
    db.execute("INSERT OR REPLACE INTO store_meta(key,value) VALUES('current_polity_count',?)",(str(len(names)),))
    db.execute("INSERT OR REPLACE INTO store_meta(key,value) VALUES('roadmap_status',?)",
               ("polity-baseline-imported; enrichment not yet started",))
    db.commit()

    report = {
      "status":"completed",
      "run_id":run_id,
      "database":str(DB),
      "source":{"dataset":"Cliopatria","commit":CLI_COMMIT,"url":CLI_URL,"sha256":source_hash},
      "raw_geojson_features":len(features),
      "polity_features":len(polity_features),
      "unique_polities":len(names),
      "expected_unique_polities":EXPECTED,
      "created":created,"updated":updated,"places_created":places_created,"rejected":0,
      "next_step":"Expansion 1 continuing: place hierarchy and non-polity geographic entities"
    }
    REPORT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(report,indent=2))

if __name__ == "__main__":
    main()
