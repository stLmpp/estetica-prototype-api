<!--
Template — copy to docs/features/<feature>/DATABASE.md and fill in.
Audience: engineers touching the schema. This doc is the *why*, not the
*what* — exact columns, types, constraints, indexes, and enum values live
in src/database/main/main-entities.ts + main-relations.ts and are NOT
repeated here. If a reader needs the column list, they read the code; if
they need to understand why it's shaped that way, they read this.
Don't let it drift: update it in the same PR as a schema change.
Delete these comment blocks once filled in.
-->

# [Feature name] — Database

<!-- One or two sentences: what part of the schema this covers. -->

Schema: `src/database/main/main-entities.ts` (entities) and
`main-relations.ts` (relations) — that's the source of truth for exact
columns, types, and constraints.

## Tables

<!--
One line per table: name + what a row represents. Not columns, not
indexes — just enough for a reader to know which table to open in
main-entities.ts.
-->

- `[table_name]` — [what a row represents]

## Relationships

<!--
Only the FKs whose *meaning* isn't obvious from the column name alone —
ownership, optionality, "why does this reference that". Skip anything
self-explanatory (e.g. a straightforward `xId` FK needs no entry here).
-->

-

## Design decisions

<!--
Non-obvious schema choices and why — the things a reader would otherwise
have to reconstruct from git blame or a chat log. This is the section
most worth writing carefully; everything else in this doc is secondary
to it. Skip anything that's just "this mirrors how [other table] already
does it" unless the reasoning itself is worth repeating.
-->

-
