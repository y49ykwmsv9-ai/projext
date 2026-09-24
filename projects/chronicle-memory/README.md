# Chronicle Memory Roleplay Engine

**Project ID:** chronicle-memory

Chronicle Memory is an isolated alternate-history roleplay and simulation project. The conversation is the gameplay interface; GitHub stores canonical rules, schemas, state, historical references, validation code, and campaign records. It is separate from Worldforge, Chronicle AI, and Historix Renderer.

## Roleplay operating contract

### Time and rounds
- The player controls time advancement. Ordinary actions do not advance the calendar unless explicitly requested or their modeled completion requires later processing.
- Every substantive game response identifies the current Round and Date.
- A time advance parses the requested duration, advances the calendar, increments the round, processes ongoing projects and systemic changes, resolves autonomous actors, generates relevant events, updates state/memory/causal links, and reports the result.
- Historical dates are context, not commands to reproduce real-world outcomes.

### Natural-language actions
Every actionable instruction is interpreted into actor, action/intent, target, location, timing, prerequisites/resources, uncertainty, immediate effects, delayed effects, reactions, unintended consequences, and causal links. Actions may succeed, partially succeed, fail, be delayed, create unintended outcomes, trigger reactions, create opportunities, consume resources without achieving the goal, or create persistent projects.

### Autonomous actors and information
Other characters, governments, factions, institutions, armies, merchants, religious organizations, cities, and populations act independently according to interests, resources, information, institutions, geography, relationships, and prior experience. Actors cannot use information unavailable to them.

The simulation separates what actually happened, what the player knows, what the player's character knows, what another actor knows, and what is suspected, inferred, or rumored. Secret actions therefore do not automatically become public knowledge.

### Historical baseline and divergence
Historical reference material initializes conditions such as geography, population, institutions, technology, economics, military capacity, relationships, people, cities, infrastructure, and events where supported. Once play begins, accumulated scenario state is authoritative. The engine must never force a historical event merely because the real-world calendar reaches its historical date.

Historical estimates remain distinguishable from simulation values. A source estimate may be converted into a documented starting value; subsequent changes are simulation state and retain provenance.

## Dynamic event and news rules

**Dynamic events are a permanent rule for every future round, not a special rule for any particular storyline or action.**

The objective is a living, causally coherent world without manufactured drama or filler.

### Dynamic-event requirements
Future events should, when supported by resolved state:
- contain distinct developments rather than repetitive administrative steps;
- include meaningful opportunities, complications, reversals, discoveries, reactions, consequences, or new story threads;
- vary across military, political, diplomatic, economic, social, logistical, geographic, personal, technological, environmental, and other relevant domains;
- give autonomous actors genuine agency;
- allow beneficial, costly, ambiguous, mixed, delayed, and unintended outcomes;
- create persistent consequences when warranted;
- reflect geography, resources, institutions, information, logistics, prior history, and current state;
- remain period-authentic and historically plausible without becoming scripted history;
- make SURPRISE events genuinely unexpected while remaining causally defensible;
- scale narrative detail with significance.

Dynamic does not mean artificially dramatic. Do not invent a crisis, battle, discovery, betrayal, or windfall merely to make a round exciting. If the simulation supports only a quiet development, report it accurately.

### News-cycle rules
A time advance produces a news cycle rather than a dry status dump. The default presentation target is 5–10 distinct newsworthy articles per time leap, adjusted for actual event density and duration:
- 1 week: usually about 5;
- 1 month: usually 5–7;
- 1 year: usually 6–10;
- multi-year/decade leaps: up to 10, with major developments receiving more narrative space.

These are presentation targets, not permission to create filler. Each article must correspond to a real resolved event/state record. A news article must not be a disguised explanation of internal simulation logic.

Each substantive event normally uses a period-authentic 5–7 sentence account describing what happened, who was involved, where it occurred, relevant causes and consequences, and what information reached the player. Major events may be longer or multipart.

A nation, faction, person, institution, place, or asset mentioned in an article must be a real scenario entity and the article must have a corresponding structured event record. The article is the narrative view of state, not decorative fiction.

## Causal simulation rules

Numbers are first-class game state. Once a scenario establishes a numerical value, later rounds use that value unless a valid state mutation changes it.

Current value = starting value + recorded positive changes - recorded negative changes + modeled growth/decay.

Important systems must interact causally. Examples include population to tax base to Treasury, population to manpower, infrastructure to production/trade capacity, trade to income to Treasury, conscription to manpower and labor availability, labor shortage to production and food prices, food shortage to mortality/migration/unrest, military mobilization to Treasury/food/labor consumption, and war to casualties/trade disruption/migration/political effects.

A player-facing event describes actual consequences, not merely the player's instruction. Internal causal calculations are not news unless they themselves create a newsworthy consequence.

## Special-event magnitude system

GMV special events use one fixed significance system.

- Magnitude 1–10: resolved event significance/intensity; 1 minor, 10 exceptional.
- Magnitude is assigned after simulation resolution from actual scope, consequences, actors, resources at stake, and persistence.
- Magnitude does not guarantee success, positive outcomes, casualties, territory, or any other result.
- Magnitude 11 is an exceptional extension/check, not part of the ordinary 1–10 scale.
- Magnitude never replaces fixed simulation metrics.

When active, structured resolution records opportunity/chance, selection, resolved magnitude, change-index data where used, magnitude-11 eligibility/checks, raw successes, accepted candidates, and magnitude-11 events. If no special event is selected, special_event is null. Never fabricate a SPECIAL event. SURPRISE is an ordinary event category and does not imply a special event or magnitude.

## Canonical player-facing round format

Every event uses this structure:

• EVENT N
• Date: <date>
• Type: DIRECT / CONNECTED / SURPRISE / SPECIAL
• Entities: <actual involved entities>

HEADLINE

<5–7 sentence period-authentic news article>

AI Ledger
<only metrics changed by this event>

The fixed player-facing event categories are exactly DIRECT, CONNECTED, SURPRISE, and SPECIAL. Do not replace them with internal resolver labels or subject-matter categories.

Every event ledger lists only metrics actually changed by that event and records before → after, delta, unit, reason, source_event_id, and provenance in structured persistence. Unchanged metrics do not receive fake zero entries.

Round end uses the same metric vocabulary every round:

Population, Currency, Treasury, Soldiers, Taxation, Economy, Agriculture, Infrastructure, Trade, Readiness, Morale, Supply, Organization, Stability, Legitimacy, Exhaustion, Technology, Intelligence, Relations, and Land Area.

The end-of-round state also reports applicable accounting fields.

## Canonical metric definitions and scales

One metric vocabulary is used across all rounds. New rounds must not invent alternate indexes for concepts already defined here.

| Metric | Unit / scale | Specific definition |
|---|---|---|
| Population | exact people | Total modeled resident population at the recorded date. |
| Births | exact people/period | Recorded births during the period. |
| Deaths | exact people/period | Recorded deaths during the period. |
| Migration | exact people/period | Migration into or out of the modeled population; direction must be explicit. |
| Treasury | exact currency units | Immediately spendable public/estate liquid account for procurement, construction, administration, military costs, and other public-side expenditure. |
| Currency | exact currency units | Valerius's net liquid monetary position: coined money and liquid monetary claims personally available to him after recorded monetary inflows/outflows. |
| Public Wealth | exact currency/asset value as defined by scenario | Broader public/estate asset account; not interchangeable with Treasury. |
| Private Wealth | exact currency/asset value as defined by scenario | Broader personally owned asset account; not interchangeable with Currency. |
| Tax Burden / Taxation | 0–100 | Modeled burden imposed by taxation; 0 = none, 100 = maximum modeled burden. |
| Economic Output | 0–100 | Relative condition of aggregate modeled economic production/activity. |
| Agricultural Output | 0–100 | Relative productive condition of agriculture. |
| Infrastructure | 0–100 | Condition/capacity of modeled infrastructure supporting settlement, production, movement, administration, and logistics. |
| Trade Activity | 0–100 | Relative level of active commercial exchange and trade throughput. |
| Relations | -100 to +100 | Relationship condition between specified actors: -100 maximally hostile, 0 neutral, +100 exceptionally aligned. |
| Stability | 0–100 | Internal political/social order and resistance to disruption; 0 = collapse-level instability, 100 = highly stable. |
| Legitimacy | 0–100 | Perceived/accepted authority of the relevant ruler, government, or political order. |
| Total Troops | exact soldiers | Total serving military personnel in the modeled force. |
| Available Troops | exact soldiers | Serving troops not currently committed to deployment or fixed garrison. |
| Deployed Troops | exact soldiers | Serving troops committed to a field formation, front, expedition, or active deployment. |
| Garrison Troops | exact soldiers | Serving troops assigned to fixed defensive garrisons. |
| Reserve Manpower | exact people | Eligible manpower not currently serving in the military. |
| Readiness | 0–100 | Operational preparedness of the force for modeled tasks. |
| Morale | 0–100 | Willingness, cohesion, confidence, and fighting spirit of the force. |
| Supply | 0–100 | Ability of the current force to sustain operations with food, equipment, transport, and other required supplies. |
| Organization | 0–100 | Command cohesion, unit organization, discipline, and operational coordination. |
| Permanent Losses | exact soldiers | Irrecoverable military personnel losses, including deaths or other permanent removals from service. |
| Temporary Unavailable | exact soldiers | Serving personnel temporarily unavailable because of wounds, sickness, separation, or another explicitly modeled temporary condition. |
| Recruitment Gains | exact soldiers/period | New soldiers added through a valid recruitment event. |
| Reinforcements Received | exact soldiers/period | Existing soldiers transferred into the modeled force from another source. |
| War Exhaustion | 0–100 | Cumulative modeled strain from sustained warfare and its human, economic, political, and logistical effects. |
| Technology | 0–100 | Relative modeled technological capability for the scenario's period and domain. |
| Intelligence Confidence | 0–100 in intended schema | Confidence in the reliability of a specific intelligence assessment or information picture. Legacy cumulative intelligence values remain legacy state rather than being silently redefined. |
| Land Area | exact area with explicit unit | Controlled/owned land represented by the scenario. Current GMV canonical state uses square miles; acres/iugera are derived conversions only. |

### Metric invariants
1. Exact quantities remain exact; never replace people, troops, money, food stocks, casualties, or land with abstract scores.
2. Condition metrics retain their declared scales across every round.
3. Relations always use -100 to +100.
4. No unexplained one-off indexes may appear in new rounds.
5. Every persistent metric mutation records before, delta, after, unit, reason, source_event_id, and provenance.
6. Derived metrics never replace source metrics.
7. Military conservation must reconcile total troops with available, deployed, garrison, and other explicitly tracked serving buckets; temporary unavailable and permanent losses are separately recorded.
8. Battles are resolved numerically before narration; articles cannot invent or alter troop/casualty results.
9. Legacy records may retain historical schema fields for auditability, but all new rounds use this contract.

## Canonical accounting definitions

### Treasury
Treasury is the public/estate liquid account. It changes when public/estate revenue is received, public/estate expenses are paid, or an explicit transfer moves money into or out of the public account.

### Currency
Currency is Valerius's personal liquid-money position. If he receives spendable coined money, Currency increases by the recognized monetary value of that receipt. If he personally spends coins, Currency decreases.

### Private Wealth
Private Wealth is the broader private asset position. It can change through acquisition/disposal of private assets, realized income, investment returns, or other explicitly recorded private transactions. A receipt of personal coin may therefore increase both Currency and Private Wealth: Currency records liquidity; Private Wealth records the broader private asset account.

### Public Wealth
Public Wealth is broader than Treasury and can include non-liquid public/estate assets and accounts. Increasing Public Wealth does not automatically mean Treasury increases.

### Private transfer rate
The private transfer rate is the established fraction of qualifying private commercial profit transferred to the public/estate side. It must be applied consistently when that mechanism is active and recorded separately from gross private receipts.

### Commercial accounting
When modeled commercial activity generates financial change, distinguish where applicable:
- gross receipts;
- operating/security/maintenance costs;
- investment principal;
- realized investment returns;
- net public commercial profit;
- private transfer;
- resulting Treasury/Currency/Private Wealth changes.

Do not count the same monetary value twice across public and private accounts.

### Currency invariant
Any monetary receipt that actually puts spendable coin into Valerius's hands creates a positive Currency ledger entry with before/after values, delta, unit, source_event_id, and provenance. A private receipt must not silently increase Treasury. Public receipts belong in Treasury unless an explicit transfer establishes otherwise.

## Standard state-change record

Every persistent event mutation should be represented by an object equivalent to:

{
  "actor_id": "<actor>",
  "metric": "<fixed metric>",
  "before": 0,
  "delta": 0,
  "after": 0,
  "unit": "<unit>",
  "reason": "<why>",
  "source_event_id": "<event>",
  "provenance": "<source/derivation>"
}

## Mandatory round lifecycle and validation

Before a round is canonical:
1. Resolve campaign ID GMV-62BCE-001.
2. Read the canonical scenario pointer and current state.
3. Confirm continuation starts from the canonical latest round.
4. Resolve dates only from the player's explicit time command.
5. Interpret the action using the natural-language action contract.
6. Resolve state and autonomous actors before narrative.
7. Enforce information boundaries and historical-vs-simulation provenance.
8. Apply only fixed metrics/scales.
9. Reconcile exact quantities, including population, Treasury/Currency, food, manpower, troop buckets, casualties, and land area.
10. Resolve battles numerically before writing articles.
11. Generate news only from resolved event/state records.
12. Ensure every news event maps to a real simulation event and every actor is a real scenario actor.
13. Run the repository validator.
14. If hard validation fails, the round is not canonical.
15. Commit round, news, state, and scenario-pointer records.
16. Re-run validation against the committed state and require the post-commit check to pass.
17. Only then advance the canonical pointer and present the round as authoritative.

Required repository validation includes chronology/state/news parity, fixed metric scales, legacy-metric rejection for new rounds, event/news coverage, ledger arithmetic, financial reconciliation, land synchronization, military conservation, supported event types, and canonical-pointer integrity.

## Required end-of-round gates

### Special-event / magnitude gate
- Resolve the standard special-event opportunity.
- If selected, record magnitude on the 1–10 scale.
- If not selected, record selected=false and magnitude=null.
- Record magnitude-11 eligibility/check data every round.
- Keep SURPRISE separate from the special-event system.

### Commit gate
- Round JSON, news JSON, state, and scenario pointer must be committed.
- Validation must pass against the committed checkout.
- The end-of-round record must state that post-commit verification passed.
- Never advance the canonical pointer to an incomplete or failed round.

## Historical schema migration

The committed GMV chronology is one canonical data series even where older records use earlier schemas. Migration must preserve original data under legacy_record, normalize rounds/news to the current schemas, preserve identity/dates/headlines/articles/visibility/confidence/state changes, use explicit nulls rather than inventing missing values, preserve migration metadata, and never silently alter historical outcomes.

Implementation files:
- projects/chronicle-memory/tools/migrate-gmv-history.js
- projects/chronicle-memory/data/schema/gmv-round-v2.schema.json
- projects/chronicle-memory/validation/validate-gmv.js
- projects/chronicle-memory/validation/guidelines.json
- .github/workflows/chronicle-memory-validation.yml

## Repository role

GitHub is the persistent engineering/reference layer, not the required gameplay interface. Chat is the gameplay interface. The canonical campaign state is authoritative for the alternate timeline once initialized.

GMV-62BCE-001 is the canonical GMV campaign identifier; its round/state/news records live under roleplays/GMV-62BCE-001/.
