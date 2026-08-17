# Anamnesis field — Database

Schema: `src/database/main/main-entities.ts` (entities) and
`main-relations.ts` (relations) — that's the source of truth for exact
columns, types, and constraints.

## Tables

- `anamnesis_form` — a named, selectable questionnaire template.
- `anamnesis_section` — a named group of fields within one form.
- `anamnesis_field` — one question within a form (and optionally a
  section): type, label, and (for choice types) its options.
- `anamnesis_field_validation` — one validation rule attached to a field.

## Relationships

- `anamnesis_section.anamnesisFormId` → `anamnesis_form.id`, required —
  every section belongs to exactly one form.
- `anamnesis_field.anamnesisFormId` → `anamnesis_form.id`, required.
- `anamnesis_field.anamnesisSectionId` → `anamnesis_section.id`, nullable
  — optional grouping. **Not DB-enforced**: nothing at the schema level
  stops a field from pointing at a section belonging to a *different* form
  than the field's own `anamnesisFormId`. That invariant is checked in
  `AnamnesisFieldService` on create/update (see
  [FUNCTIONAL.md](FUNCTIONAL.md#business-rules)) — a genuine two-FK
  consistency rule the database can't express on its own.
- `anamnesis_field_validation.anamnesisFieldId` → `anamnesis_field.id`,
  required.
- `customer_anamnesis.anamnesisFormId` and
  `customer_anamnesis_field.anamnesisFieldId` reference these tables from
  the [customer-anamnesis](../customer-anamnesis/DATABASE.md) feature —
  see that doc for the answer side.

## Design decisions

- **`fieldArgs`/`extraLabels`/`validationArgs` are typed jsonb, not
  normalized tables.** An options list (`fieldArgs.options: {value,
  label}[]`) is always read and written as a whole together with its
  field — there's no query that needs to filter/join on a single option
  independently of its field — so a normalized `anamnesis_field_option`
  table would add a join for no real benefit. Typed via drizzle's
  `.$type<T>()` in `main-entities.ts` for compile-time safety; the shapes
  themselves aren't DB-enforced:
  - `fieldArgs: { options: { value: string; label: string }[] }` —
    `RADIO`/`SELECT`/`CHECKBOX` only.
  - `extraLabels: { description?: string }` — optional helper text shown
    under the field's label in the fill-out form.
  - `validationArgs` — shape depends on `validationType`:
    `{ length: number }` (`MIN_LENGTH`/`MAX_LENGTH`), `{ value: number }`
    (`MIN_VALUE`/`MAX_VALUE`), `{ pattern: string }` (`PATTERN`); absent
    for `REQUIRED`.
- **`displayOrder` is a plain integer**, not a fractional/linked-list
  ordering scheme. Reordering means renumbering the affected rows; ties
  break by insertion order. Simple and sufficient at the scale of an
  admin-curated questionnaire (tens of fields, not thousands).
- **`anamnesis_field_type` gained `BOOLEAN`** (Postgres `ALTER TYPE ...
  ADD VALUE`) specifically to give a plain yes/no question its own type,
  distinct from `CHECKBOX` (which is a multi-select checklist — see
  [customer-anamnesis/DATABASE.md](../customer-anamnesis/DATABASE.md) for
  how each type's answer is stored).
- **`anamnesis_form`/`anamnesis_section`/`anamnesis_field` are ordinary
  mutable rows — editing updates in place, no version history kept here.**
  An earlier design made `anamnesis_section`/`anamnesis_field` append-only
  (edit = deactivate + insert a new row) specifically so an edit could
  never retroactively change how a past `customer_anamnesis_field` answer
  reads. That's now solved on the *answer* side instead — see
  [customer-anamnesis/DATABASE.md](../customer-anamnesis/DATABASE.md)'s
  Design decisions for the snapshot approach and why it was chosen over
  versioning the definitions. That's the reason this table can stay
  boring.
