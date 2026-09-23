# Round File Format

Each completed simulation turn gets one immutable JSON file under data/rounds/<scenario-id>/round-####.json

## Required order

1. Round metadata
2. Events
3. Event-level state changes
4. Round-level state changes
5. Military ledger
6. End-state snapshot
7. Validation

The narrative is generated from resolved state. The end-state snapshot is a convenience for fast inspection and debugging; replay of the baseline plus mutations remains authoritative.

## Event IDs

Use stable IDs: r<round>-e<event>. Military formations use stable IDs so later deployments and battles can reference the same force.

## Running totals

The engine reconstructs running totals by replaying rounds in numeric order. Every mutation must satisfy after = before + delta. The next round's before must equal the previous round's reconstructed after.

## Military continuity

Every military event carries exact integer troop counts. A battle, recruitment, reinforcement, deployment, withdrawal, or casualty event must reconcile against the preceding ledger. No narrative may restore troops that were permanently lost. New troops require a new causal state mutation.

## Client boundary

The client receives a projection of the reconstructed state. It may not authoritatively write persistent numbers. This prevents display/UI code from becoming a second, contradictory simulation engine.
