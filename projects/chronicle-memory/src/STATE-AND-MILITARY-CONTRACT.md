# State and Military Persistence Contract

## Purpose

The repository is the authoritative audit trail for the alternate-history simulation. Each completed round is immutable historical memory for the simulation and is stored in its own round file.

## Round files

Every round writes:

`data/rounds/<scenario-id>/round-0001.json`

then:

`round-0002.json`, `round-0003.json`, etc.

A round file contains the events resolved during that round, all state mutations, the military ledger, and the inputs needed to reconstruct the next state.

The engine must never rewrite an old round to make a later narrative fit. Corrections create a new correction event and preserve the original record.

## Running state

The authoritative current state is reconstructed from the scenario baseline plus the ordered state mutations in prior round files. A derived client snapshot may exist for rendering, but it is not authoritative.

The logic layer owns:

- population;
- treasury and revenue;
- production and food supply;
- prices;
- manpower;
- military strength;
- unit locations and commitments;
- casualties and permanent losses;
- recruitment;
- supply capacity;
- readiness;
- diplomacy;
- stability;
- infrastructure;
- trade;
- hidden information;
- event causes and causal links.

The client may display these values, format them, or request a server/logic-layer calculation. It must not be the source of truth for persistent numerical state.

## Numerical integrity

Every persistent numeric mutation records:

1. actor;
2. statistic;
3. value before;
4. signed delta;
5. value after;
6. causal event;
7. reason;
8. provenance or calculation method.

A displayed value without a corresponding state mutation is not authoritative.

## Military rules

Military numbers are mandatory whenever troops, armies, deployments, battles, casualties, recruitment, reinforcements, garrisons, or military readiness are mentioned.

The engine maintains integer troop counts, not vague labels such as "a large force."

Each actor has a military ledger with:

- total troops;
- available troops;
- committed troops;
- garrison troops;
- reserve/manpower pool;
- recruitment gains;
- reinforcements;
- wounded/temporarily unavailable where the scenario supports it;
- permanent deaths/losses;
- unit/formation identifiers;
- location;
- supply status;
- readiness.

### Deployment

Moving troops changes their location and committed/garrison/available buckets. Deployment does not create troops.

### Recruitment

Recruitment increases the military total only when the simulation resolves a valid recruitment outcome. Recruitment is constrained by population, manpower, treasury, institutions, training capacity, equipment, and time.

### Reinforcement

Reinforcement increases the recipient formation and total troops only when a real source formation transfers troops. It also decreases the source formation by the same amount.

### Battles

A battle is a numerical state mutation, not merely narrative text.

Before resolving a battle, the engine records the actual engaged troop counts for every side. Resolution considers at minimum:

- engaged troops;
- reserve troops;
- readiness;
- supply;
- terrain;
- fortifications;
- command quality;
- technology/doctrine;
- surprise/intelligence;
- morale/stability;
- reinforcements;
- weather/environment when relevant.

After the battle, casualties and surviving troop counts are written permanently into the military ledger.

Permanent battle losses are never restored by later narration. A later increase requires a new causal event such as recruitment, reinforcement, recovery from temporary wounded status, militia mobilization, or another explicitly modeled source.

### No phantom armies

If an article says "8,400 troops arrived," the state must contain an 8,400-troop movement from a source or a valid recruitment/reinforcement event.

If an article says "2,100 soldiers were killed," the relevant side's permanent troop count must fall by 2,100 unless the record explicitly distinguishes temporary wounded from deaths.

If a battle says 12,000 troops fought, the pre-battle ledger must show at least 12,000 troops actually committed to that engagement.

## Rebuilding totals

To calculate a current total:

1. load the scenario baseline;
2. load round files in numeric order;
3. apply each validated state mutation exactly once;
4. validate that `after = before + delta`;
5. validate military conservation for transfers;
6. validate battle casualties against engaged and surviving forces;
7. expose the resulting current state to narrative generation.

This makes historical rounds referenceable without trusting a model's memory. Humanity has apparently decided that even fictional kings need accounting software.
