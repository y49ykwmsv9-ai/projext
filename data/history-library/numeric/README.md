# HISTORIX 1.2 quantitative layer

HISTORIX 1.2 adds a provenance-first numerical substrate for historical simulation and research.

## Resource shape

Numeric resources live under `data/history-library/observations/` and are addressed by stable entity IDs. A quantitative observation contains:

- `entity_id`
- `metric`
- `year`
- `value`
- optional `lower` / `upper`
- `unit`
- optional `currency_basis`
- `confidence`
- `source_ids`
- `source_record_id`

## Source policy

The ingestion layer records source metadata and licensing. It does not silently merge incompatible estimates. Cross-source reconciliation belongs to a separate layer.

The first registered quantitative source is the **Maddison Project Database 2023**, which covers 169 countries and aggregate regions from AD 1 through 2022. Its publisher specifies CC BY 4.0 and citation requirements. Other sources are registered but only ingested where their licensing permits redistribution.

## Design rule

Ancient and medieval values are estimates. HISTORIX therefore preserves uncertainty and sparse temporal coverage instead of turning guesses into fake decimal precision. Humanity has produced enough bad spreadsheets already.
