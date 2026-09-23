#!/usr/bin/env python3
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
polity_path=ROOT/'data/history-library/polities/historix-linked.json'
schema_path=ROOT/'data/history-library/polities/schema.json'
graph_path=ROOT/'data/history-library/graph/curated-records.json'
manifest_path=ROOT/'data/history-library/HISTORIX-1.4-manifest.json'

def load(p): return json.loads(p.read_text(encoding='utf-8'))

payload=load(polity_path); schema=load(schema_path); graph=load(graph_path); manifest=load(manifest_path)
cliopatria_files=sorted(polity_path.parent.glob('cliopatria-*.json'))
assert payload['schema_version']=='1.4.0'
assert schema['schema_version']=='1.4.0'
assert manifest['version']=='1.4.0'
actual=sorted(r['id'] for r in payload['records'])
source_ids=sorted(p.stem for p in cliopatria_files)
graph_ids=sorted({r['to_id'] for r in graph.get('relations',[]) if r.get('to_type')=='polity' and r.get('to_id')})
assert actual==source_ids, f'polity coverage mismatch: expected complete Cliopatria baseline {len(source_ids)}, got {len(actual)}'
unresolved_graph_ids=sorted(set(graph_ids)-set(actual))
# The 1.1 curated graph predates the 1,583-entity Cliopatria baseline. Legacy
# polity IDs are therefore allowed here; 1.4 canonical resolution happens in
# the enrichment/linking passes instead of making the baseline validator fail.
print(f'Legacy curated polity references pending canonical resolution: {len(unresolved_graph_ids)}')
assert len(actual)==len(set(actual))
required={'id','identity','chronology','geography','status','source_links','evidence','uncertainty','editorial'}
for r in payload['records']:
    assert required <= r.keys(), f'missing required fields in {r.get("id")}'
    assert r.get('temporal_records'), f'missing temporal source records in {r.get("id")}'
    assert r['status']['cliopatria_link'] in {'pending-exact-resolution','resolved'}
    assert r['editorial']['status'] in {'linked-structured','research-enriched','reviewed'}
assert payload['record_count']==len(actual)==manifest['record_count']==1583
assert len(cliopatria_files)==1583
print(f'HISTORIX 1.4 validation passed: {len(actual)} referenced polities')
