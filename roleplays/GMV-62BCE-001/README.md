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

Special events are a **core event category**, alongside Direct, Connected, and Surprise events. Every round performs one simple independent random Special-event roll using the campaign's base Special-event probability. If the roll succeeds, a Special event is generated as part of that round's normal event set; if it fails, no Special event is generated. Special events are not a second-stage candidate-selection system and do not require raw-success/accepted-candidate filtering.

The exact Special-event probability and random roll belong in the **round footer**, not in individual event headers. The round header contains the round identification and the event categories actually represented in that round.

The round footer must record:
- base Special-event probability
- Special-event random roll
- whether the Special-event roll succeeded
- the generated Special event, if any
- any separate Magnitude-11 check required by the campaign contract

The Special category must be considered during ordinary event generation every round, rather than treated as an exceptional post-processing layer.

## AI Ledger

The AI ledger is the explicit machine-readable record of the state changes produced by an event. It must use the established fixed metric schema and must not silently introduce a new metric merely for one event.

An event may have zero change to a metric; that zero should remain explicit when the metric is part of the event ledger.

## Financial Realization and Account Routing

Economic activity does **not** need to be narrated as an accounting statement. An event may describe an observable development such as harvests, cargo movement, trade, rents, fees, contracts, workshop activity, or another productive/commercial development without explicitly stating the resulting income in the article body.

When the observable event produces a realized financial effect, the simulation should record that effect intermittently in the machine-readable financial ledger. Financial realization is a consequence of the event, not a requirement that every economic event produce money and not a requirement that the article explain the accounting.

Financial effects must use **denarii** and must be routed to the appropriate account according to the event:
- `treasury`: state, military, public-command, or other explicitly public/state funds.
- `public_account`: estate or operating capital used for the productive/commercial administration of Valerius's holdings.
- `private_account`: Valerius's private wealth when the event creates a realized private receipt or an established private transfer.
- `currency`: the exact-denarii event/round financial-flow metric when a financial change must be represented in the fixed metric ledger; it is not a substitute for identifying the destination account when account routing is known.

The same denarius must not be counted twice. A transfer from one account to another is a routing event, not new income. Gross receipts, operating costs, net public profit, private transfers, investment principal, and realized investment returns remain distinct fields where the historical record supports them.

### Historical Reconciliation Rule

Past rounds are reconciled by preserving documented financial records and by adding financial effects only where the surviving event record provides a concrete basis. Older rounds with explicit financial blocks remain authoritative even when the article body does not mention income. Missing historical income is **not** fabricated merely because an estate or trade activity occurred. Legacy event ledgers using `currency_units` are normalized to the fixed `currency` unit of **denarii** for interpretation, while their historical uncertainty is preserved.

For the current reconciliation, Round 54's documented first regular commercial loads are recorded as a realized public-account profit of **110 denarii**, with the established **10% private transfer of 11 denarii**. The article itself is unchanged; the financial result is represented in the ledger because the event documents actual commercial loads. This is the model for future rounds: observable economic events may quietly produce intermittent account changes without turning the news article into an accounting report.

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
