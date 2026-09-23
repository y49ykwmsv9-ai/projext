#!/usr/bin/env python3
"""Build the extensive HISTORIX GeoNames place-gazetteer layer.

GeoNames is used as a source-backed geographic gazetteer, not as proof of
historical identity. Cities500 contains roughly 185,000 populated places
worldwide. Records retain stable GeoNames IDs and are kept separate from
HISTORIX-curated/Wikidata identities until an explicit identity merge is
verified.

The source is bundled into partitioned JSON files for lazy runtime loading.
"""
from __future__ import annotations
import json, re, urllib.request, zipfile, io
from collections import defaultdict
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
LIB=ROOT/"data/history-library"
OUT=LIB/"places/gazetteer"
INDEX=LIB/"places/gazetteer-index.json"
NAME_INDEX=LIB/"places/gazetteer-name-index.json"
MANIFEST=LIB/"HISTORIX-1.5-manifest.json"
CATALOG=LIB/"catalog.json"
URL="https://download.geonames.org/export/dump/cities500.zip"

def download():
    req=urllib.request.Request(URL,headers={"User-Agent":"HISTORIX/1.5 GeoNames importer"})
    with urllib.request.urlopen(req,timeout=120) as r:
        return r.read()

def make_record(cols):
    gid,name,ascii_name,alts,lat,lon,fc,code,country,cc2,admin1,admin2,admin3,admin4,pop,elev,dem,timezone,modified=cols[:19]
    cc=(country or "XX").upper()
    alt=[x.strip() for x in (alts or "").split(",") if x.strip()]
    try: latitude=float(lat); longitude=float(lon)
    except Exception: return None
    try: population=int(pop or 0)
    except Exception: population=0
    return {
      "id":f"geonames:{gid}",
      "identity":{
        "canonical_name":name,
        "alternate_names":sorted(set(x for x in alt if x and x!=name))[:64],
        "place_type":code or "P",
        "wikidata_id":None
      },
      "chronology":{"start":None,"end":None,"date_precision":"not-stated"},
      "geography":{
        "latitude":latitude,"longitude":longitude,
        "country_ids":[f"geonames-country:{cc}"],
        "region_ids":[f"geonames-admin1:{cc}.{admin1}" ] if admin1 else [],
        "admin_parent_ids":[]
      },
      "hierarchy":{"parent_place_ids":[],"child_place_ids":[]},
      "associations":{"polity_ids":[],"event_ids":[],"person_ids":[]},
      "evidence":{
        "source_ids":["geonames-cities500"],
        "confidence":"source-linked",
        "source_links":[f"https://www.geonames.org/{gid}/"]
      },
      "uncertainty":{
        "unknowns":["historical chronology","historical polity linkage"],
        "disputes":[]
      },
      "editorial":{
        "status":"source-linked",
        "last_reviewed":None,
        "notes":f"GeoNames populated-place gazetteer record. Population={population}; source data are not treated as historical chronology."
      }
    }

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    raw=download()
    by_country=defaultdict(list)
    with zipfile.ZipFile(io.BytesIO(raw)) as z:
        member=next(n for n in z.namelist() if n.endswith(".txt"))
        with z.open(member) as f:
            for rawline in f:
                cols=rawline.decode("utf-8").rstrip("\n").split("\t")
                if len(cols)<19: continue
                r=make_record(cols)
                if r: by_country[(cols[8] or "XX").upper()].append(r)

    files=[]
    total=0
    name_index=defaultdict(set)
    for cc,rows in sorted(by_country.items()):
        rows.sort(key=lambda r:r["id"])
        path=OUT/f"{cc}.json"
        payload={"schema_version":"1.5.0","database":"HISTORIX","kind":"source-backed-place-gazetteer",
                 "source":"geonames-cities500","country_code":cc,"record_count":len(rows),"records":rows}
        path.write_text(json.dumps(payload,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8")
        files.append({"country_code":cc,"path":f"data/history-library/places/gazetteer/{cc}.json","record_count":len(rows)})
        for r in rows:
            names=[r["identity"]["canonical_name"],*r["identity"].get("alternate_names",[])]
            for n in names:
                key=re.sub(r"[^a-z0-9]+"," ",n.lower()).strip()
                if key: name_index[key].add(cc)
        total+=len(rows)

    NAME_INDEX.write_text(json.dumps({"schema_version":"1.5.0","database":"HISTORIX","kind":"place-gazetteer-name-index","names":{k:sorted(v) for k,v in sorted(name_index.items())}},ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8")
    INDEX.write_text(json.dumps({
      "schema_version":"1.5.0","database":"HISTORIX","kind":"place-gazetteer-index",
      "source":"GeoNames cities500","source_url":URL,
      "license":"CC BY 4.0","license_url":"https://creativecommons.org/licenses/by/4.0/",
      "record_count":total,"partition_count":len(files),"partitions":files
    },ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    if MANIFEST.exists():
        manifest=json.loads(MANIFEST.read_text())
        manifest["gazetteer"]={"source":"GeoNames cities500","record_count":total,"partition_count":len(files),"index":"data/history-library/places/gazetteer-index.json","name_index":"data/history-library/places/gazetteer-name-index.json","license":"CC BY 4.0"}
        MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n")
    if CATALOG.exists():
        catalog=json.loads(CATALOG.read_text())
        catalog["place_gazetteer"]={"version":"1.5.0","record_count":total,"storage":"data/history-library/places/gazetteer/","index":"data/history-library/places/gazetteer-index.json","name_index":"data/history-library/places/gazetteer-name-index.json","source":"GeoNames cities500","license":"CC BY 4.0"}
        CATALOG.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+"\n")
    print(f"HISTORIX GeoNames place gazetteer built: {total} records in {len(files)} country partitions")

if __name__=="__main__":
    main()
