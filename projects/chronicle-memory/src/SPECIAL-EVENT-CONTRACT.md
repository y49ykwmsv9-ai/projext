# Special Event Selection Contract

## Purpose

Special events are deliberately rare, unusually consequential developments. They should occur often enough to make the world feel capable of producing exceptional turns, but never become a routine event slot or a guaranteed reward for advancing time.

This contract supersedes older special-event frequency wording while preserving the fixed metric schema and the established exponential magnitude influence formula.

## 1. Special-event opportunity rate

Baseline: **12% per round**.

Dry-spell adjustment:
- 0-2 consecutive no-special rounds: +0 percentage points.
- 3 consecutive no-special rounds: +2 points.
- 4 consecutive no-special rounds: +4 points.
- 5+ consecutive no-special rounds: +6 points maximum.

Overall opportunity probability is capped at **18%**.

This is an opportunity, not a guarantee. A successful opportunity check still requires a plausible candidate.

## 2. Magnitude probability distribution

Once a special-event opportunity exists and a candidate passes the plausibility gate, magnitude is selected using the **same exponential function that determines the Change Index**.

**Change Index(m) = 1.25^(m - 1)**

Magnitude weighting is the inverse of that Change Index:

**Raw Magnitude Weight(m) = 1 / 1.25^(m - 1)**

The ten raw weights are normalized so the conditional magnitude probabilities sum to 100%:

**P(m | special event) = [1 / 1.25^(m - 1)] / sum[n=1..10] [1 / 1.25^(n - 1)]**

Current distribution:

| Magnitude | Change Index | Chance if special event occurs | Unconditional chance at 12% opportunity |
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

The distribution controls prior probability, not plausibility. A magnitude 10 event still requires exceptionally strong justification.

## 3. Influence

Magnitude affects state influence through the established Change Index:

**Change Index = 1.25^(magnitude - 1)**

This scales a causally justified base effect. It does not automatically change every metric by that factor.

## 4. Selection order

1. Calculate the round's special-event opportunity probability.
2. Determine whether a plausible candidate exists.
3. If eligible, select magnitude using the normalized inverse-Change-Index distribution.
4. Apply candidate-specific plausibility constraints. A selected magnitude may be rejected or reduced if the event cannot credibly support that magnitude.
5. Calculate actual metric effects from causal base effects and Change Index.
6. Persist the selected event, magnitude, effects, and resulting state.

No dry-spell rule directly selects magnitude.

## 5. No quota

Never use language such as "a special event is due." Clusters and dry periods are both valid. The dry-spell adjustment only changes opportunity probability.

## 6. Event category

SPECIAL is a significance classification, not a relationship category.

A special event must also retain its ordinary relationship category: DIRECT, CONNECTED, WORLD, or SURPRISE.

Record `type` as the relationship category, plus `special_event: true`, `magnitude: 1-10`, and `change_index`.

## 7. Narrative requirements

Special events receive substantially more detailed reporting than ordinary events. Major battles require standalone multi-paragraph accounts, followed by separate aftermath where appropriate.

Public news must never mention probability rolls, dry-spell compensation, magnitude-selection mechanics, Change Index calculations, hidden causal scoring, or engine reasoning.

## 8. Continuity

Once committed, the selected magnitude, event identity, causal basis, effects, and resulting state mutations become persistent scenario facts.

## 9. Frequency target

The intended long-run behavior remains approximately one special event every 8-12 rounds on average, with substantial variance. This is a target for overall feel, not a scheduling rule.

Magnitude 1-4 should make up most special events. Magnitudes 7-10 remain substantially rarer.
