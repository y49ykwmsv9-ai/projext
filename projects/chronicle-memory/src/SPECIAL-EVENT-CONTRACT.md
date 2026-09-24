# Special Event Selection Contract

## Purpose

Special events are deliberately rare, unusually consequential developments. They should occur often enough to make the world feel capable of producing exceptional turns, but never become a routine event slot or a guaranteed reward for advancing time.

This contract supersedes any older special-event frequency wording while preserving the existing magnitude system and fixed metric schema.

## 1. Special-event opportunity rate

For each completed time-advance round, the engine performs a special-event eligibility check after ordinary world events have been resolved.

The baseline probability of a special-event opportunity is **12% per round**.

This is an opportunity, not a requirement. A round may produce no special event even when the check succeeds if no candidate event meets the plausibility threshold.

The previous rarity should therefore be relaxed modestly, not eliminated. The engine must never manufacture a special event merely to satisfy a target frequency.

## 2. Dry-spell compensation

To prevent long stretches in which special events effectively disappear, consecutive rounds without a special event apply a small temporary increase:

- 0-2 consecutive no-special rounds: +0 percentage points.
- 3 consecutive no-special rounds: +2 points.
- 4 consecutive no-special rounds: +4 points.
- 5+ consecutive no-special rounds: +6 points maximum.

The resulting opportunity probability is capped at **18%**.

The bonus resets when a special event occurs.

This is a soft correction for prolonged absence, not a pity timer. It does not force an event.

## 3. Candidate quality gate

A special event is eligible only when the underlying event is genuinely more consequential, unusual, or narratively significant than an ordinary DIRECT, CONNECTED, WORLD, or SURPRISE event.

Valid candidates can include:

- major battles;
- decisive discoveries;
- severe but plausible disasters;
- major political or diplomatic shocks;
- unusually consequential commercial developments;
- important territorial changes;
- exceptional military breakthroughs or reversals;
- rare opportunities created by accumulated player actions;
- major developments elsewhere in the world that plausibly reach the player.

Routine patrols, ordinary trade receipts, normal political rumors, small construction progress, and ordinary administrative changes are not special events merely because they are useful to the player.

## 4. Magnitude distribution

Every special event retains the existing **Magnitude 1-10** system.

Magnitude controls rarity and influence:

- **1-2:** uncommon exceptional events;
- **3-4:** distinctly rare events;
- **5-6:** very rare, major developments;
- **7-8:** exceptional events requiring strong causal justification;
- **9:** extraordinary events with substantial historical/simulation significance;
- **10:** extreme outliers reserved for events of exceptional consequence.

Higher magnitude remains exponentially more influential under the established factor:

**Influence factor = 1.25^(magnitude - 1)**

The magnitude is never increased simply because the player has gone several rounds without a special event.

## 5. Magnitude selection

The opportunity check and magnitude check are separate.

First determine whether a special event is warranted. Only then select its magnitude based on:

- causal strength;
- accumulated world conditions;
- player/world impact;
- geographic reach;
- historical plausibility;
- number and importance of actors involved;
- consequences already established in scenario memory.

Low magnitudes should account for most special events. Magnitudes 7-10 remain substantially rarer than magnitudes 1-6.

## 6. No guaranteed Round 18 event

Changing the frequency rules does **not** require rewriting Round 18 with a special event.

When an existing round is regenerated under the new contract, the engine may produce:

- no special event;
- one low-magnitude special event;
- or, when strongly justified, a higher-magnitude special event.

The historical and causal evidence for the round determines the result.

## 7. No special-event quota

Never use language such as "a special event is due" as a reason to generate one.

The absence of special events across several rounds is itself valid world behavior. The dry-spell compensation only prevents the probability from becoming effectively negligible over long periods.

## 8. Interaction with event categories

A special event is a significance classification, not a replacement for ordinary event causality.

A special event may also be:

- DIRECT;
- CONNECTED;
- WORLD;
- SURPRISE.

The event's category must describe its relationship to the player/world. **SPECIAL** describes exceptional significance.

Therefore, when the news schema permits both fields, record both:

- relationship category;
- special_event: true;
- magnitude: 1-10.

Do not turn every SURPRISE into a special event.

## 9. Narrative requirements

Special events must receive substantially more detailed reporting than ordinary events.

Major battles require a standalone multi-paragraph account, followed by a separate aftermath where appropriate. Other high-magnitude events should receive proportionally expanded reporting.

The public article must never mention:

- probability rolls;
- eligibility checks;
- dry-spell compensation;
- magnitude-selection mechanics;
- influence formulas;
- hidden causal scoring;
- engine reasoning.

Those belong to the logic layer only.

## 10. Continuity and persistence

The selected magnitude, special-event identity, causal basis, effects, and resulting state mutations are persistent scenario facts once committed.

A later round must not silently downgrade, erase, or reinterpret a committed special event merely because the real historical timeline would have proceeded differently.

## 11. Frequency target

The intended long-run behavior is approximately **one special event every 8-12 rounds on average**, with substantial variance.

This is a target for overall feel, not a scheduling rule. Clusters and dry periods are both valid.

Magnitude 1-4 events should make up most observed special events. High-magnitude events must remain uncommon even when the overall special-event frequency increases.
