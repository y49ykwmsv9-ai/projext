# Special Event Selection Contract

## Purpose

Special events are deliberately rare, unusually consequential developments. They should occur often enough to make the world feel capable of producing exceptional turns, but never become a routine event slot or a guaranteed reward for advancing time.

This contract preserves the fixed metric schema and the established exponential magnitude influence formula while adding a separate, independently randomized **Magnitude 11** class.

## 1. Standard special-event opportunity rate

Baseline: **12% per round**.

Dry-spell adjustment:
- 0-2 consecutive no-special rounds: +0 percentage points.
- 3 consecutive no-special rounds: +2 points.
- 4 consecutive no-special rounds: +4 points.
- 5+ consecutive no-special rounds: +6 points maximum.

Overall standard special-event opportunity probability is capped at **18%**.

This is an opportunity, not a guarantee. A successful opportunity check still requires a plausible candidate.

## 2. Standard magnitude probability distribution

For Magnitudes 1-10, once a standard special-event opportunity exists and a candidate passes the plausibility gate, magnitude is selected using the same exponential function that determines the Change Index.

**Change Index(m) = 1.25^(m - 1)**

Magnitude weighting is the inverse of that Change Index:

**Raw Magnitude Weight(m) = 1 / 1.25^(m - 1)**

The ten raw weights are normalized so the conditional magnitude probabilities sum to 100%:

**P(m | special event) = [1 / 1.25^(m - 1)] / sum[n=1..10] [1 / 1.25^(n - 1)]**

| Magnitude | Change Index | Chance if standard special event occurs | Unconditional chance at 12% opportunity |
|---:|---:|---:|---:|
| 1 | 1.000x | 22.406% | 2.689% |
| 2 | 1.250x | 17.925% | 2.151% |
| 3 | 1.563x | 14.340% | 1.721% |
| 4 | 1.953x | 11.472% | 1.377% |
| 5 | 2.441x | 9.177% | 1.101% |
| 6 | 3.052x | 7.342% | 0.881% |
| 7 | 3.815x | 5.874% | 0.705% |
| 8 | 4.768x | 4.699% | 0.564% |
| 9 | 5.960x | 3.759% | 0.451% |
| 10 | 7.451x | 3.007% | 0.361% |

The unconditional column changes proportionally with the actual round opportunity probability. At 18%, use the same conditional distribution multiplied by 0.18.

The distribution controls prior probability, not plausibility. A high-magnitude event still requires exceptionally strong causal justification.

## 3. Magnitude 11 exceptional-event system

Magnitude 11 is **outside** the standard 1-10 magnitude distribution.

Its Change Index is:

**Change Index(11) = 1.25^10 = 9.313225746x**

Each round independently draws a new **Magnitude 11 chance** from a uniform **0%-18%** range. The drawn percentage is persisted in the round's logic/state record so the result is reproducible after commitment.

Each round then receives **three independent Magnitude 11 checks** using that round-specific percentage.

Consequences:
- A round may produce **0, 1, 2, or 3 Magnitude 11 events**.
- A long sequence of rounds may produce no Magnitude 11 event at all.
- Multiple Magnitude 11 events may occur in the same round.
- The Magnitude 11 chance is **not** increased by the standard special-event dry-spell adjustment.
- Magnitude 11 does **not** replace or reduce the standard 1-10 special-event opportunity.
- A successful Magnitude 11 check still requires a credible candidate and passes the same plausibility gate. If no candidate can support the event, the check produces no event.
- Multiple successful checks require distinct credible event candidates. The same event cannot simply be duplicated three times.
- Magnitude 11 is exceptionally consequential and should normally be reserved for genuinely extraordinary developments. Its higher influence factor does not authorize implausible events.

Because the percentage itself is re-randomized each round and there are three independent checks, both extended dry periods and clustered Magnitude 11 events are valid outcomes.

## 4. Influence

Magnitude affects state influence through the established Change Index:

**Change Index = 1.25^(magnitude - 1)**

This scales a causally justified base effect. It does not automatically change every metric by that factor.

Magnitude 11 therefore has a 9.313225746x influence factor, but its actual metric effects must remain bounded by the event's causal basis and the fixed metric caps.

## 5. Selection order

For each round:

1. Calculate the standard special-event opportunity probability.
2. Determine whether a plausible standard candidate exists.
3. If eligible, select standard magnitude 1-10 using the normalized inverse-Change-Index distribution.
4. Separately sample the round-specific Magnitude 11 chance from 0%-18%.
5. Perform three independent Magnitude 11 checks using that sampled percentage.
6. For each successful Magnitude 11 check, determine whether a distinct candidate passes the plausibility gate.
7. Apply candidate-specific plausibility constraints. A selected magnitude may be rejected or reduced if the event cannot credibly support it.
8. Calculate actual metric effects from causal base effects and Change Index.
9. Persist every selected event, magnitude, change index, round-specific Magnitude 11 chance, effects, and resulting state.

No dry-spell rule directly selects Magnitude 11.

## 6. No quota

Never use language such as "a special event is due." Clusters and dry periods are both valid.

## 7. Event category

SPECIAL is a significance classification, not a relationship category.

A special event must also retain its ordinary relationship category: DIRECT, CONNECTED, WORLD, or SURPRISE.

Record `type` as the relationship category, plus `special_event: true`, `magnitude`, and `change_index`.

For Magnitude 11 events, also persist the round-level `magnitude_11_chance_percent` and the independent check result that produced each event.

## 8. Narrative requirements

Special events are not ordinary events with larger numbers. They are centerpiece historical developments and must be written as substantial, cinematic historical reporting.

### Standard Magnitudes 1-10

A standard special event must normally be **multi-paragraph**, with a target of approximately **5-8 substantial paragraphs**. The article should read like an extended contemporary account of the event, not a short simulation summary.

The narrative should develop the event across time and consequence:
1. **Opening situation:** establish place, season, actors and circumstances.
2. **Development:** show how the situation unfolds through concrete actions and observable developments.
3. **Escalation or turning point:** identify the moment that makes the event exceptional.
4. **Human and material detail:** describe movement, uncertainty, physical conditions, decisions, losses, gains or reactions appropriate to the event.
5. **Resolution:** explain how the immediate event ends.
6. **Aftermath:** show what people, merchants, soldiers, households, officials or neighboring communities actually observe afterward.
7. **Historical significance within the simulation:** explain the event's immediate meaning through period-appropriate reporting rather than through engine terminology.

The prose should be cinematic in **scene construction, pacing and sensory detail**, while remaining historically grounded. It should feel like an extended article, dispatch or chronicle rather than a screenplay. Avoid artificial camera directions, modern narration, game terminology, probability language or unexplained omniscience.

### Magnitude 11

Magnitude 11 is the exceptional narrative tier and should normally receive an **essay-length, multi-paragraph account**, substantially longer than a normal special event. A target of approximately **8-12 substantial paragraphs** is appropriate, and genuinely extraordinary events may require more.

A Magnitude 11 article should have a clear narrative arc and multiple layers of consequence. It should establish the wider situation, introduce the immediate actors and setting, develop the event through several stages, depict its decisive turning point in detail, and then devote significant space to the immediate and wider aftermath. Where appropriate, it should include different perspectives through witnesses, messengers, merchants, soldiers, household officials or other plausible observers, without granting any character information they could not reasonably possess.

Magnitude 11 events must feel rare because of what happens in the world, not merely because the article announces their rarity. Their extraordinary status must be demonstrated through the scale, novelty, consequence or historical circumstances of the event itself.

### Battles and military catastrophes

Major battles, sieges, massacres, disasters and similarly consequential military events receive additional treatment regardless of magnitude. They should normally contain multiple narrative phases, including preparation, first contact, escalation, decisive action and aftermath. Casualties, captured positions, supplies, equipment and surviving forces must remain consistent with the AI Ledger and later state.

### Public-news boundary

Public news must never mention probability rolls, dry-spell compensation, magnitude-selection mechanics, Change Index calculations, hidden causal scoring, plausibility gates, engine reasoning or internal simulation rules. The reader should experience the event as history happening in the world, not as a system explaining itself.

## 9. Continuity

Once committed, the selected magnitude, event identity, causal basis, effects, and resulting state mutations become persistent scenario facts.

## 10. Frequency target

The standard special-event system retains its intended long-run feel of approximately one standard special event every 8-12 rounds on average, with substantial variance.

Magnitude 11 has a separate distribution and therefore has no fixed long-run quota. Its purpose is to permit genuine outliers, including long stretches with none and occasional clustered rounds with multiple Magnitude 11 events.

