# GMV-62BCE-001 — Simulation Contract

## Event Output Format

Every generated event MUST explicitly store and display its event classification. The initial classification set is:

- `Direct`
- `Connected`
- `Surprise`
- `Special`
- `Ultimate`

The final classification is determined after the mandatory post-generation Ultimate Reclassification Gate. Ultimate is therefore both a core classification and the terminal classification for any Surprise or Special event that independently meets the Ultimate threshold.

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

**Financial Realization — within AI Ledger**
- `gross_receipts_denarii`: 0
- `operating_costs_denarii`: 0
- `net_public_profit_denarii`: 0
- `private_transfer_denarii`: 0
- `treasury_change_denarii`: 0
- `public_account_change_denarii`: 0
- `private_account_change_denarii`: 0
- `currency_flow_denarii`: 0
- `internal_transfer`: false

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
    "land_area_sq_miles": 0,
    "financial_realization": {
      "gross_receipts_denarii": 0,
      "operating_costs_denarii": 0,
      "net_public_profit_denarii": 0,
      "private_transfer_denarii": 0,
      "treasury_change_denarii": 0,
      "public_account_change_denarii": 0,
      "private_account_change_denarii": 0,
      "currency_flow_denarii": 0,
      "internal_transfer": false
    }
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

### Financial Realization Is Part of the AI Ledger

Financial realization is a required **sub-ledger inside `ai_ledger`**, not a separate event-level ledger. When an observable event produces a realized financial effect, the event's `ai_ledger.financial_realization` must record that effect.

The financial realization object uses denarii and should contain the applicable fields:

- `gross_receipts_denarii`
- `operating_costs_denarii`
- `net_public_profit_denarii`
- `private_transfer_denarii`
- `treasury_change_denarii`
- `public_account_change_denarii`
- `private_account_change_denarii`
- `currency_flow_denarii`
- `internal_transfer`

Zero values may be used when a field does not apply, so the financial schema remains stable across events.

## Financial Realization and Account Routing

Economic activity does **not** need to be narrated as an accounting statement. An event may describe an observable development such as harvests, cargo movement, trade, rents, fees, contracts, workshop activity, or another productive/commercial development without explicitly stating the resulting income in the article body.

When the observable event produces a realized financial effect, the simulation should record that effect in the event's `ai_ledger.financial_realization`. Financial realization is a consequence of the event, not a requirement that every economic event produce money and not a requirement that the article explain the accounting.

Financial effects must use **denarii** and must be routed to the appropriate account according to the event:
- `treasury`: state, military, public-command, or other explicitly public/state funds.
- `public_account`: estate or operating capital used for the productive/commercial administration of Valerius's holdings.
- `private_account`: Valerius's private wealth when the event creates a realized private receipt or an established private transfer.
- Financial account fields are recorded only inside `ai_ledger.financial_realization`; there is no separate `currency` state metric.

The same denarius must not be counted twice. A transfer from one account to another is a routing event, not new income. Gross receipts, operating costs, net public profit, private transfers, investment principal, and realized investment returns remain distinct fields where the historical record supports them.

### Historical Reconciliation Rule

Past rounds are reconciled by preserving documented financial records and by adding financial effects only where the surviving event record provides a concrete basis. Older rounds with explicit financial blocks remain authoritative even when the article body does not mention income. Missing historical income is **not** fabricated merely because an estate or trade activity occurred. Legacy event ledgers using `currency_units` are normalized to the fixed `currency` unit of **denarii** for interpretation, while their historical uncertainty is preserved.

For the current reconciliation, Round 54's documented first regular commercial loads are recorded as a realized public-account profit of **110 denarii**, with the established **10% private transfer of 11 denarii**. The article itself is unchanged; the financial result is represented in the ledger because the event documents actual commercial loads. This is the model for future rounds: observable economic events may quietly produce intermittent account changes without turning the news article into an accounting report.

## Mandatory Round Semantic-State Validation Gate

Before any round is shown to the user or committed to GitHub, the round MUST pass a semantic-state validation pass. This check is performed after drafting the events and before the round is presented as final.

### Topic-to-State Consistency Rule
- If an event materially mentions **soldiers, troops, military manpower, detachments, recruitment, casualties, or military availability**, the event or round must contain a corresponding numerical state effect in the fixed ledger when the described development changes manpower, availability, readiness, organization, morale, supply, exhaustion, or another applicable military metric. A purely descriptive military reference that causes no state change must not be written as though it changed military conditions.
- If an event materially mentions **agriculture, harvests, crops, fields, cultivation, irrigation, agricultural output, or estate agricultural production**, the event or round must contain a corresponding numerical state effect in the fixed ledger when the described development changes agriculture, supply, population, land use, or another applicable metric. If the relevant bounded metric is already at its maximum, the event may still occur, but the applied change must be 0 and another genuinely affected metric must be updated when the narrative establishes such an effect.
- If an event materially mentions **economy, trade, mines, production, commercial output, rents, fees, estate revenue, investment, investment returns, contracts, or realized income**, the event or round must contain the corresponding financial realization and/or fixed-state effect when the narrative establishes an observable economic consequence. Exact denarii amounts, account routing, rates, ownership, and timing must never be invented merely to satisfy the check.
- If an event materially mentions **estates, estate policy, property administration, land purchases, land transfers, or holdings**, the event or round must update the applicable land, agriculture, population, financial, or administrative metric when the narrative establishes a state change. A property-related narrative that establishes no measurable change must be rewritten so it does not falsely imply a state transition.
- If an event mentions a **literal revenue receipt, payment, cost, profit, transfer, or investment return**, the financial-realization sub-ledger must contain the corresponding realized amount and routing, or the narrative must be rewritten to describe only preparation, expectation, or non-realized activity.
- Exact quantities must remain exact quantities. Soldiers are men, population is people, land is square miles, and financial amounts are denarii; none may be represented as condition points or percentages.

### Automatic Pre-Output Refinement
The validation gate is mandatory. If a drafted event fails the semantic-state check, it MUST be automatically refined before the round is shown to the user. The refinement may:
1. add the supported numerical state or financial effect;
2. change the narrative so it accurately matches the already-established state change;
3. remove an unsupported implication of output, revenue, manpower change, ownership, or investment return; or
4. leave the narrative event intact with a zero applied change when the relevant bounded metric is already capped, provided the event does not falsely claim a measurable increase.

A round that fails this gate MUST NOT be committed as final and MUST NOT be presented to the user as final. The round footer must include a semantic-state validation result and identify any refinement performed before output.

### Round-Level Commit Gate
The semantic-state check joins the existing end-of-round checks. A round may be committed only when all of the following pass: fixed metric schema, metric bounds, financial reconciliation, land consistency, recurring-character continuity, event variety, Ultimate-event contract, current-total-ledger completeness, semantic-state consistency, and canonical round-pointer synchronization.

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
| `taxation` | percent | 0–100 |
| `economy`, `agriculture`, `infrastructure`, `trade` | points | 0–100 |
| `readiness`, `morale`, `supply`, `organization`, `stability`, `legitimacy`, `technology`, `exhaustion` | points | 0–100 |
| `intelligence` | points | unbounded campaign information score |
| `relations` | points | -100 to +100 |
| `land_area_sq_miles` | square miles | exact quantity; minimum 0 |
| `temporary_unavailable` | men | exact quantity; minimum 0 |

A bounded metric may not exceed its established maximum or fall below its minimum. If an event produces a positive effect while the metric is already at its maximum, the observable event may still occur, but the numerical ledger records only the amount that can actually be applied within the bound. Exact quantities such as men, people, denarii, and square miles are never silently treated as percentage/condition points.

The machine-readable scenario record stores the same definitions under `metric_schema` / `metric_definitions`. Event and round ledgers must preserve the corresponding unit.


## Current Total Ledger Requirement

At the end of every completed round, the round output and machine-readable round record MUST include a `current_total_ledger` containing the complete current value of **every metric in `roleplay-fixed-metrics-v2`**, with its authoritative unit and applicable bound/type.

The Current Total Ledger is distinct from the Round Delta Ledger:
- **Round Delta Ledger:** Before / Change / After / Unit for metrics affected or carried through the round.
- **Current Total Ledger:** the complete post-round snapshot of every established metric, including metrics with zero change in the round.

A round is not complete and `next_round_gate` must not open until the Current Total Ledger is present, every established metric is represented, units are correct, bounds are reconciled, and every value matches `state.json` after the round is persisted.

## Canonical Round Pointer and Legacy Artifact Guard

The canonical round is determined only by the synchronized values in `scenario.json.latest_round`, `scenario.json.latest_date`, `state.json.round`, `state.json.date`, and the matching `rounds/round-{latest_round}.json` record. Do not infer the current round from search-result ordering, filename ordering, or a legacy record's internal round number.

`round-014.json` and `round-052.json` are historical records and are never eligible to become the current campaign pointer. Round 52 is also a legacy-schema record and must be interpreted through its later migration/reconciliation history. Historical records remain available for continuity and audit, but they cannot override the synchronized canonical pointer.


## Narrative Rules and Event Type Definitions

### Narrative Rules

- News prose describes what happened.
- Surprise and Special events use the same expanded player-facing prose/news treatment required for extraordinary event presentation. They are not shortened merely because their initial classification is Surprise or Special.
- If a Surprise or Special event qualifies for Ultimate during post-generation review, its final classification becomes Ultimate and its narrative must be rewritten to satisfy the Ultimate narrative contract before output or commit.
- Hidden simulation reasoning does not appear in the narrative.
- Do not write internal logic as if it were an in-world news report.
- Maintain recurring named characters where contextually appropriate.
- Keep events varied and causally connected to the established campaign.
- Never manufacture an event merely to fill a quota.
- Narrative detail must be supported by established campaign facts and current causal threads.
- Event type describes how a development enters the simulation, not its subject matter.
- Military, political, economic, social, agricultural, personal, geographic, diplomatic, and investigative developments may belong to any appropriate event type.
- Choose the event category according to causality and narrative function rather than subject matter.
- A round may contain multiple event types.
- Do not force every category to appear in every round.
- Do not repeat one category simply to satisfy an artificial distribution.
- After initial event generation, every Surprise and Special event MUST be inspected by the Ultimate Reclassification Gate before final output.
- If that gate qualifies the event for Ultimate, the final category MUST be changed to Ultimate and the event MUST be rewritten at Ultimate narrative depth.
- If the gate does not qualify the event, the original Surprise or Special category remains final.
- This gate is one-way: Surprise or Special may become Ultimate; Ultimate is not downgraded merely because its causal origin resembles another category.

### Event Type Definitions

- **Direct:** A development caused directly by the player's established actions, standing directives, ongoing activities, or immediate decisions. It should show observable consequences or continuation of something Valerius has already initiated or ordered. It must not introduce an unrelated development merely to continue the round.

- **Connected:** A development arising from an established thread, relationship, institution, investigation, economic activity, correspondence, location, or prior event without being the immediate result of the player's latest action. It should demonstrate continuing causal connections and allow established people, groups, places, or problems to develop independently.

- **Surprise:** An unexpected but causally plausible development emerging from the established simulation state. It should introduce something Valerius did not explicitly order or anticipate while remaining grounded in existing circumstances, characters, relationships, geography, resources, or unresolved threads. Surprise does not mean arbitrary randomness and must not create unsupported dramatic twists.

- **Special:** A development generated when the independent Special-event roll for that round succeeds. Special is a core event category governed by the campaign's established Special-event probability. Its narrative should describe the resulting event as an in-world development rather than exposing the random-roll mechanism. A Special event may concern any supported subject and is not automatically Ultimate merely because the roll succeeded. Every Special event must subsequently pass the Ultimate Reclassification Gate before its final category is committed.

- **Ultimate:** An extraordinary development that warrants an unusually detailed, cinematic account. It is reserved for major expeditions, crises, discoveries, confrontations, breakthroughs, disasters, or comparable exceptional developments whose narrative significance exceeds that of an ordinary event. Ultimate may be substantially longer and more immersive, but every detail must remain grounded in established campaign facts. It is not a second random-event system, does not replace Special, does not need to occur every round, and must never be created merely to fill an event quota. When the player character personally experiences an Ultimate event, use direct second-person perspective ("you") so the event is experienced as the player's own actions and memories rather than as a report about Valerius.

### Event Type Selection Rule

- Event categories must emerge from the established simulation state and current causal threads.
- The category must be selected based on how the event entered the simulation, not how dramatic, important, or interesting the subject appears.
- An event can be economically significant and still be Direct, politically significant and still be Connected, or geographically significant and still be Surprise.
- Ultimate is determined by extraordinary narrative circumstances; Special is determined by the independent Special-event system. They are not interchangeable.
- An Ultimate event may coexist with a Special event in the same round.
- No event category should be used merely to satisfy a numerical quota or artificial distribution.
## Ultimate Reclassification Gate


The simulation uses a mandatory post-generation classification refinement gate. Event categories remain distinct at generation time, but the final classification is not locked until every originally Surprise and Special event has been inspected. An event originally generated as Surprise or Special may be reclassified as Ultimate when the event itself independently satisfies the Ultimate definition.

### Reclassification Rule
- Generate the event using its correct causal mechanism first.
- Preserve the original causal provenance internally: a Surprise remains a causally surprising development, and a Special remains a development produced by the independent Special roll.
- Before final output, inspect every Surprise and Special event against the Ultimate criteria.
- If the event independently qualifies as an extraordinary development warranting the Ultimate treatment, reclassify its final `event_category` to `Ultimate` and rewrite the event at Ultimate narrative depth before output or commit.
- If it does not independently qualify, retain its original Surprise or Special classification.
- A Special event does not become Ultimate merely because the Special roll succeeded.
- A Surprise event does not become Ultimate merely because it is unexpected or dramatic.
- Ultimate is therefore a higher narrative/classification threshold that can subsume an originally Surprise or Special event when the event's actual circumstances warrant it; the relationship is one-way and is not a category equivalence rule.
- Reclassification does not create an additional random event, does not consume or alter the Special roll, and does not create a second Ultimate probability system.
- If a Magnitude-11 success generates a Special event under the campaign's current random contract, that event must still pass this independent Ultimate reclassification gate before final classification.
- If reclassified, all machine-readable event fields, displayed headers, AI ledger references, round category summaries, and validation records must use `Ultimate` as the final event category.
- The event's causal origin may remain documented in the AI-facing ledger or validation metadata where the schema permits, but the final displayed event classification must reflect the post-generation gate.

### Required Order
1. Determine the event's initial category from causality/random mechanism.
2. Draft the event using that category's causal rules.
3. Apply the Ultimate Reclassification Gate to every Surprise and Special candidate.
4. If the Ultimate threshold is met, reclassify and rewrite as Ultimate.
5. Apply semantic-state validation and all remaining end-of-round checks.
6. Commit only the fully validated final classification.


## Mandatory In-App Random Resolution Rule

Every round MUST perform its probabilistic checks locally inside the ChatGPT app before the round is output or committed. ChatGPT MUST locally generate the random draw used for the Special-event probability and any required Magnitude-11 probability checks from the current game state and campaign logic. These are simulation draws performed for this campaign, not values copied from GitHub, search results, or a prewritten round.

### Special-Event Random Check
- Every round, ChatGPT MUST locally generate a fresh random value for the Special-event check.
- The draw is compared with the current campaign Special-event probability from the scenario contract.
- A successful draw creates exactly one Special event in that round's ordinary event set; a failed draw creates none.
- The random draw MUST be generated before final event output and recorded in the round footer.
- The Special-event result must not be retroactively selected merely because an interesting event was written.

### Magnitude-11 Random Check
- Every round, ChatGPT MUST locally generate the required Magnitude-11 random check(s) according to the campaign's current probability and game-state logic.
- Magnitude-11 is tracked separately from Special-event selection and must never be substituted for the Special roll.
- The generated checks and result must be recorded in the round footer whenever the campaign contract requires them.

### Randomness Integrity
- Existing random values in a prior round, scenario file, or draft MUST NOT be reused as the current round's random draw.
- A draft round cannot be finalized by copying its old Special or Magnitude-11 values.
- The random checks occur before the final semantic-state validation and commit gate so that any generated Special/Magnitude-11 event is included in the same state-validation process as all other events.
- If the random result changes the event set, all ledgers, totals, financial effects, narrative, and current-total ledger MUST be recalculated before output.
- A round MUST NOT be committed if the required local random checks were not executed in the ChatGPT app.
- The round footer MUST identify that the random checks were locally generated in-app and provide the resulting draw(s), probability, and outcome.

### Required Pre-Output Order
1. Read the canonical README, scenario, state, current round, and relevant continuity records.
2. Generate the new round's local Special and Magnitude-11 random checks in the ChatGPT app.
3. Generate candidate events using the resulting state and causal logic.
4. Apply the semantic-state validation gate.
5. Recalculate all metric deltas, financial realization, and current totals.
6. Run all end-of-round checks.
7. Synchronize the canonical pointer.
8. Only then output the completed round and commit it.

The local in-app random checks are mandatory simulation operations and are part of the campaign contract.
