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

## Armed conflict, warfare, guards, and military-action simulation

Any event involving soldiers, guards, armed civilians, militias, raids, ambushes, sieges, battles, occupations, executions, massacres, patrols, escorts, military training, mobilization, or other armed conflict must be resolved as a **lived simulation event**, not as a thin cinematic summary.

### Resolution before narration

The engine must resolve the underlying military state before writing the article. At minimum, when relevant, account for:
- forces, formations, commanders, unit roles, experience, readiness, morale, organization, supply, equipment, terrain, weather, visibility, fortifications, roads, rivers, crossings, elevation, and local geography;
- objectives and orders of every participating actor;
- intelligence quality and what each side actually knows;
- surprise, scouting, reconnaissance, deception, communications, command delay, confusion, and misinformation;
- positioning, movement, reserves, flanks, pursuit, withdrawal, reinforcement, encirclement, and routes of escape;
- weapons and period-appropriate tactical capabilities;
- fatigue, hunger, thirst, wounds, disease, fear, panic, discipline, cohesion, and exhaustion where relevant;
- civilian presence and civilian consequences where applicable;
- prisoners, missing personnel, captured equipment, destroyed supplies, damaged infrastructure, and territorial/control changes when applicable;
- permanent losses, temporary unavailable personnel, surviving strength, and the resulting military state.

The numerical resolution is authoritative. Narrative may not invent casualties, victories, troop movements, captures, or territorial changes that were not resolved in state.

### Mandatory shared command-training standard

When Valerius orders shared military training, participation is mandatory for the entire force. Officers and Valerius himself must perform the same exercises imposed on the ordinary soldiers under their command, using the same physical and equipment standards unless a specific resolved condition makes that impossible. Command rank is not an exemption from marching, formation work, weapons practice, surprise-response drills, casualty-recovery exercises, controlled pursuit, or other training assigned to the ranks. Where command responsibilities permit, officers are required to meet or exceed the physical and procedural standard of the men they command; Valerius is subject to the same requirement and personally participates.

This is a persistent campaign rule rather than a one-round narrative detail. The resolver should model the actual consequences of shared training, including improved understanding of command burdens, exposed weaknesses, fatigue, injury, recovery, morale, discipline, and continuity of command when those outcomes are supported by state. Officers may suffer the same training risks as soldiers, and those risks must be recorded rather than ignored merely because the affected person is an officer. At the same time, the rule does not make injury or success automatic: training outcomes remain simulation results.

The purpose is to ensure that leadership is physically and operationally grounded in the same conditions imposed on the ranks. An officer who orders a demanding exercise cannot be treated as having completed it merely by observing it. Valerius cannot satisfy this rule by supervising from outside the formation; he must personally participate whenever the exercise is one his men are required to perform.

### Valerius personal combat profile

Valerius's established combat characteristics are persistent simulation inputs, not merely narrative flavor. He has served as a centurion for a long period, has repeatedly participated in combat, has maintained continuous martial training, and is established as being in exceptional, beyond-peak physical condition. When Valerius personally participates in an armed engagement, the resolver must account for these attributes before determining his actions and outcomes.

- Exceptional conditioning materially affects strength, speed, endurance, balance, coordination, recovery, and sustained physical performance.
- Long centurion experience materially affects tactical judgment, threat recognition, timing, positioning, discipline under pressure, command decisions, and interpretation of changing battlefield conditions.
- Repeated combat experience means battlefield noise, confusion, pressure, fatigue, and close-quarters conditions are modeled as familiar operating conditions rather than automatic penalties.
- Conditioning can affect the actual resolution: maintaining formation position, crossing difficult terrain, sustaining prolonged effort, pursuing or disengaging, recovering from exertion, and remaining effective under physical strain.
- Athleticism and experience provide contextual advantages, but never guarantee victory, survival, immunity from injury, or exceptional feats unsupported by the resolved situation.
- If Valerius is injured, sick, exhausted, captured, or otherwise impaired, the condition becomes persistent state when resolved and affects subsequent combat until recovery is established.
- Valerius's personal participation is mandatory whenever his forces enter an engagement covered by his oath and promise. His physical attributes therefore apply to the actual resolution, not merely to the narrative.

These characteristics are not a generic hidden bonus. Their effects depend on terrain, equipment, opposition, formation, orders, fatigue, visibility, surprise, numbers, injuries, and other resolved conditions.

### Warfare must feel experienced, not summarized

Military events must not read like a movie trailer, battle synopsis, or detached list of outcomes. The player should receive enough grounded sensory and situational detail to understand what participation or observation would actually feel like within the character's information and position.

A detailed combat report should convey, where the resolved event supports it:
- the physical environment and conditions before contact;
- what the character's side could see, hear, understand, and misunderstand;
- the buildup of tension before violence;
- movement and tactical decisions as they unfold;
- the changing condition of formations and individuals;
- fear, confusion, courage, exhaustion, discipline, hesitation, panic, and leadership;
- the immediate human consequences of violence;
- moments of initiative, sacrifice, endurance, failure, or exceptional valor when supported by game state;
- the aftermath: wounded, dead, missing, prisoners, damaged positions, abandoned equipment, displaced civilians, morale, supply, and command consequences.

The prose should make the event **visceral, grounded, and immediate** without becoming gratuitously graphic. When the simulation produces severe violence, the account may describe blood, wounds, death, terror, physical exhaustion, and destruction with concrete period-appropriate language, but it must remain relevant to the event rather than becoming gore for its own sake.

### Tone is determined by simulation state

The engine must not assume that warfare is always heroic, always tragic, always victorious, or always horrific.

Tone must emerge from the resolved conditions:
- disciplined success can produce confidence, relief, pride, or valor;
- desperate defense can produce terror, sacrifice, endurance, and grim determination;
- catastrophic defeat can produce confusion, grief, rout, capture, destruction, and lasting trauma;
- brutal fighting can be frightening and gruesome;
- extraordinary conduct can be massively valorous when the state and evidence support it;
- a strategically successful action can still have terrible human costs;
- a tactical victory can create an economically or politically damaging aftermath;
- an apparent defeat can become a successful withdrawal, preservation of the army, or later opportunity.

**Success, failure, casualty severity, heroism, brutality, and emotional tone must therefore be outputs of the simulation rather than predetermined narrative choices.**

### Constant detail, variable outcome

The **level of detail is a fixed presentation requirement**. It must not become shorter simply because the player's side is losing, nor longer merely because the player's side is winning.

The same standard of detailed reporting applies to:
- victories;
- defeats;
- stalemates;
- retreats;
- ambushes;
- raids;
- sieges;
- skirmishes;
- patrol clashes;
- guard actions;
- failed attacks;
- successful attacks;
- massacres or atrocities when actually resolved;
- non-combat military incidents with meaningful consequences.

The event's **content, tone, intensity, and outcome vary with game logic; the reporting standard does not.**

### Guards and non-battle armed events

Guards, escorts, patrols, sentries, household troops, bodyguards, and security forces are simulated as real actors rather than decorative background characters.

A guard action must account for the relevant duty, orders, threat assessment, location, visibility, available personnel, response time, weapons, command authority, and consequences. A tense guard incident may involve no combat at all; conversely, a routine security duty may escalate into violence if the state supports it.

Do not turn every guard encounter into a battle. Do not turn every military movement into combat. The simulation determines whether contact, violence, pursuit, negotiation, surrender, escape, arrest, or no confrontation occurs.

### Military causality and persistence

Combat changes the world beyond the battlefield when warranted. Consider downstream effects on:
- troop strength and manpower;
- readiness, morale, supply, organization, and war exhaustion;
- commanders and political leadership;
- stability and legitimacy;
- Treasury and economic output;
- agriculture and trade;
- infrastructure;
- population, deaths, migration, displacement, and disease;
- relations and diplomatic incentives;
- intelligence and future planning;
- territorial control and land area when actually changed.

A battle is therefore not complete when the fighting stops. The simulation must process its immediate aftermath and any persistent consequences that logically follow.

### Civilian and noncombatant treatment

Where armed conflict affects civilians, the simulation should distinguish soldiers from noncombatants and report civilian displacement, casualties, property loss, hunger, disease, flight, refuge, or political consequences when those outcomes are actually resolved. Do not invent civilian suffering merely to intensify a scene.

### Military article standard

For a meaningful armed-conflict event, the narrative should normally contain a complete sequence rather than jumping directly from "the armies met" to "Valerius won":

1. situation and setting;
2. contact or escalation;
3. tactical development;
4. turning points and decisions;
5. human experience and consequences;
6. resolution;
7. immediate aftermath and implications.

This sequence is a narrative standard, not a fixed script. Events may unfold differently when the resolved situation warrants it.


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

### Full-history causal event logic

Future GMV event resolution MUST evaluate the complete canonical campaign history available before the current round, not merely the immediately preceding round.

The history window is append-only and cumulative: every prior round, event, player directive, investment, financial transaction, relationship change, military development, infrastructure change, intelligence discovery, unresolved consequence, recovery, loss, acquisition, diplomatic interaction, and other persistent state transition is eligible to influence future event logic when causally relevant. The resolver must inspect the historical record across all preceding rounds before generating the current round.

Past investments are persistent causal inputs, not isolated transactions. An investment can create delayed returns, maintenance obligations, dependencies, exposure, opportunities, political relationships, resource flows, strategic consequences, or failures in later rounds. Those consequences may surface many rounds after the original investment and must remain available to the resolver until resolved or rendered causally irrelevant by subsequent state.

Historical continuity must therefore work on two levels:
1. **State continuity:** current authoritative metrics and persistent state are carried forward exactly.
2. **Event-memory continuity:** the resolver can trace prior events and their consequences across the entire chronology, including events whose immediate metric effect was zero.

A prior event does not need to have changed a top-line metric to remain causally relevant. Examples include a past scouting discovery that later changes route knowledge, an earlier diplomatic interaction that later affects negotiations, a previous construction or investment that changes capacity, a training reform that changes how a later battle is resolved, or a prior unresolved threat that reappears after several rounds.

For every new round, the simulation should construct a historical context from all rounds before the current round, identify causally relevant antecedents, and use those antecedents when resolving actors, opportunities, risks, reactions, investments, military situations, economics, diplomacy, and surprises. Events should reference older developments naturally when those developments actually matter; they should not artificially mention history merely to create continuity.

The immediately previous round remains important, but it is only the newest layer of the historical context, never the sole source of continuity. No future round may silently discard earlier causal threads simply because they are more than one round old.

This rule is part of the simulation contract and is a hard continuity requirement for GMV-62BCE-001.

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


## Persistent property and private-asset ledger

The campaign state must maintain a persistent, append-only **property ledger** rather than treating Land Area as a standalone number. Land Area is a derived aggregate of the currently active property/territorial holdings represented in that ledger.

Every property or holding that enters the canonical history must have a stable holding ID and, when known, exact:
- asset/holding name;
- asset type;
- location;
- area and explicit unit;
- acquisition date;
- acquisition round;
- acquisition value/price;
- currency/account used to acquire it;
- seller/counterparty;
- acquisition source event;
- current status;
- disposal date/value if later sold or transferred;
- provenance and confidence.

Historical records may legitimately lack one of these facts. **Missing historical information must be represented explicitly as null/unknown with provenance; it must never be invented or inferred merely to make the ledger complete.** If an older round gives only an aggregate, preserve that aggregate as an aggregate record and mark its component breakdown as unresolved.

The ledger is cumulative and persistent. A later round may add, modify the status of, or dispose of a holding, but it may not erase the historical acquisition record. If a property is restored, subdivided, combined, leased, mortgaged, transferred, or otherwise changes status, the ledger records the transition while preserving the original acquisition record.

### Property-ledger reconciliation

At every canonical state:
1. The active property ledger is the source of truth for property holdings.
2. `metrics.land_area_sq_miles` must equal the sum of active ledger areas in square miles, to the precision actually supported by the records.
3. `holdings.land_area_sq_miles` must equal that same derived total.
4. A property purchase must create a corresponding acquisition ledger entry and a corresponding financial ledger entry when a price is actually established.
5. A restoration/repair expense must not be silently counted as property acquisition price.
6. An aggregate historical acquisition whose price is not preserved must remain a distinct unresolved accounting item; its value must not be fabricated.
7. If an acquisition date, area, or price cannot be established from the canonical chronology, it remains unresolved until historical reconstruction finds a source.
8. Disposal or transfer must subtract the disposed property's recorded area from the active aggregate and preserve the original record.
9. Property records are never deleted merely because the property changes hands.
10. The private-wealth ledger must reconcile asset acquisition/disposal and realized income against Currency and Private Wealth without double-counting cash.

### Historical-data completeness gate

A future round is **not eligible to become canonical** merely because the latest state file, scenario pointer, or round file appears internally consistent.

Before generating or accepting "the next round," the engine must audit every prior round from Round 1 through the current canonical round and verify:
- every round file exists;
- every corresponding news file exists;
- every historical round conforms to the current normalized schema or has an explicit, validated migration record;
- chronology has no gaps;
- every event/news pair has parity;
- every persistent metric mutation has a valid ledger;
- financial movements reconcile;
- military quantities reconcile;
- property/land acquisitions and disposals reconcile against the persistent property ledger;
- persistent private assets and wealth movements are traceable to source events or explicit legacy-migration records;
- scenario/state pointers agree;
- the canonical files are actually present in the committed Git history;
- the checkout used for validation is clean and the validator is evaluating the committed revision, not merely an uncommitted working copy.

This is a **hard precondition** for advancing the simulation. If any historical round fails, the engine must stop at the current canonical round and repair/migrate the historical record before generating another round.

A file existing on disk, being visible through an API, or having a plausible "commit_check" field is not proof that it was actually committed. Commit verification must inspect the repository's real Git state and re-read the committed files. A self-authored boolean such as `verified: true` is evidence only when independently verified by the repository validator.

### Random-resolution auditability

Random checks are stateful audit records, not narrative claims. Every round that invokes the standard special-event opportunity or magnitude-11 resolution must persist the actual fresh random draws used by the resolver, the probability threshold, the result, and the accepted outcome. The displayed probability may remain constant across independent trials; the random draw must be newly generated and persisted for each trial.

The engine must never invent, backfill, or manually type a random draw after the fact. If a random-resolution record cannot be independently reconstructed from the persisted round data, that round fails the canonical gate.

### Canonical next-round lock

The command **"give me the next round"** means: first run the full historical/schema/commit audit described above. If that audit does not pass, do not generate the next round. Instead, identify the blocking records and repair the canonical data layer first.

The same lock applies even when the requested round is only a continuation of an apparently simple action. No new simulation output may be presented as canonical until all preceding canonical records satisfy the current data contract and the prior round is verified as genuinely committed.

### Canonical commit proof

A canonical round requires two distinct proofs:
1. **Content validation:** the round, news, state, scenario, property ledger, and required schemas pass validation.
2. **Repository validation:** the exact committed revision containing those files is re-read from GitHub/Git and verified to contain the validated contents, with no uncommitted canonical changes.

The phrase "committed" must therefore mean an actual repository commit, not an intended write, an API request that was not verified, a field inside JSON claiming verification, or an unconfirmed tool response.


## Persistent property ledger and canonical next-round lock

Land Area is a derived aggregate, not a standalone number. The campaign must maintain an append-only property ledger with stable holding IDs and, when supported by the historical record, exact asset name/type, location, area and unit, acquisition date, acquisition round, acquisition price, paying account, seller/counterparty, source event, current status, and disposal date/value. Missing historical facts are represented explicitly as null/unknown with provenance; they are never invented to make the ledger look complete.

A later round may add, restore, subdivide, combine, transfer, dispose of, or otherwise change a holding, but it may never erase the original acquisition record. Active ledger areas are summed to derive metrics.land_area_sq_miles and holdings.land_area_sq_miles. Purchase consideration and restoration/repair costs must remain separate when the source distinguishes them; if the source only gives a combined expenditure, the combined amount must remain explicitly unresolved rather than being silently treated as purchase price.

Private Wealth must likewise remain traceable to a persistent private-asset/cash history. Property acquisition, disposal, investment principal, realized return, Currency, and Private Wealth must not double-count the same money.

### Historical schema/commit gate

The command "give me the next round" is hard-locked behind a full historical audit. Before generating a new round, the validator must inspect every preceding round, not only the latest one, and require: complete round/news files; current-schema conformance or explicit validated migration; chronology with no gaps; event/news parity; ledger arithmetic; financial reconciliation; military conservation; property/land reconciliation; traceable private-asset movements; scenario/state pointer agreement; and actual Git commit verification.

A self-authored verified=true field, an API write response, or a file merely existing in a working copy is not proof of persistence. The validator must verify the actual committed revision and re-read the committed canonical files. If any previous round fails the current data contract, do not generate the next round. Repair or migrate the historical data first.

### Random-resolution audit trail

Every special-event opportunity and magnitude-11 resolution must persist the actual fresh random draw(s), the probability/threshold, the result, and the accepted outcome. A fixed probability may remain constant across independent trials; the draw itself must be fresh for each trial. Random values may never be fabricated or backfilled after narration. A round whose random-resolution record cannot be independently audited is not canonical.

### Historical ledger reconstruction rule

When an older round gives only an aggregate—such as the Round 33 cumulative land baseline—or combines purchase and restoration costs, preserve exactly what the source establishes and mark the component facts unresolved. Do not infer individual acquisition prices, dates, or areas from the aggregate. The unresolved record remains in the ledger until the chronology provides a defensible source.

The current GMV state therefore includes a persistent property-ledger audit status. Until that historical reconstruction and repository-wide schema audit passes, the next-round gate remains blocked.


## Exact Monetary, Tax, and Investment Continuity Contract

The existing GMV metrics must be understood and calculated with exact mathematical financial logic. This section introduces **no new player-facing metrics or new top-line ledgers**.

### Exact arithmetic
- Every applicable financial flow is calculated exactly before narrative generation.
- Start from the prior canonical state, identify all active established mechanisms, determine the elapsed accrual period, apply only established rates/fixed amounts/contractual terms or mathematically defensible rules, calculate gross receipts, established costs, net realized returns, taxes and transfers, then route the result to the correct existing metric.
- Do not invent convenient deltas, round amounts for narrative convenience, or allow established income-producing mechanisms to silently stagnate.
- The exact inputs, ownership, period, rate or fixed amount, formula, destination, and provenance may be persisted internally in GitHub so future rounds can reproduce the calculation.
- The exact internal arithmetic is the logical basis for subsequent rounds; it is not required to appear in player-facing historical/news prose.

### Existing monetary metrics remain distinct
- **Treasury** = liquid public/estate money.
- **Currency** = Valerius's personal liquid money.
- **Public Wealth** = broader public/estate asset position.
- **Private Wealth** = broader private asset position.
- Transfers between these concepts require an explicit modeled transaction or established rule.
- The same economic value must never be counted twice merely because it appears in a cash metric and a broader wealth metric.

### Investment-type separation
Existing investments must remain separated according to ownership, purpose, funding source, and destination using the campaign's established records. This is interpretation of existing data, not a new player-facing measure.

Where supported, distinguish:
- public/estate investments funded from Treasury/public assets;
- private investments funded from Currency/private assets;
- commercial investments using the already established gross-receipt, operating/security/maintenance-cost, principal, return, net-profit, and private-transfer logic;
- established debt obligations/receivables, including the grain, shipping, and lake-port obligations already present in the chronology;
- property purchases and restoration/repair expenditures, which are not automatically income-producing investments.

If the historical record does not establish ownership, rate, amount, destination, or terms, retain the uncertainty rather than inventing it.

### Passive income is persistent
An established income-producing investment or recurring financial mechanism continues to operate in subsequent rounds unless the historical state records liquidation, interruption, default, loss, or another causal termination.

For every applicable round, evaluate established:
- return rate or fixed return;
- accrual period;
- operating/security/maintenance/collection costs;
- realized versus unrealized return where supported;
- principal preservation or liquidation;
- taxes and established private-transfer effects;
- ownership and correct destination account;
- delayed defaults, interruptions, losses, or windfalls supported by the chronology.

If a known rate or mathematically derivable return exists, calculate the exact amount for the elapsed period. If a fixed amount or established commercial account defines the return, use that instead of inventing a percentage. If no defensible amount/rate exists, preserve the unresolved condition and do not manufacture passive income.

### Recurring estate tax
The established **3% income-based estate tax** is a recurring financial mechanism, not a one-time narrative fact.

When qualifying taxable income exists:
1. identify the established taxable-income basis;
2. calculate exactly 3% of that amount;
3. credit the public/estate receipt to Treasury when appropriate;
4. reduce the corresponding taxable/private income where appropriate;
5. keep tax revenue distinct from investment principal, private receipts, and broader wealth.

Do not charge tax merely because time passed if there is no taxable income under the established rule. Do not create a new tax base, rate, or metric.

### Private transfer mechanism
The established private transfer rate remains separate from taxation. When qualifying private commercial profit triggers that mechanism, calculate the exact transfer from the private side to the public/estate side and record it as a transfer rather than gross public income.

### Financial conservation
Before a round becomes canonical:
- every financial increase/decrease has a source;
- every transfer has source and destination;
- investment principal is not mistaken for income;
- realized returns are not counted again as principal;
- taxes are not counted as private income;
- private transfers are not counted twice;
- property purchase consideration is not silently mixed with restoration/repair expenditure;
- Treasury, Currency, Public Wealth, and Private Wealth reconcile exactly to the prior state plus resolved flows.

### Player-facing separation
Exact financial calculations are **internal simulation memory and GitHub canonical logic**. Player-facing news should report the actual historical/newsworthy consequence, not bookkeeping formulas or intermediate calculations, unless the financial information itself becomes public and historically relevant. AI Ledgers continue to show only the established metrics actually changed by the event; the underlying exact calculations remain in canonical persistence.

### Round gate
Before generating the next canonical round, the resolver must evaluate all established recurring financial mechanisms across the full elapsed period, using the complete canonical history. This financial continuity check is part of the existing full-history/schema/commit gate. No new round may silently ignore established passive income, tax flows, investment returns, debt payments, or private-transfer effects.
