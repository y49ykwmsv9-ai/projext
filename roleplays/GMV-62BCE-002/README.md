# GMV Chapter II — The Second Chapter

## Purpose

This folder is the **new canonical chapter** of the Gaius Maximus Valerius roleplay.

**Chapter II does not reset the simulation.** It inherits the verified end state of **GMV-62BCE-001, Round 114 (4 January 57 BCE)** and begins with **Round 115 (11 January 57 BCE)**.

The previous campaign remains immutable historical canon. This folder is a new chapter with a more advanced simulation, event-selection, and accounting architecture.

## Hyper-Advanced Simulation Contract

### 1. Broad background simulation

Each round simulates the wider campaign, not merely the events shown to the player.

Established systems continue operating in the background:
- commerce and recurring contracts
- agriculture and estate production
- mines and extraction
- transport and logistics
- roads and facilities
- military routines
- household and population activity
- political/civic processes
- correspondence and intelligence
- libraries and scholarship
- relationships and local disputes
- construction, maintenance, and other established projects

**Background activity is real state progression, but background activity is not automatically news.**

### 2. Significant-development news filter

Only a material development becomes a player-facing event.

A development should surface when it produces a meaningful:
- decision
- discovery
- consequence
- conflict
- opportunity
- transaction
- change in circumstances
- breakthrough
- loss
- gain
- diplomatic/social development
- political/procedural development
- military development
- geographic development
- other genuinely newsworthy result

Routine continuation is normally silent.

Examples of normally silent activity:
- a mine continues operating
- guards continue routine patrols
- a contract remains active
- libraries continue cataloguing
- crops continue growing
- a road remains open
- a campaign remains procedurally active

These can still alter canonical state when the simulation supports a real quantitative or qualitative change. They simply do not receive an event unless the development is significant enough.

### 3. Seven-event minimum does not override significance

Every round still contains at least **7 distinct events**.

This does **not** authorize filler.

The generator searches the entire simulated causal field for genuinely distinct significant developments. If several consequences belong to one causal chain, they remain one event. Old threads may remain completely absent from the news for multiple rounds.

### 4. One causal development = one event

Never split:
- an initiating development
- its immediate reaction
- its discovery
- its aftermath
- its material consequence

into separate events when they are one causal chain.

All material consequences occurring within that chain belong inside the same event and its ledger.

### 5. Event categories

Only these final categories are valid:
- Direct
- Connected
- Surprise
- Special
- Ultimate

Classification is based on causal origin, not subject matter.

### 6. Embedded AI event ledger

**Every event contains its own AI-facing ledger. There is no detached round-level event ledger.**

Each event ledger distinguishes:

**Event-caused changes**
- changes directly produced by the event being narrated.

**Background-source changes**
- changes realized during the round by established systems that are not caused by the narrated event.

Every background-source entry must identify its **specific source**.

For example:

```
ai_ledger:
  event_caused:
    intelligence: +38

  background_sources:
    - source: recurring surplus-delivery contract
      changes:
        public_account: +22.5
        private_account: +2.5
      basis: independently realized settlement; not caused by this event

    - source: estate library activity
      changes:
        intelligence: +21
      basis: background development; not caused by this event

  event_total_effect:
    intelligence: +59
    public_account: +22.5
    private_account: +2.5
```

The exact structure may evolve, but the semantic distinction is mandatory.

**Background income must never be falsely attributed to the news event merely because it occurred in the same round.**

### 7. Financial accounting

Realized financial activity must be explicit.

For the recurring surplus-delivery agreement:
- the agreement remains active in background
- each settlement is independently generated from current conditions
- quantities, prices, costs, transport, demand, merchant behavior, and disruptions are dynamic
- no fixed repeated wording, quantity, price, margin, or event structure
- if a settlement is realized, 10% of realized net public profit routes to Valerius's private account and 90% remains public
- preparation or expected future revenue is not booked as realized revenue
- a legitimate disruption may prevent settlement, but its consequences must be simulated and reported if significant

Other established financial sources operate under the same distinction between background realization and newsworthiness.

### 8. Metrics

Use the established fixed metric schema without silently changing scales.

Current inherited state:
- Soldiers: 414
- Population: 257
- Taxation: 3%
- Economy: 100
- Agriculture: 100
- Infrastructure: 100
- Trade: 100
- Readiness: 100
- Morale: 100
- Supply: 0
- Organization: 100
- Stability: 100
- Legitimacy: 100
- Technology: 100
- Exhaustion: 100
- Intelligence: 3,554
- Relations: 100
- Land: 7.959375 sq mi / 5,094 acres
- Temporarily unavailable: 0
- Treasury: 1,668 denarii
- Public account: 3,320.4 denarii
- Private account: 615.6 denarii

### 9. Character continuity

All established characters inherit into Chapter II.

Recurring characters must continue to be referred to by their established names when the current simulation gives them a role. New recurring characters may be introduced when causally warranted and must be persisted.

### 10. Random resolution

Before drafting player-facing events:
- perform a fresh Special roll at the canonical 12% probability
- perform three fresh independent Magnitude-11 checks at 4.7283%
- preserve exact draws and outcomes in the committed resolution record
- never reuse previous-round random values
- successful Magnitude-11 checks initially create Special events
- Surprise and Special events pass the Ultimate Reclassification Gate
- Ultimate is a narrative category, not a second random system

### 11. Validation and persistence

Before a round is canonical:
1. read this chapter README
2. read chapter state
3. recover the exact player directive
4. simulate broadly in the ChatGPT conversation
5. resolve fresh random checks
6. detect significant developments
7. consolidate causal chains
8. generate player-facing news
9. validate metrics, finances, land, military state, classifications, ledger attribution, and current totals
10. persist round/news/state/scenario/index
11. re-read persisted records
12. verify the canonical pointer
13. run continuity/regression checks

A round is not canonical until post-commit verification passes.

## Canonical folder structure

```
roleplays/GMV-62BCE-002/
├── README.md
├── scenario.json
├── state.json
├── canonical-index.json
├── rounds/
│   └── round-N.json
└── news/
    └── round-N.json
```

## Chapter inheritance

**Inherited canon:** GMV-62BCE-001 through Round 114.

**First new round:** Round 115 — 11 January 57 BCE.

Chapter II therefore preserves the entire prior campaign while changing the simulation architecture used to generate and present new developments.
