#!/usr/bin/env python3
"""Build HISTORIX 1.5 canonical places and a source-backed geographic hierarchy.

Seeds:
1. Existing HISTORIX curated places, preserving their stable IDs.
2. Wikidata IDs explicitly supplied by the pinned Cliopatria polity records.
   Their P36 capital claims are then used as place seeds. This avoids the old
   failure mode where the complete 1,583-polity layer existed but only a small
   curated place set was materialized.
3. Administrative parents/countries recursively from trusted place IDs.

The output is bundled into HISTORIX. Runtime applications do not need Wikidata.
"""
from __future__ import annotations
import json, time, urllib.error, urllib.parse, urllib.request
from datetime import date
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
LIB=ROOT/"data/history-library"
GRAPH=LIB/"graph/curated-records.json"
POLITIES=LIB/"polities/historix-linked.json"
OUTDIR=LIB/"places"
OUT=OUTDIR/"historix-places.json"
MANIFEST=LIB/"HISTORIX-1.5-manifest.json"

def api(ids):
    if not ids: return {}
    u="https://www.wikidata.org/w/api.php?"+urllib.parse.urlencode({
        "action":"wbgetentities","ids":"|".join(sorted(ids)),
        "props":"labels|aliases|descriptions|claims|sitelinks",
        "languages":"en","sitefilter":"enwiki","format":"json"
    })
    req=urllib.request.Request(u,headers={
        "User-Agent":"HISTORIX/1.5 (canonical historical database build)",
        "Accept-Encoding":"gzip,deflate"
    })
    for attempt in range(8):
        try:
            with urllib.request.urlopen(req,timeout=45) as r:
                return json.loads(r.read().decode())
        except urllib.error.HTTPError as exc:
            if exc.code not in {429,500,502,503,504} or attempt==7:
                raise
            retry_after=exc.headers.get("Retry-After")
            delay=int(retry_after) if retry_after and retry_after.isdigit() else min(30,2**attempt)
            time.sleep(delay)
        except Exception:
            if attempt==7: raise
            time.sleep(min(30,2**attempt))
    return {}

def qclaims(e,p):
    out=[]
    for c in e.get("claims",{}).get(p,[]):
        dv=c.get("mainsnak",{}).get("datavalue",{})
        if dv.get("type")=="wikibase-entityid":
            out.append("Q"+str(dv["value"]["numeric-id"]))
        elif dv.get("type")=="globecoordinate":
            out.append({"lat":dv["value"]["latitude"],"lon":dv["value"]["longitude"]})
        elif dv.get("type")=="time":
            raw=dv["value"]["time"]
            try: out.append(int(raw[1:5]) if raw[0]=="+" else -int(raw[1:5]))
            except Exception: pass
    return out

def label(e):
    return e.get("labels",{}).get("en",{}).get("value")

def aliases(e):
    return [x["value"] for x in e.get("aliases",{}).get("en",[]) if x.get("value")]

def make_wd(q,e):
    coords=next((x for x in qclaims(e,"P625") if isinstance(x,dict)),None)
    parents=[x for x in qclaims(e,"P131") if isinstance(x,str)]
    countries=[x for x in qclaims(e,"P17") if isinstance(x,str)]
    types=[x for x in qclaims(e,"P31") if isinstance(x,str)]
    starts=[x for x in qclaims(e,"P571") if isinstance(x,int)]
    ends=[x for x in qclaims(e,"P576") if isinstance(x,int)]
    wiki=e.get("sitelinks",{}).get("enwiki",{}).get("title")
    return {
      "id":"wikidata:"+q,
      "identity":{"canonical_name":label(e) or q,"alternate_names":sorted(set(aliases(e))),
                  "place_type":"wikidata-entity","wikidata_id":q},
      "chronology":{"start":min(starts) if starts else None,"end":max(ends) if ends else None,
                    "date_precision":"wikidata-inception-dissolution" if starts or ends else "not-stated"},
      "geography":{"latitude":coords["lat"] if coords else None,"longitude":coords["lon"] if coords else None,
                   "country_ids":["wikidata:"+x for x in countries],
                   "region_ids":[],"admin_parent_ids":["wikidata:"+x for x in parents]},
      "hierarchy":{"parent_place_ids":["wikidata:"+x for x in parents],
                   "child_place_ids":[]},
      "associations":{"polity_ids":[],"event_ids":[],"person_ids":[]},
      "evidence":{"source_ids":["wikidata"],"confidence":"source-linked",
                  "source_links":[f"https://www.wikidata.org/wiki/{q}"] + ([f"https://en.wikipedia.org/wiki/{urllib.parse.quote(wiki.replace(' ','_'))}"] if wiki else [])},
      "uncertainty":{"unknowns":[] if coords else ["coordinates"],"disputes":[]},
      "editorial":{"status":"research-enriched","last_reviewed":None,
                   "notes":"Canonical place materialized from a source-supplied Wikidata identifier; no name-based identity guessing."}
    }

def main():
    OUTDIR.mkdir(parents=True,exist_ok=True)
    graph=json.loads(GRAPH.read_text())
    pol=json.loads(POLITIES.read_text())

    records={}
    for p in graph.get("places",[]):
        records[p["id"]]={
          "id":p["id"],
          "identity":{"canonical_name":p["name"],"alternate_names":[],
                      "place_type":"curated-place","wikidata_id":None},
          "chronology":{"start":p.get("start"),"end":p.get("end"),
                        "date_precision":"curated-record"},
          "geography":{"latitude":(p.get("location") or {}).get("lat"),
                       "longitude":(p.get("location") or {}).get("lon"),
                       "country_ids":[],"region_ids":[],"admin_parent_ids":[]},
          "hierarchy":{"parent_place_ids":[],"child_place_ids":[]},
          "associations":{"polity_ids":p.get("related_polities",[]),"event_ids":[],"person_ids":[]},
          "evidence":{"source_ids":[p.get("source","historix-curated")],"confidence":p.get("confidence","medium"),
                      "source_links":[]},
          "uncertainty":{"unknowns":[],"disputes":[]},
          "editorial":{"status":"curated-preserved","last_reviewed":None,
                       "notes":"Stable HISTORIX 1.1 place record preserved as the canonical seed."}
        }

    polity_qids=set()
    direct_capital_qids=set()
    for p in pol.get("records",[]):
        for q in p.get("research",{}).get("wikidata_ids",[]):
            if isinstance(q,str) and q.startswith("Q"):
                polity_qids.add(q)
        for q in p.get("geography",{}).get("capital_wikidata_ids",[]):
            if isinstance(q,str) and q.startswith("Q"):
                direct_capital_qids.add(q)

    polity_entities={}
    qlist=sorted(polity_qids)
    for i in range(0,len(qlist),50):
        got=api(qlist[i:i+50]).get("entities",{})
        polity_entities.update(got)
        time.sleep(.2)

    capital_qids=set(direct_capital_qids)
    polity_capital_map={}
    for p in pol.get("records",[]):
        pid=p["id"]
        qs={q for q in p.get("geography",{}).get("capital_wikidata_ids",[]) if isinstance(q,str) and q.startswith("Q")}
        for q in p.get("research",{}).get("wikidata_ids",[]):
            e=polity_entities.get(q)
            if e:
                qs.update(x for x in qclaims(e,"P36") if isinstance(x,str) and x.startswith("Q"))
        if qs:
            polity_capital_map[pid]=sorted(qs)
            capital_qids.update(qs)

    seeds=set(capital_qids)

    # Expand four parent/country levels from trusted place IDs.
    frontier=set(seeds)
    fetched={}
    for depth in range(5):
        if not frontier: break
        batch=sorted(frontier - set(fetched))
        for i in range(0,len(batch),50):
            got=api(batch[i:i+50]).get("entities",{})
            fetched.update(got)
            time.sleep(.2)
        nxt=set()
        for q,e in fetched.items():
            for parent in qclaims(e,"P131"):
                if isinstance(parent,str) and parent not in fetched:
                    nxt.add(parent)
            for country in qclaims(e,"P17"):
                if isinstance(country,str) and country not in fetched:
                    nxt.add(country)
        frontier=nxt

    for q,e in fetched.items():
        if q.startswith("Q"):
            records["wikidata:"+q]=make_wd(q,e)

    # Link canonical place associations from already-enriched polities.
    for p in pol.get("records",[]):
        pid=p["id"]
        for q in polity_capital_map.get(pid,[]):
            key="wikidata:"+q
            if key in records:
                records[key]["associations"]["polity_ids"]=sorted(set(records[key]["associations"]["polity_ids"]+[pid]))
        for key in p.get("associated_place_ids",[]):
            if key in records:
                records[key]["associations"]["polity_ids"]=sorted(set(records[key]["associations"]["polity_ids"]+[pid]))

    # Materialize hierarchy edges only among bundled records.
    for r in records.values():
        parents=[x for x in r["hierarchy"]["parent_place_ids"] if x in records]
        r["hierarchy"]["parent_place_ids"]=sorted(set(parents))
        for parent in parents:
            records[parent]["hierarchy"]["child_place_ids"]=sorted(set(records[parent]["hierarchy"]["child_place_ids"]+[r["id"]]))

    rows=sorted(records.values(),key=lambda x:x["id"])
    payload={"schema_version":"1.5.0","database":"HISTORIX","kind":"canonical_places",
             "record_count":len(rows),"source_policy":{
               "identity":"existing HISTORIX IDs or source-supplied Wikidata IDs only",
               "runtime":"bundled; no runtime external API dependency"
             },"records":rows}
    OUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n")
    manifest={"schema_version":"1.5.0","database":"HISTORIX","version":"1.5.0",
              "layer":"canonical-places-and-geographic-hierarchy","status":"source-backed-expanded",
              "record_count":len(rows),"storage":"data/history-library/places/historix-places.json",
              "sources":["historix-curated-places","wikidata"],
              "identity_rule":"preserve existing place IDs; materialize only source-supplied Wikidata IDs; never infer identity from names",
              "next_step":"verified historical place aliases, time-varying administrative hierarchy, and place-time coverage tests"}
    MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n")
    catalog_path=LIB/"catalog.json"; catalog=json.loads(catalog_path.read_text())
    catalog["place_layer"]={"version":"1.5.0","record_count":len(rows),
      "storage":"data/history-library/places/historix-places.json",
      "schema":"data/history-library/places/schema.json","manifest":"data/history-library/HISTORIX-1.5-manifest.json",
      "scope_note":"Canonical place seeds plus source-backed capital and geographic hierarchy expansion. No name-based identity guessing."}
    catalog["version"]="1.5.0"; catalog["schema_version"]="1.5.0"
    catalog_path.write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+"\n")
    print(f"HISTORIX 1.5 places built: {len(rows)} records from {len(polity_qids)} trusted polity IDs and {len(seeds)} trusted place seeds")

if __name__=="__main__": main()
