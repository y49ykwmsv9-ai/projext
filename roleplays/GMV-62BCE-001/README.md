# GMV-62BCE-001 — Simulation Contract

## Event Output Format

Every generated event MUST explicitly store and display its event classification. The classification hierarchy is:

- `Direct`
- `Connected`
- `Surprise`
- `Special`

The event category is a classification of how the event enters the simulation. It is **not** a subject-matter label such as military, political, or economic.

### Required Event Fields

Every event record must contain:

- `event_id`
- `round_number`
- `date`
- `event_category`
- `title`
- `mentioned_entities`
- `body`
- `ai_ledger`

The event category must be explicitly printed in the event header and stored as `event_category` in the machine-readable event record.

### Sample Event

## EVENT 01 — SAMPLE EVENT
**Event Category: Direct**

**Round:** 52  
**Date:** 10 April 59 BCE  
**Mentioned Entities:** Gaius Maximus Valerius; Marcus Claudius Marcellus; Roman expedition; local smallholders

**Body:**  
[Sample event text goes here.]

**AI Ledger**
- `soldiers`: 0
- `supply`: +1
- `exhaustion`: +1
- `morale`: 0
- `readiness`: 0
- `intelligence`: +2
- `relations`: +1
- `land_area_sq_miles`: 0

### Machine-Readable Sample

```json
{
  "event_id": "R52-E01",
  "round_number": 52,
  "date": "10 April 59 BCE",
  "event_category": "Direct",
  "title": "SAMPLE EVENT",
  "mentioned_entities": [
    "Gaius Maximus Valerius",
    "Marcus Claudius Marcellus",
    "Roman expedition",
    "local smallholders"
  ],
  "body": "[Sample event text goes here.]",
  "ai_ledger": {
    "soldiers": 0,
    "supply": 1,
    "exhaustion": 1,
    "morale": 0,
    "readiness": 0,
    "intelligence": 2,
    "relations": 1,
    "land_area_sq_miles": 0
  }
}
```

## Check Placement

Special-event calculations and probability information do **not** belong in event headers.

The round header contains the round identification and the event categories represented in that round.

The round footer contains the complete verification record for:
- regular special-event opportunity chance
- exact special-event checks/rolls
- raw successes
- accepted candidates
- special-event result
- Magnitude-11 eligibility percentage
- Magnitude-11 checks/rolls
- raw Magnitude-11 successes
- accepted Magnitude-11 candidates
- final Magnitude-11 result

The exact percentages and checks must therefore be kept in the **round footer**, not attached to individual event headers.

## AI Ledger

The AI ledger is the explicit machine-readable record of the state changes produced by an event. It must use the established fixed metric schema and must not silently introduce a new metric merely for one event.

An event may have zero change to a metric; that zero should remain explicit when the metric is part of the event ledger.

## Continuity Requirements

Recurring named characters are persistent simulation entities. When contextually involved, they must be referenced by their established names rather than replaced with generic labels.

Events must remain varied across supported dimensions when the simulation state provides genuine causes for that variety. Variety must not be fabricated solely to fill an event quota.

Event prose should report observable developments rather than exposing internal simulation reasoning as if it were a news event.

## Fixed Metric Definitions, Units, and Bounds

The campaign uses the following authoritative metric definitions. These definitions do not change between rounds unless an explicit schema migration is committed.

| Metric | Unit | Bounds / Type |
|---|---|---|
| `soldiers` | men | exact quantity; minimum 0 |
| `population` | people | exact quantity; minimum 0 |
| `currency` | denarii | exact quantity; no condition cap |
| `taxation` | percent | 0–100 |
| `economy`, `agriculture`, `infrastructure`, `trade` | points | 0–100 |
| `readiness`, `morale`, `supply`, `organization`, `stability`, `legitimacy`, `technology`, `exhaustion` | points | 0–100 |
| `intelligence` | points | unbounded campaign information score |
| `relations` | points | -100 to +100 |
| `land_area_sq_miles` | square miles | exact quantity; minimum 0 |
| `temporary_unavailable` | men | exact quantity; minimum 0 |

A bounded metric may not exceed its established maximum or fall below its minimum. If an event produces a positive effect while the metric is already at its maximum, the observable event may still occur, but the numerical ledger records only the amount that can actually be applied within the bound. Exact quantities such as men, people, denarii, and square miles are never silently treated as percentage/condition points.

The machine-readable scenario record stores the same definitions under `metric_schema` / `metric_definitions`. Event and round ledgers must preserve the corresponding unit. 
