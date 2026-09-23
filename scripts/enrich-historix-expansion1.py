#!/usr/bin/env python3
import datetime as dt,hashlib,json,re,sqlite3,urllib.request,zlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]; DB=ROOT/"data/historix-master/historix_master.sqlite"; REPORT=ROOT/"data/historix-master/expansion1_report.json"
NE="ca96624a56bd078437bca8184e78163e5039ad19"; BASE=f"https://raw.githubusercontent.com/nvkelso/natural-earth-vector/{NE}/geojson/"
FILES={"admin0":"ne_10m_admin_0_countries_iso.geojson","admin1":"ne_10m_admin_1_states_provinces.geojson","populated":"ne_10m_populated_places.geojson"}
def now(): return dt.datetime.now(dt.timezone.utc).isoformat()
def norm(x): return re.sub(r"[^a-z0-9]+"," ",str(x or "").lower()).strip()
def yr(x):
 try:return int(float(x))
 except:return None
def get(url):
 with urllib.request.urlopen(url,timeout=180) as r:return json.load(r)
def gh(g):
 b=json.dumps(g,separators=(",",":"),ensure_ascii=False).encode();return b,hashlib.sha256(b).hexdigest()
def prop(p,*names):
 for n in names:
  if n in p and p[n] not in (None,""): return p[n]
  for k,v in p.items():
   if str(k).lower()==n.lower() and v not in (None,""): return v
 return None
def pid(prefix,key): return prefix+":"+hashlib.sha1(key.encode()).hexdigest()[:24]
def add(c,place_id,name,typ,geom=None,start=None,end=None,parent=None,lat=None,lon=None,area=None,attrs=None,key=None,source="natural-earth-pinned"):
 a=dict(attrs or {}); b=h=None
 if geom is not None:b,h=gh(geom)
 a["geographic_identity_key"]=f"{typ}|{source}|{key or norm(name)}|{h or 'nogeom'}"; a["source_id"]=source
 blob=sqlite3.Binary(zlib.compress(b,9)) if b else None
 c.execute("INSERT OR REPLACE INTO places(place_id,canonical_name,place_type,start_date,end_date,parent_place_id,latitude,longitude,area,geometry,attributes,source_record_key) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",(place_id,name,typ,start,end,parent,lat,lon,area,blob,json.dumps(a,ensure_ascii=False),key))
 c.execute("INSERT OR REPLACE INTO provenance(entity_type,entity_id,source_id,source_record_key,assertion,confidence,retrieved_at,notes) VALUES(?,?,?,?,?,?,?,?)",("place",place_id,source,key,"Source-backed geographic entity","source-defined",now(),NE if source=="natural-earth-pinned" else "Cliopatria"))
def rel(c,ch,pa,typ,src,key):
 if not ch or not pa or ch==pa:return
 c.execute("INSERT OR IGNORE INTO place_relations(child_place_id,parent_place_id,relation_type,source_id,source_record_key,confidence) VALUES(?,?,?,?,?,?)",(ch,pa,typ,src,key,"source-defined"))
 c.execute("UPDATE places SET parent_place_id=? WHERE place_id=? AND parent_place_id IS NULL",(pa,ch))
def main():
 c=sqlite3.connect(DB);c.executescript("""CREATE TABLE IF NOT EXISTS place_relations(relation_id INTEGER PRIMARY KEY AUTOINCREMENT,child_place_id TEXT NOT NULL,parent_place_id TEXT NOT NULL,relation_type TEXT NOT NULL,source_id TEXT NOT NULL,source_record_key TEXT,confidence TEXT,UNIQUE(child_place_id,parent_place_id,relation_type,source_id));CREATE INDEX IF NOT EXISTS idx_prc ON place_relations(child_place_id);CREATE INDEX IF NOT EXISTS idx_prp ON place_relations(parent_place_id);CREATE TABLE IF NOT EXISTS place_identity_audit(identity_key TEXT PRIMARY KEY,canonical_place_id TEXT NOT NULL,duplicate_count INTEGER NOT NULL,source_domains TEXT NOT NULL,status TEXT NOT NULL)""")
 c.execute("INSERT OR REPLACE INTO sources VALUES(?,?,?,?,?)",("natural-earth-pinned","Natural Earth 10m geographic reference layers","geospatial-dataset",BASE,json.dumps({"commit":NE,"layers":FILES})))
 # A temporal Cliopatria footprint is not a duplicate merely because it represents the same named polity.
 # Identity therefore includes source record, geometry, and temporal interval.
 for p,s,a,sd,ed,gblob in c.execute("select place_id,source_record_key,attributes,start_date,end_date,geometry from places where place_id like 'cliopatria-place:%'").fetchall():
  d=json.loads(a or "{}")
  if not d.get("geographic_identity_key"):
   geom_hash="nogeom"
   if gblob:
    try: geom_hash=hashlib.sha256(zlib.decompress(gblob)).hexdigest()
    except Exception: pass
   d["geographic_identity_key"]=f"territorial-footprint|Cliopatria|{s or p}|{geom_hash}|{sd or ''}|{ed or ''}"
   d["source_id"]="Cliopatria"
   c.execute("update places set attributes=? where place_id=?",(json.dumps(d,ensure_ascii=False),p))
 pol={n:i for n,i in c.execute("select canonical_name,polity_id from polities")}; pn={norm(n):i for n,i in pol.items()}; member=0
 for p,n,a in c.execute("select place_id,canonical_name,attributes from places where place_id like 'cliopatria-place:%'").fetchall():
  m=json.loads(a or "{}").get("member_of")
  for v in [x.strip().strip("() ") for x in str(m or "").split(";") if x.strip()]:
   q=pol.get(v) or pn.get(norm(v))
   if q:c.execute("insert or ignore into place_polity values(?,?,?)",(p,q,"member-of-context"));member+=1
 d={k:get(BASE+v).get("features",[]) for k,v in FILES.items()}; a0=d["admin0"];a1=d["admin1"];pp=d["populated"]
 c0={}; c1={str(prop(f.get("properties")or{},"adm1_code") or ""):f for f in a1}
 counts={"admin0":0,"admin1":0,"populated":0}
 for f in a0:
  p=f.get("properties")or{};g=f.get("geometry");n=prop(p,"name","name_en","name_long");k=str(prop(p,"adm0_a3","iso_a3","sov_a3") or "")
  if n and k and g:
   _,h=gh(g); place_id=pid("ne0",k+"|"+h); add(c,place_id,n,"administrative-country",geom=g,key=k+"|"+h,attrs={"dataset":"Natural Earth","layer":"admin-0","adm0_a3":k,"iso_a3":prop(p,"iso_a3"),"temporal_status":"current-reference"}); c0.setdefault(k,[]).append(place_id); counts["admin0"]+=1
 for f in a1:
  p=f.get("properties")or{};g=f.get("geometry");n=prop(p,"name","name_en");k=str(prop(p,"adm1_code") or "");k0=str(prop(p,"adm0_a3","iso_a3") or "")
  if n and k and g:
   ch=pid("ne1",k);pa=(c0.get(k0) or [None])[0]
   add(c,ch,n,"administrative-subdivision-1",geom=g,parent=pa,key=k,attrs={"dataset":"Natural Earth","layer":"admin-1","adm1_code":k,"adm0_a3":k0,"temporal_status":"current-reference"})
   rel(c,ch,pa,"administrative-child","natural-earth-pinned",k);counts["admin1"]+=1
 for f in pp:
  p=f.get("properties")or{};g=f.get("geometry")or{};n=prop(p,"name","nameascii");co=g.get("coordinates")or[]
  if n and g.get("type")=="Point" and len(co)>=2:
   lo,la=float(co[0]),float(co[1]);w=str(prop(p,"wikidataid","nameascii") or n);k0=str(prop(p,"adm0_a3","iso_a3") or "");k1=str(prop(p,"adm1_code") or "")
   ch=pid("nep",w+f"|{la:.6f}|{lo:.6f}");pa=pid("ne1",k1) if k1 in c1 else ((c0.get(k0) or [None])[0])
   add(c,ch,n,"populated-place",geom=g,parent=pa,lat=la,lon=lo,key=w,attrs={"dataset":"Natural Earth","layer":"populated-places","adm0_a3":k0,"adm1_code":k1,"wikidata_id":prop(p,"wikidataid"),"temporal_status":"current-reference","population_max":prop(p,"pop_max")})
   rel(c,ch,pa,"geographic-child","natural-earth-pinned",w);counts["populated"]+=1
 # Jurisdictional parent model: de facto and de jure are separate assertions.
 c.executescript("""CREATE TABLE IF NOT EXISTS place_jurisdiction(
   assertion_id INTEGER PRIMARY KEY AUTOINCREMENT,
   place_id TEXT NOT NULL,
   parent_place_id TEXT,
   polity_id TEXT,
   jurisdiction_basis TEXT NOT NULL CHECK(jurisdiction_basis IN ('de_facto','de_jure')),
   relationship TEXT NOT NULL,
   source_id TEXT NOT NULL,
   source_record_key TEXT,
   confidence TEXT,
   status TEXT NOT NULL DEFAULT 'asserted',
   notes TEXT,
   UNIQUE(place_id,parent_place_id,polity_id,jurisdiction_basis,source_id)
 );CREATE INDEX IF NOT EXISTS idx_pj_place ON place_jurisdiction(place_id);
 CREATE INDEX IF NOT EXISTS idx_pj_parent ON place_jurisdiction(parent_place_id);
 CREATE INDEX IF NOT EXISTS idx_pj_polity ON place_jurisdiction(polity_id);""")
 # Every Natural Earth admin-1/populated place with a recognized admin-0 parent gets an explicit
 # de facto jurisdiction assertion. We do not infer de jure sovereignty from this dataset.
 de_facto=0
 for p_id,attrs,parent in c.execute("select place_id,attributes,parent_place_id from places where parent_place_id is not null").fetchall():
  a=json.loads(attrs or "{}")
  if a.get("dataset")=="Natural Earth":
   c.execute("insert or ignore into place_jurisdiction(place_id,parent_place_id,jurisdiction_basis,relationship,source_id,source_record_key,confidence,status,notes) values(?,?,?,?,?,?,?,?,?)",
             (p_id,parent,"de_facto","administrative-parent","natural-earth-pinned",a.get("adm1_code") or a.get("adm0_a3"),"source-defined","asserted","Natural Earth administrative geography; no de jure sovereignty inferred"))
   de_facto+=1
 # Contested/special places retain separate unresolved de jure status rather than receiving a guessed parent.
 unresolved=[]
 for p_id,n,typ,attrs in c.execute("select place_id,canonical_name,place_type,attributes from places where parent_place_id is null and place_type!='administrative-country'").fetchall():
  a=json.loads(attrs or "{}")
  unresolved.append([p_id,n,typ,a.get("adm0_a3"),"de_jure_not_asserted"])
 c.execute("insert or replace into store_meta(key,value) values('jurisdiction_model','de_jure and de_facto assertions are stored separately; absence of a de_jure assertion is not a claim of non-sovereignty')")
 c.execute("delete from place_identity_audit");dupes=0
 rows=c.execute("select json_extract(attributes,'$.geographic_identity_key'),min(place_id),count(*),group_concat(distinct json_extract(attributes,'$.source_id')) from places where json_extract(attributes,'$.geographic_identity_key') is not null group by 1").fetchall()
 for k,pa,n,s in rows:
  st="unique" if n==1 else "duplicate-review";dupes+=max(0,n-1);c.execute("insert or replace into place_identity_audit values(?,?,?,?,?)",(k,pa,n,s or "",st))
  if n>1:
   for q in [q[0] for q in c.execute("select place_id from places where json_extract(attributes,'$.geographic_identity_key')=? and place_id<>?",(k,pa))]:
    c.execute("insert or ignore into duplicate_candidates(entity_type,entity_id_a,entity_id_b,reason,confidence,status) values(?,?,?,?,?,?)",("place",pa,q,"exact geographic identity key duplicate","high","unreviewed"))
 orphan=c.execute("select count(*) from places p left join places q on q.place_id=p.parent_place_id where p.parent_place_id is not null and q.place_id is null").fetchone()[0]
 orrel=c.execute("select count(*) from place_relations r left join places a on a.place_id=r.child_place_id left join places b on b.place_id=r.parent_place_id where a.place_id is null or b.place_id is null").fetchone()[0]
 miss=c.execute("select count(*) from places p left join provenance v on v.entity_type='place' and v.entity_id=p.place_id where v.provenance_id is null").fetchone()[0]
 selfr=c.execute("select count(*) from place_relations where child_place_id=parent_place_id").fetchone()[0]
 temporal=c.execute("select place_id,canonical_name,start_date,end_date from places where start_date is not null or end_date is not null order by place_id").fetchall();fails=[]
 for i in range(10000):
  z=temporal[(i*7919)%len(temporal)];sy,ey=yr(z[2]),yr(z[3]);qy=(sy+((ey-sy)//2) if sy is not None and ey is not None else sy if sy is not None else ey)
  if not c.execute("select 1 from places where canonical_name=? and (start_date is null or cast(start_date as integer)<=?) and (end_date is null or cast(end_date as integer)>=?) limit 1",(z[1],qy,qy)).fetchone():fails.append([z[0],z[1],qy])
 report={"status":"completed" if not(fails or orphan or orrel or miss or selfr or dupes) else "failed","natural_earth_commit":NE,"natural_earth_counts":counts,"cliopatria_memberof_place_links":member,"places_total":c.execute("select count(*) from places").fetchone()[0],"place_polity_links":c.execute("select count(*) from place_polity").fetchone()[0],"place_relations":c.execute("select count(*) from place_relations").fetchone()[0],"de_facto_jurisdiction_assertions":de_facto,"de_jure_jurisdiction_assertions":c.execute("select count(*) from place_jurisdiction where jurisdiction_basis='de_jure'").fetchone()[0],"jurisdictional_parent_unresolved":len(unresolved),"exact_identity_duplicate_excess":dupes,"orphan_parent_links":orphan,"orphan_relations":orrel,"missing_place_provenance":miss,"self_relations":selfr,"temporal_place_records":len(temporal),"place_time_lookups_checked":10000,"place_time_lookup_failures":fails[:20],"lookup_validation_passed":not fails,"generated_at":now()}
 c.execute("insert or replace into store_meta values('roadmap_status',?)",("Expansion 1 enrichment and validation completed" if report["status"]=="completed" else "Expansion 1 validation failed",))
 c.commit();REPORT.write_text(json.dumps(report,indent=2,ensure_ascii=False) + chr(10));c.close();print(json.dumps(report,indent=2))
 if report["status"]!="completed":raise SystemExit(1)
if __name__=="__main__":main()
