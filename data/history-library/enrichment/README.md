# HISTORIX 1.3 Expanded Record Layer

HISTORIX 1.3 expands the records that already exist. It does not yet attempt to add every historical polity.

## Design goals
- Keep stable IDs.
- Keep the existing seed records backwards compatible.
- Store enrichment separately from the seed source.
- Make one record editable without rewriting the entire library.
- Allow claims to carry provenance and uncertainty.
- Never invent quantitative precision.

## Editing workflow
1. Find the stable ID in lib/historical-records.ts.
2. Edit the matching object in data/history-library/enrichment/events.json.
3. Add evidence-backed fields only.
4. Add source IDs to new factual claims.
5. Run python scripts/validate-historix-1.3.py.

## Migration status
The initial migration creates a structured 1.3 enrichment record for all 100 existing events. Fields requiring additional research are explicitly marked instead of being fabricated.

Statuses: expanded-structured, research-enriched, reviewed.

## Version boundary
1.3 = depth of existing records. 1.4 = breadth of the polity dataset.
