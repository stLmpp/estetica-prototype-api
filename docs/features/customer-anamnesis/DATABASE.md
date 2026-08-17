# Customer anamnesis — Database

Schema: `src/database/main/main-entities.ts` (entities) and
`main-relations.ts` (relations) — that's the source of truth for exact
columns, types, and constraints.

## Tables

- `customer_anamnesis` — one filled-out instance of a form for one
  customer: which form, which customer, an optional linked appointment,
  the date, and its `DRAFT`/`FINALIZED` lifecycle state.
- `customer_anamnesis_field` — one answer within a record: which field,
  the recorded value.

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
- **Live join, not a snapshot.** `customer_anamnesis_field` stores only the
  answer (`value`/`extraValues`) — not the field's label, type, or options
  as they were at the time of answering. Reading a record joins against
  the *current* `anamnesis_field` row, same precedent as
  `customerName`/`catalogItemName` joins in `AppointmentRepository` (only
  monetary values get snapshotted in this codebase). If a field or option
  is later removed, the stored raw value is still returned as-is — display
  fallback is the API consumer's responsibility (see the frontend section
  of `docs/plans/anamnesis.md`).
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
