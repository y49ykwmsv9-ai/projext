#!/usr/bin/env python3
"""Research-enrich the complete 1,583-polity HISTORIX 1.4 layer from Wikidata.

The script uses Wikidata entity IDs already supplied by Cliopatria. It does not
guess identities from names. Only fields returned by Wikidata are copied, with
explicit provenance and retrieval timestamps.
"""
from __future__ import annotations
import json, os, time, urllib.parse, urllib.request
from datetime import date
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
POLITY_DIR=ROOT/"data/history-library/polities"
AGG=POLITY_DIR/"historix-linked.json"

def get_json(url):
    req=urllib.request.Request(url,headers={
        "User-Agent":"HISTORIX/1.4 research pipeline (historical database build)",
        "Accept":"application/json"
    })
    last=None
    for attempt in range(7):
        try:
            with urllib.request.urlopen(req,timeout=45) as r:
                return json.loads(r.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            last=exc
            if exc.code not in {429,500,502,503,504} or attempt==6:
                raise
            retry_after=exc.headers.get("Retry-After")
            delay=int(retry_after) if retry_after and retry_after.isdigit() else min(30,5*(attempt+1))
            time.sleep(delay)
    raise last

def main():
    payload=json.loads(AGG.read_text(encoding="utf-8"))
    records=payload["records"]
    ids={}
    wikipedia_titles={}
    for r in records:
        for tr in r.get("temporal_records",[]):
            q=tr.get("wikidata_id")
            if isinstance(q,str) and q.startswith("Q"):
                ids.setdefault(q,[]).append(r["id"])
            wp=tr.get("wikipedia")
            if isinstance(wp,str) and wp.strip():
                title=wp.strip()
                if "wikipedia.org/wiki/" in title:
                    title=urllib.parse.unquote(title.split("/wiki/",1)[1]).replace("_"," ")
                wikipedia_titles.setdefault(title,[]).append(r["id"])

    # When Cliopatria supplied a Wikipedia page but no Wikidata ID, resolve the
    # page's own Wikibase item property. This remains source-linked identity
    # resolution, not name-based guessing.
    resolved_qids_by_record={rid:set() for r in records for rid in [r["id"]]}
    if wikipedia_titles:
        titles=sorted(wikipedia_titles)
        for i in range(0,len(titles),50):
            url="https://en.wikipedia.org/w/api.php?"+urllib.parse.urlencode({
                "action":"query","format":"json","prop":"pageprops",
                "ppprop":"wikibase_item","redirects":1,
                "titles":"|".join(titles[i:i+50])
            })
            data=get_json(url)
            for page in data.get("query",{}).get("pages",{}).values():
                q=page.get("pageprops",{}).get("wikibase_item")
                title=page.get("title")
                if q and title:
                    for rid in wikipedia_titles.get(title,[]):
                        ids.setdefault(q,[]).append(rid)
                        resolved_qids_by_record.setdefault(rid,set()).add(q)
            time.sleep(0.15)

    qids=sorted(ids)
    enriched={}
    for i in range(0,len(qids),50):
        batch=qids[i:i+50]
        url="https://www.wikidata.org/w/api.php?"+urllib.parse.urlencode({
            "action":"wbgetentities","ids":"|".join(batch),"format":"json",
            "props":"labels|aliases|descriptions|claims|sitelinks",
            "languages":"en",
            "sitefilter":"enwiki"
        })
        data=get_json(url)
        enriched.update(data.get("entities",{}))
        time.sleep(0.15)

    # Wikipedia summaries are optional because Wikimedia rate limits can make
    # the canonical identity pass unnecessarily slow. Identity, aliases, claims,
    # and sitelinks remain source-backed; summaries can be enabled for a later
    # research pass without blocking the canonical build.
    wiki={}
    if os.environ.get("HISTORIX_FETCH_WIKIPEDIA_SUMMARIES","0")=="1":
        titles=sorted({e.get("sitelinks",{}).get("enwiki",{}).get("title") for e in enriched.values() if e.get("sitelinks",{}).get("enwiki",{}).get("title")})
        for i in range(0,len(titles),50):
            batch=titles[i:i+50]
            url="https://en.wikipedia.org/w/api.php?"+urllib.parse.urlencode({
                "action":"query","format":"json","prop":"extracts|info","exintro":1,
                "explaintext":1,"inprop":"url","redirects":1,"titles":"|".join(batch)
            })
            data=get_json(url)
            for page in data.get("query",{}).get("pages",{}).values():
                title=page.get("title")
                if title:
                    wiki[title]={"summary":page.get("extract"),"url":page.get("fullurl")}
            time.sleep(0.15)

    today=str(date.today())
    for r in records:
        qids_for_record=sorted(({tr.get("wikidata_id") for tr in r.get("temporal_records",[]) if isinstance(tr.get("wikidata_id"),str) and tr.get("wikidata_id","").startswith("Q")} | resolved_qids_by_record.get(r["id"],set())))
        entities=[enriched[q] for q in qids_for_record if q in enriched and "missing" not in enriched[q]]
        if not entities:
            r["research"]= {
                "status":"source-linked",
                "sources":["cliopatria-pinned","wikipedia-pageprops"] if resolved_qids_by_record.get(r["id"]) else ["cliopatria-pinned"],
                "wikidata_ids":qids_for_record,
                "notes":"No resolvable Wikidata entity was supplied by the Cliopatria source record; no identity was guessed."
            }
            continue
        e=entities[0]
        labels=e.get("labels",{})
        aliases=e.get("aliases",{}).get("en",[])
        desc=e.get("descriptions",{}).get("en",{}).get("value")
        sitelink=e.get("sitelinks",{}).get("enwiki",{}).get("title")
        wiki_page=wiki.get(sitelink,{})
        r["identity"]["alternate_names"]=sorted({a["value"] for a in aliases if a.get("value")} | {labels.get("en",{}).get("value","")}) if labels.get("en") else sorted({a["value"] for a in aliases if a.get("value")})
        r["research"]={
            "status":"research-enriched",
            "sources":["cliopatria-pinned","wikidata"],
            "retrieved_at":today,
            "wikidata_ids":qids_for_record,
            "wikidata_label":labels.get("en",{}).get("value"),
            "wikidata_description":desc,
            "wikipedia_en_title":sitelink,
            "wikipedia_en_url":wiki_page.get("url"),
            "wikipedia_en_summary":wiki_page.get("summary"),
            "identity_method":"Cliopatria-supplied WikidataID or Cliopatria-supplied Wikipedia pageprops; no name-based matching",
            "notes":"Wikidata fields are source-derived and should be reviewed when conflicting historical identities or naming conventions occur."
        }
        r["editorial"]["status"]="research-enriched"
        r["editorial"]["last_reviewed"]=today
        r["editorial"]["notes"]="Enriched from the Wikidata entity explicitly linked by Cliopatria; identity was not inferred from name similarity."
        r["evidence"]["source_ids"]=["cliopatria-pinned","wikidata"]
        r["evidence"]["confidence"]="medium"

    payload["research_layer"]={
        "source":"Wikidata",
        "method":"Cliopatria-provided Wikidata IDs plus Cliopatria-provided Wikipedia pageprops",
        "retrieved_at":today,
        "resolved_entities":sum(1 for r in records if r.get("research",{}).get("status")=="research-enriched"),
        "wikipedia_summaries":sum(1 for r in records if r.get("research",{}).get("wikipedia_en_summary")),
        "summary_mode":os.environ.get("HISTORIX_FETCH_WIKIPEDIA_SUMMARIES","0"),
        "unresolved_entities":sum(1 for r in records if r.get("research",{}).get("status")!="research-enriched")
    }
    AGG.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    # Keep individual files synchronized with the aggregate.
    by_id={r["id"]:r for r in records}
    for path in POLITY_DIR.glob("cliopatria-*.json"):
        if path.stem in by_id:
            path.write_text(json.dumps(by_id[path.stem],ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(payload["research_layer"]))

if __name__=="__main__":
    main()
