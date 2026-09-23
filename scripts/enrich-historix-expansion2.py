#!/usr/bin/env python3
"""HISTORIX Expansion 2: canonical event intake.

Imports the existing 1.3 event-enrichment index into the master SQLite store.
This pass establishes canonical event identity, chronology, geography,
narrative/context/consequence payloads, provenance, and stable graph references.
It does not infer missing historical facts or collapse disputed interpretations.
"""
from __future__ import annotations
import hashlib, json, sqlite3
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
DB=ROOT/"data/historix-master/historix_master.sqlite"
EVENTS=ROOT/"data/history-library/enrichment/events.json"

def main():
    db=sqlite3.connect(DB)
    c=db.cursor()
    c.executescript("""
    CREATE TABLE IF NOT EXISTS events(
      event_id TEXT PRIMARY KEY,
      canonical_name TEXT NOT NULL,
      event_type TEXT NOT NULL,
      subtype TEXT,
      start_year INTEGER,
      end_year INTEGER,
      date_label TEXT,
      date_precision TEXT,
      is_approximate INTEGER NOT NULL DEFAULT 0,
      uncertainty_years INTEGER,
      region TEXT,
      extent_note TEXT,
      summary TEXT NOT NULL,
      confidence TEXT,
      editorial_status TEXT,
      missing_fields TEXT NOT NULL DEFAULT '[]',
      source_record_key TEXT NOT NULL,
      attributes TEXT NOT NULL DEFAULT '{}'
    );
    CREATE TABLE IF NOT EXISTS event_aliases(
      event_id TEXT NOT NULL,
      alias TEXT NOT NULL,
      source_id TEXT NOT NULL,
      UNIQUE(event_id,alias,source_id)
    );
    CREATE TABLE IF NOT EXISTS event_participants(
      event_id TEXT NOT NULL,
      participant_ref TEXT NOT NULL,
      participant_kind TEXT,
      role TEXT,
      resolution_status TEXT NOT NULL DEFAULT 'unresolved',
      resolved_entity_id TEXT
    );
    CREATE TABLE IF NOT EXISTS event_polity_refs(
      event_id TEXT NOT NULL,
      polity_ref TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'related',
      resolution_status TEXT NOT NULL DEFAULT 'unresolved',
      resolved_polity_id TEXT
    );
    CREATE TABLE IF NOT EXISTS event_place_refs(
      event_id TEXT NOT NULL,
      place_ref TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'related',
      resolution_status TEXT NOT NULL DEFAULT 'unresolved',
      resolved_place_id TEXT
    );
    CREATE TABLE IF NOT EXISTS event_person_refs(
      event_id TEXT NOT NULL,
      person_ref TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'related',
      resolution_status TEXT NOT NULL DEFAULT 'unresolved',
      resolved_person_id TEXT
    );
    CREATE TABLE IF NOT EXISTS event_relations(
      event_id TEXT NOT NULL,
      related_event_id TEXT NOT NULL,
      relation_type TEXT NOT NULL,
      resolution_status TEXT NOT NULL DEFAULT 'resolved',
      UNIQUE(event_id,related_event_id,relation_type)
    );
    CREATE TABLE IF NOT EXISTS event_provenance(
      event_id TEXT NOT NULL,
      source_id TEXT NOT NULL,
      source_record_key TEXT,
      confidence TEXT,
      notes TEXT,
      UNIQUE(event_id,source_id,source_record_key)
    );
    CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_year);
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
    CREATE INDEX IF NOT EXISTS idx_event_polity_refs ON event_polity_refs(polity_ref);
    CREATE INDEX IF NOT EXISTS idx_event_place_refs ON event_place_refs(place_ref);
    """)
    data=json.loads(EVENTS.read_text(encoding="utf-8"))
    records=data.get("records",[])
    for e in records:
        ident=e.get("identity",{}); ch=e.get("chronology",{}); geo=e.get("geography",{})
        nar=e.get("narrative",{}); unc=e.get("uncertainty",{}); ed=e.get("editorial",{})
        eid=e["id"]
        attrs={k:e.get(k) for k in ("context","narrative","consequences","quantitative","evidence","uncertainty","graph") if k in e}
        c.execute("""INSERT OR REPLACE INTO events
          (event_id,canonical_name,event_type,subtype,start_year,end_year,date_label,date_precision,
           is_approximate,uncertainty_years,region,extent_note,summary,confidence,editorial_status,
           missing_fields,source_record_key,attributes)
          VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
          (eid,ident.get("canonical_name"),ident.get("event_type"),ident.get("subtype"),
           ch.get("start"),ch.get("end"),ch.get("date_label"),ch.get("date_precision"),
           int(bool(ch.get("is_approximate"))),ch.get("uncertainty_years"),geo.get("region"),
           geo.get("extent_note"),nar.get("summary",""),unc.get("confidence"),
           ed.get("status"),json.dumps(ed.get("missing_fields",[]),ensure_ascii=False),
           eid,json.dumps(attrs,ensure_ascii=False)))
        for alias in ident.get("alternate_names",[]):
            c.execute("INSERT OR IGNORE INTO event_aliases VALUES(?,?,?)",(eid,alias,"history-library-1.3"))
        for p in e.get("participants",[]):
            c.execute("INSERT INTO event_participants(event_id,participant_ref,participant_kind,role) VALUES(?,?,?,?)",
                      (eid,str(p.get("id","")),p.get("kind"),p.get("role")))
        for pid in geo.get("polity_ids",[]) or []:
            c.execute("INSERT INTO event_polity_refs(event_id,polity_ref) VALUES(?,?)",(eid,pid))
        for pid in geo.get("place_ids",[]) or []:
            c.execute("INSERT INTO event_place_refs(event_id,place_ref) VALUES(?,?)",(eid,pid))
        for pid in e.get("graph",{}).get("related_person_ids",[]) or []:
            c.execute("INSERT INTO event_person_refs(event_id,person_ref) VALUES(?,?,?)",(eid,pid,"related"))
        g=e.get("graph",{})
        for rid in g.get("preceding_event_ids",[]) or []:
            c.execute("INSERT OR IGNORE INTO event_relations VALUES(?,?,?,?)",(eid,rid,"preceding","resolved"))
        for rid in g.get("following_event_ids",[]) or []:
            c.execute("INSERT OR IGNORE INTO event_relations VALUES(?,?,?,?)",(eid,rid,"following","resolved"))
        ev=e.get("evidence",{})
        claims=ev.get("claims",[]) or []
        for claim in claims:
            for sid in claim.get("source_ids",[]) or []:
                c.execute("INSERT OR IGNORE INTO event_provenance VALUES(?,?,?,?,?)",
                          (eid,sid,eid,claim.get("confidence"),claim.get("notes")))
        if not claims:
            c.execute("INSERT OR IGNORE INTO event_provenance VALUES(?,?,?,?,?)",
                      (eid,"history-library-1.3",eid,unc.get("confidence"),"Imported from the canonical event enrichment index."))
    c.execute("INSERT OR REPLACE INTO store_meta(key,value) VALUES(?,?)",
              ("expansion2_model","Canonical events are source-recorded independently; unresolved cross-domain references are retained without inferred identity."))
    c.execute("INSERT OR REPLACE INTO store_meta(key,value) VALUES(?,?)",
              ("expansion2_source_sha256",(hashlib.sha256(EVENTS.read_bytes()).hexdigest())))
    db.commit()
    print(json.dumps({
      "events":c.execute("SELECT count(*) FROM events").fetchone()[0],
      "event_aliases":c.execute("SELECT count(*) FROM event_aliases").fetchone()[0],
      "event_participants":c.execute("SELECT count(*) FROM event_participants").fetchone()[0],
      "event_polity_refs":c.execute("SELECT count(*) FROM event_polity_refs").fetchone()[0],
      "event_place_refs":c.execute("SELECT count(*) FROM event_place_refs").fetchone()[0],
      "event_relations":c.execute("SELECT count(*) FROM event_relations").fetchone()[0],
      "event_provenance":c.execute("SELECT count(*) FROM event_provenance").fetchone()[0]
    },indent=2))
    db.close()

if __name__=="__main__": main()
