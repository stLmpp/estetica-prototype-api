# Customer anamnesis — Database

Schema: `src/database/main/main-entities.ts` (entities) and
`main-relations.ts` (relations) — that's the source of truth for exact
columns, types, and constraints.

## Tables

- `customer_anamnesis` — one filled-out instance of a form for one
  customer: which form, which customer, an optional linked appointment,
  the date, and its `DRAFT`/`FINALIZED` lifecycle state.
- `customer_anamnesis_field` — one answer within a record: which field,
  the recorded value, and a snapshot of that field's label/type/options/
  section as they were at the moment the answer was recorded (see Design
  decisions — **Snapshot the field/section onto the answer**).

## Relationships

- `customer_anamnesis.customerId` → `customer.id`, required.
- `customer_anamnesis.anamnesisFormId` → `anamnesis_form.id`, required —
  cross-feature reference into [anamnesis-field](../anamnesis-field/DATABASE.md).
- `customer_anamnesis.appointmentId` → `appointment.id`, nullable. Set
  only at creation (the service never accepts it on update) — write-once
  to avoid re-validating the customer/appointment linkage in two places.
  **Not DB-enforced**: nothing at the schema level stops this from
  pointing at an appointment belonging to a *different* customer than
  `customer_anamnesis.customerId` — checked in
  `CustomerAnamnesisService.create` (see
  [FUNCTIONAL.md](FUNCTIONAL.md#business-rules)).
- `customer_anamnesis_field.customerAnamnesisId` → `customer_anamnesis.id`,
  required.
- `customer_anamnesis_field.anamnesisFieldId` → `anamnesis_field.id`,
  required — cross-feature reference; must belong to the same form as the
  parent record's `anamnesisFormId` (service-enforced, not a DB
  constraint — a three-table consistency rule the schema can't express).

## Design decisions

- **History, not a living profile.** There's no unique constraint on
  `customerId` alone — a customer can have arbitrarily many
  `customer_anamnesis` rows over time, each an independent dated snapshot.
  This is deliberate (see [FUNCTIONAL.md](FUNCTIONAL.md#business-rules))
  rather than one row per customer being edited in place.
- **Snapshot the field/section onto the answer, don't live-join.**
  `customer_anamnesis_field` carries its own `fieldLabel`, `fieldType`,
  `fieldOptions`, `fieldDisplayOrder`, `sectionLabel`, and
  `sectionDisplayOrder` columns, copied from the current
  `anamnesis_field`/`anamnesis_section` at the moment the answer is
  created (`CustomerAnamnesisService.buildAnswerInsert`). Reading a record
  never has to resolve anything against the *current* definition — same
  precedent as `sale_item.priceApplied`/`appointment_item.priceApplied`
  ("a snapshot taken at booking time, not derived from
  `catalog_item.defaultPrice` at read time"). The two `displayOrder`
  columns exist for the same reason as the rest: without them, a past
  record's answers would render in whatever order the DB happens to
  return them, not the order the form actually presented them in when
  filled out — `CustomerAnamnesisService.getById` sorts by
  `sectionDisplayOrder` (nulls last) then `fieldDisplayOrder` before
  returning.

  **The problem this solves:** a `customer_anamnesis_field` answer is
  meaningless without knowing what question it was answering and how
  (a `RADIO` value like `"a"` only means something next to the option
  labels that existed at the time). `anamnesis_field`/`anamnesis_section`
  are ordinary, freely-editable admin-managed rows (see
  [anamnesis-field/DATABASE.md](../anamnesis-field/DATABASE.md)) — so
  without a snapshot, editing a field's type/options/label, or renaming
  its section, would silently change how every past answer referencing it
  reads.

  **Alternatives considered, and why they lost:**
  - *Version the definitions instead* (make `anamnesis_field`/
    `anamnesis_section` append-only: edit = deactivate the row + insert a
    new one, e.g. via a `previousVersionId` self-reference). This was
    actually built first, then reverted. It protects the *definition*
    rather than the *answer*, which sounds equivalent but isn't in
    practice: every FK into the versioned table becomes frozen to one
    exact row whether that's wanted or not, so an *unrelated* edit (e.g.
    renaming a section) forces awkward questions with no clean answer —
    does that cascade into re-versioning every field grouped under it, or
    do those fields silently point at a superseded row that no longer
    shows up in the current admin section list? Neither answer was good,
    and the mechanism added real surface area (a "some rows are
    superseded and can't be edited" state, `NOT EXISTS`-filtered list
    queries, a `hasSuccessor` guard) to solve a problem the snapshot
    approach sidesteps entirely.
  - *Stable identity + version number* (closer to how `ConfigService`
    already versions config values: a synthetic stable key plus an
    incrementing `version`). Same fundamental issue as above — it still
    versions the *definition*, so the same "does an edit elsewhere cascade
    or not" question applies; it would also be the first place in this
    schema needing a stable-identity-separate-from-row-id concept.
  - *Event-sourced history* (append-only event log, current state folded
    from events). Real architectural weight (projections, replay) with no
    precedent anywhere else in this codebase — solves a fuller "audit
    log" problem this feature doesn't actually have yet (see the deferred
    audit-log item in `TODO.md`), not the narrower "don't corrupt past
    answers" problem at hand.

  **Trade-offs accepted:** some duplicated data on the answer row (a
  handful of columns), and no browsable "how has this question's
  definition changed over time" admin view — only what a given answer
  happened to be snapshotted with. Neither was an actual requirement;
  "past answers must keep reading correctly" was. `anamnesis_field`/
  `anamnesis_section` stay ordinary mutable rows as a direct result — see
  [anamnesis-field/DATABASE.md](../anamnesis-field/DATABASE.md).
  `extraLabels.description` (the fill-out helper text) is deliberately
  *not* snapshotted — it's guidance for answering, not part of the
  recorded answer's meaning.
- **Unique partial index** on
  `(tenant_id, customer_anamnesis_id, anamnesis_field_id) where is_deleted = false`
  — prevents two answer rows for the same field within one record.
- **`value` is a plain `varchar(2048)`** for every field type, including
  `NUMBER`, `DATE`, and `BOOLEAN` — an EAV trade-off (flexibility across
  arbitrary admin-defined field types, at the cost of not being able to
  `WHERE`-filter/aggregate across customers by answer without parsing at
  the app layer). `CHECKBOX`'s multiple selected values go in
  `extraValues: { values: string[] }` instead; `value` is left empty for
  that type. See `TODO.md` for the reporting limitation this implies.
- **`status`/`signedByName`/`signedAt` are a deliberately minimal
  consent+lock mechanism** — a typed acknowledgment and a one-way
  `DRAFT`→`FINALIZED` lock, not a full e-signature capture or a field-
  level change-history/audit log of edits made before finalization. Both
  are noted as possible future work in `TODO.md` rather than built now.
