# Engine Contract

## 1. Input

A player instruction is plain language plus the current scenario context.

Example:

> Redirect the treasury toward road construction in the northern provinces and negotiate lower transit duties with neighboring states.

The parser should identify:

- acting role;
- intended actions;
- targets;
- locations;
- resources;
- time horizon;
- secrecy/publicity where applicable;
- implied prerequisites.

## 2. Evidence retrieval

Before resolving an action, retrieve relevant canonical observations:

- population and demographic estimates;
- economic output, prices, taxation, trade and resources;
- military organization, manpower and logistics;
- institutions, laws and administrative structure;
- geography and transport;
- known people and political relationships;
- prior historical events near the selected date;
- uncertainty and source provenance.

Canonical history constrains plausibility. It does not dictate the outcome.

## 3. State resolution

Apply the instruction to the current scenario state.

A resolution may:

- succeed;
- partially succeed;
- fail;
- create delayed effects;
- create unintended effects;
- trigger reactions from other actors;
- change the probability of later events.

The resolver should preserve the distinction between **attempted action**, **actual outcome**, and **narrative interpretation**.

## 4. Autonomous world

Non-player actors operate independently according to their own:

- interests;
- resources;
- information;
- institutions;
- relationships;
- geography;
- previous experiences with the player;
- current scenario state.

Actors should not know information they could not plausibly obtain.

## 5. Memory update

Every meaningful turn appends structured memory:

```text
action
outcome
actors
locations
state changes
causes
consequences
uncertainty
sources
```

The engine should never overwrite the historical baseline with the alternate timeline.

## 6. Derived statistics

Statistics are recalculated from scenario state. They should expose their inputs and calculation provenance where practical.

Examples:

- population growth;
- tax revenue;
- GDP/output estimates;
- military readiness;
- manpower;
- supply capacity;
- trade volume;
- diplomatic relationship values;
- stability indicators.

## 7. Narrative generation

Only after state resolution should the narrative layer produce the roleplay response.

The response should:

- stay in the selected role/context;
- distinguish known facts from uncertain reports;
- reference relevant statistics;
- incorporate previous scenario events;
- describe consequences rather than merely acknowledging commands;
- avoid silently restoring real-world history after divergence.

## 8. Time advancement

Supported time steps should include:

- one week;
- one month;
- one year;
- custom duration.

Longer advances should aggregate ordinary changes while preserving major events individually.

## 9. Auditability

Every generated claim that materially affects gameplay should be traceable to either:

1. a canonical source observation;
2. a deterministic calculation;
3. a prior scenario event/state;
4. an explicitly marked uncertain inference.

This makes the project useful as a persistent simulation memory rather than a chatbot that forgets its own fictional history every few paragraphs.


## 10. News-event generation

A time advance is incomplete until the world tick has produced its news cycle. Generate 5-10 substantive news events by default, prioritizing player-impacting events, connected foreign actors, major regional developments, then distant major events and lower-confidence reports. Each event must be written to structured memory before narrative generation.

Each news article must be the readable projection of an event record containing date/round, actors, locations, causes, effects, information visibility/confidence, and applicable numerical state changes. Mentioning a nation without changing or evaluating that nation's actual simulation state is invalid.

Each news article should normally contain at least 5-7 sentences. The article must explain the event rather than merely announce it. Major events may receive longer articles or multiple linked stories.

## 11. Autonomous nation tick

During every explicit time advance, process relevant non-player actors independently. Recalculate incentives from their current state, information, relationships, resources, conflicts, projects, and recent events. Resolve plausible actions and reactions before generating the final news narrative. The player's realm must not receive protagonist protection, and foreign actors must not receive omniscient or impossible capabilities.

## 12. News-to-state integrity

A generated article must never be allowed to contradict the simulation state. The pipeline is:

world state -> autonomous decisions -> event resolution -> state mutations -> causal graph -> information filtering -> news article.

Never use:

world state -> invented article -> retroactive state changes.

The latter produces the sort of historical hallucination that looks impressive for approximately thirty seconds and then collapses under its own arithmetic.
