# ROLEPLAY PROJECT — DO NOT MIX WITH OUTSIDE PROJECTS

**Project family:** Roleplay / simulation campaigns  
**Project ID:** `chronicle-memory`  
**Current known campaign:** `GMV-001` (Gaius Maximus Valerius)  

## Source-of-truth rule

This directory is the dedicated roleplay-project area inside the main repository. Roleplay campaign state, rounds, decisions, directives, events, and campaign-specific simulation records belong here when they are committed to the repository.

**Do not treat files from Worldforge, Chronicle AI, Historix Renderer, the documentary system, or other projects as GMV-001 campaign data.** Shared historical/geographic datasets may be read as reference inputs, but they are not roleplay campaign state.

## Search rule

When asked to find, continue, inspect, or modify a roleplay campaign:

1. Start in `projects/chronicle-memory/`.
2. Identify the campaign by its explicit project/campaign ID, such as `GMV-001`.
3. Trace round/state/event records from that campaign's stored records and Git history.
4. Do not substitute similarly named files from another project.
5. If a record is not present here, explicitly distinguish repository data from conversation/library history rather than recreating it.

## GMV-001 boundary

`GMV-001` is a separate roleplay simulation/campaign. Its Gaius Maximus Valerius round history must not be conflated with Chronicle AI, Worldforge, or any other game/simulation.

This marker exists specifically to make that boundary obvious during future repository searches and modifications.
