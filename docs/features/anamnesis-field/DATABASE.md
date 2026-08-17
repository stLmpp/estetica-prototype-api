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
- `anamnesis_section.previousVersionId` → `anamnesis_section.id` and
  `anamnesis_field.previousVersionId` → `anamnesis_field.id`, both
  nullable, self-referencing. Points at the row a given version
  supersedes — see **Versioning** below. `anamnesis_form` has no such
  column; forms aren't versioned.
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

## Versioning

`anamnesis_section` and `anamnesis_field` are append-only: editing never
mutates a row's content in place (see
[FUNCTIONAL.md](FUNCTIONAL.md#business-rules) for why — a
`customer_anamnesis_field` answer pins to a specific field id, so a live-
editable field would silently rewrite the meaning of past answers).
Instead, an edit:

1. Sets the current row's `active` to `false`.
2. Inserts a new row with the edited content and
   `previousVersionId = <the row it replaces>`.

Consequences worth knowing when querying this schema directly (rather
than through `AnamnesisFieldService`/`AnamnesisSectionService`):

- **"Current version" means "no other row's `previousVersionId` points at
  it."** `active` alone doesn't mean that — a row can be the *current*
  version and still be `active: false` (a field/section deliberately
  retired, with no replacement). `AnamnesisFieldRepository.hasSuccessor`/
  `AnamnesisSectionRepository.hasSuccessor` is the actual "is this
  superseded" check, and `findPaginated`/`findByAnamnesisFormId` filter
  admin list views down to current-version rows only (`NOT EXISTS` a row
  whose `previousVersionId` matches), via a self-join aliased with
  drizzle's `alias()` — see the `AppointmentRepository`/`SaleRepository`
  `customerPerson`/`employeePerson` aliases for the existing precedent of
  that pattern in this codebase.
- **`anamnesis_field_validation` rows aren't versioned independently** —
  they belong to one specific field-version row. Editing a field always
  inserts a fresh set of validation rows for the new version; the old
  version's validation rows are left untouched, orphaned under the now-
  superseded field.
- **No cascading**: superseding a section does not touch any field that
  points at it, and superseding a field's `anamnesisFormId`/
  `anamnesisSectionId` never happens automatically — every version chain
  is the result of an explicit edit to that specific row.
