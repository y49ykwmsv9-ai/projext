# Game Projects

This directory contains isolated game projects. Each project has its own identity, entrypoint, documentation, and deployment boundary.

## Standard layout

```text
projects/
├── README.md
└── <project-id>/
    ├── README.md
    ├── project.json
    ├── index.html
    ├── src/
    ├── public/
    └── tests/
```

## Rules

1. Every new game receives a unique kebab-case project ID.
2. Never overwrite another game's source or deployment entrypoint.
3. Keep project-specific code and assets inside that project's directory.
4. Put reusable systems and datasets in the shared areas documented by the repository README.
5. Record reuse and ancestry in `docs/PROJECT-LINEAGE.md` and the project's `project.json`.
6. A project must be independently runnable or deployable without changing another project's files.

Boring folder boundaries are considerably easier to maintain than a pile of mysteriously related files six months later.
