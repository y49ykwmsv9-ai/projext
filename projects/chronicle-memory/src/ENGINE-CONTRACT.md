# Engine Contract

## 1. Input

A player instruction is plain language plus the current scenario context.

The parser identifies acting role, intended actions, targets, locations, resources, time horizon, secrecy/publicity, and implied prerequisites.

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

Apply the instruction to the current scenario state. A resolution may succeed, partially succeed, fail, create delayed effects, create unintended effects, trigger reactions, or change later probabilities.

The resolver preserves the distinction between attempted action, actual outcome, and narrative interpretation.

## 4. Autonomous world

Non-player actors operate independently according to their own interests, resources, information, institutions, relationships, geography, previous experiences, and current scenario state. Actors must not know information they could not plausibly obtain.

## 5. Persistent round memory

Every completed round is written to its own immutable repository file:

`data/rounds/<scenario-id>/round-0001.json`

then `round-0002.json`, `round-0003.json`, and so on.

A round record contains the resolved events, every persistent state mutation, and the military ledger required to reconstruct the next round. Old round files are never rewritten to make later narration fit. Corrections are new events.

Current state is reconstructed by replaying the ordered round records from the scenario baseline. This makes prior rounds directly referenceable and allows running totals to be rebuilt instead of trusting conversational memory.

## 6. Logic-side numerical authority

Persistent gameplay numbers belong to the simulation/logic layer, not the client.

The client may display values and submit commands, but it cannot authoritatively decide population, treasury, production, prices, manpower, military strength, troop movements, casualties, recruitment, diplomacy, or other persistent state.

Every persistent numeric mutation records:

- actor;
- statistic;
- value before;
- signed delta;
- value after;
- causal event;
- reason;
- provenance/calculation method.

Derived statistics must be recalculated from authoritative state and expose their inputs where practical.

## 7. Military persistence

Whenever troops, armies, deployments, battles, casualties, recruitment, reinforcements, garrisons, or readiness are mentioned, the narrative must include exact troop numbers.

The military ledger tracks integer troop counts by actor and, where useful, formation/location:

- total troops;
- available troops;
- committed troops;
- garrison troops;
- reserve/manpower pool;
- recruitment gains;
- reinforcements;
- temporary wounded/unavailable troops;
- permanent deaths/losses;
- formation identifiers;
- location;
- supply status;
- readiness.

Deployment moves troops between buckets and/or locations. It does not create troops.

Recruitment increases totals only after a valid recruitment resolution constrained by population, manpower, treasury, institutions, training capacity, equipment, and time.

Reinforcement is a conservation operation: troops must come from a source formation or a valid newly raised force.

### Battle integrity

A battle is first resolved numerically and only then narrated.

Before a battle, record actual engaged troops for every side. Resolution must account for relevant factors such as reserves, readiness, supply, terrain, fortifications, command, technology/doctrine, surprise/intelligence, morale/stability, reinforcements, and weather/environment where applicable.

After the battle, surviving troops and permanent casualties become persistent state. Permanent losses cannot disappear from later rounds. A later increase requires a new causal event such as recruitment, reinforcement, or recovery of troops explicitly marked temporarily unavailable.

A news claim such as "2,100 soldiers were killed" is invalid unless the state mutation removes 2,100 soldiers from the appropriate military ledger. A claim such as "8,400 troops arrived" is invalid unless an equivalent source transfer, reinforcement, or recruitment event exists.

Before accepting a battle record, validate:

`troops_remaining = troops_committed - permanent_losses - temporary_losses`

and validate all transfers for conservation.

## 8. Narrative generation

Only after state resolution should the narrative layer produce the roleplay response.

The response should stay in the selected role/context, distinguish known facts from uncertain reports, reference relevant statistics, incorporate previous scenario events, describe consequences, and never silently restore real-world history after divergence.

## 9. Time advancement

Supported time steps include one week, one month, one year, and custom durations. Longer advances aggregate ordinary changes while preserving major events individually.

An explicit time advance must run the autonomous world tick before the news cycle.

## 10. News-event generation

A time advance is incomplete until the world tick has produced its news cycle. Generate 5-10 substantive news events by default, prioritizing player-impacting events, connected foreign actors, major regional developments, then distant major events and lower-confidence reports.

Every event is written to the round file before narrative generation. Each article is the readable projection of an event record containing date/round, actors, locations, causes, effects, information visibility/confidence, and applicable numerical state changes.

Each news article should normally contain at least 5-7 sentences. Major events may receive longer articles or multiple linked stories.

## 11. Autonomous nation tick

During every explicit time advance, process relevant non-player actors independently. Recalculate incentives from current state, information, relationships, resources, conflicts, projects, and recent events. Resolve plausible actions and reactions before generating the final news narrative.

The player's realm receives no protagonist protection, and foreign actors receive no omniscient or impossible capabilities.

## 12. News-to-state integrity

The authoritative pipeline is:

`round state -> autonomous decisions -> event resolution -> state mutations -> military ledger -> causal graph -> information filtering -> news article`

Never use:

`round state -> invented article -> retroactive state changes`

The narrative cannot create a fact that the logic layer has not already resolved.

## 13. Auditability

Every generated claim that materially affects gameplay must be traceable to either a canonical source observation, deterministic calculation, prior scenario event/state, or explicitly marked uncertain inference.

This turns the repository into persistent simulation memory rather than a chatbot that forgets its own fictional history every few paragraphs.
