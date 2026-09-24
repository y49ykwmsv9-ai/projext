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
