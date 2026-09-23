#!/usr/bin/env python3
import json,sqlite3
DB="data/historix-master/historix_master.sqlite"
SRC="data/history-library/enrichment/events.json"
db=sqlite3.connect(DB); c=db.cursor(); src=json.load(open(SRC))
records=src["records"]; ids=[r["id"] for r in records]
dupes=len(ids)-len(set(ids))
x={
 "source_records":len(records),
 "events":c.execute("select count(*) from events").fetchone()[0],
 "duplicate_source_ids":dupes,
 "missing_event_rows":len(set(ids)-{r[0] for r in c.execute("select event_id from events")}),
 "missing_provenance":c.execute("select count(*) from events e left join event_provenance p on p.event_id=e.event_id where p.event_id is null").fetchone()[0],
 "missing_names":c.execute("select count(*) from events where canonical_name is null or trim(canonical_name)=''").fetchone()[0],
 "missing_types":c.execute("select count(*) from events where event_type is null or trim(event_type)=''").fetchone()[0],
 "missing_start_dates":c.execute("select count(*) from events where start_year is null").fetchone()[0],
 "invalid_relations":c.execute("select count(*) from event_relations r left join events e on e.event_id=r.event_id left join events q on q.event_id=r.related_event_id where e.event_id is null or q.event_id is null").fetchone()[0],
 "research_incomplete_records":c.execute("select count(*) from events where missing_fields!='[]'").fetchone()[0]
}
assert x["source_records"]==100 and x["events"]==100 and x["duplicate_source_ids"]==0 and x["missing_event_rows"]==0 and x["missing_provenance"]==0 and x["missing_names"]==0 and x["missing_types"]==0 and x["missing_start_dates"]==0 and x["invalid_relations"]==0, x
print(json.dumps(x,indent=2))
