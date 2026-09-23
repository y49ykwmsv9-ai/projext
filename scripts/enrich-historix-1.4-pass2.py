#!/usr/bin/env python3
"""HISTORIX 1.4 enrichment pass 2: normalize source-backed chronology and geography."""
import json, re, urllib.parse, urllib.request, time
from datetime import date
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; AGG=ROOT/"data/history-library/polities/historix-linked.json"

def get_json(url):
    req=urllib.request.Request(url,headers={"User-Agent":"HISTORIX/1.4"})
    with urllib.request.urlopen(req,timeout=30) as r: return json.loads(r.read().decode())
def claims(e,p):
    out=[]
    for c in e.get("claims",{}).get(p,[]):
        sn=c.get("mainsnak",{}); dv=sn.get("datavalue",{})
        if dv.get("type")=="wikibase-entityid": out.append("Q"+str(dv["value"]["numeric-id"]))
        elif dv.get("type")=="globecoordinate": out.append({"lat":dv["value"]["latitude"],"lon":dv["value"]["longitude"]})
        elif dv.get("type")=="time": out.append(dv["value"]["time"])
    return out
def main():
    payload=json.loads(AGG.read_text(encoding="utf-8")); qids=sorted({tr.get("wikidata_id") for r in payload["records"] for tr in r.get("temporal_records",[]) if isinstance(tr.get("wikidata_id"),str) and tr["wikidata_id"].startswith("Q")})
    entities={}
    for i in range(0,len(qids),50):
        u="https://www.wikidata.org/w/api.php?"+urllib.parse.urlencode({"action":"wbgetentities","ids":"|".join(qids[i:i+50]),"format":"json","props":"claims","languages":"en"})
        entities.update(get_json(u).get("entities",{})); time.sleep(.15)
    today=str(date.today())
    for r in payload["records"]:
        q=next((tr.get("wikidata_id") for tr in r.get("temporal_records",[]) if tr.get("wikidata_id") in entities),None)
        e=entities.get(q,{})
        coords=claims(e,"P625"); inst=claims(e,"P31"); caps=claims(e,"P36"); preds=claims(e,"P155"); succs=claims(e,"P156"); rulers=claims(e,"P35")
        if coords:
            c=coords[0]; r["geography"]["centroid"]={"lat":c["lat"],"lon":c["lon"],"source":"wikidata","entity_id":q}
        if caps: r["geography"]["capital_wikidata_ids"]=sorted(set(caps))
        r["identity"]["wikidata_instance_ids"]=sorted(set(inst))
        r["predecessors"]=sorted(set(preds)); r["successors"]=sorted(set(succs)); r["rulers"]=sorted(set(rulers))
        r["research"]["geography_method"]="Wikidata claims P625/P36; succession P155/P156; rulers P35" if e else "Cliopatria only"
        r["research"]["retrieved_at"]=today
    payload["enrichment_pass_2"]={"name":"chronology-geography-succession","completed_at":today,"scope":"existing 1,583 polities only","new_records":0}
    AGG.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    by={r["id"]:r for r in payload["records"]}
    for p in AGG.parent.glob("cliopatria-*.json"):
        if p.stem in by: p.write_text(json.dumps(by[p.stem],ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("pass 2 complete:",len(payload["records"]),"records; new records=0")
if __name__=="__main__": main()
