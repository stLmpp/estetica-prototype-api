# Customer anamnesis — Functional

A customer's actual answers to an [anamnesis form](../anamnesis-field/FUNCTIONAL.md)
— filled out by front-desk/esthetician staff, typically before a
procedure. Each fill-out is its own dated record; a customer can have many
over time (see "history, not a profile" below).

## Concepts

- **Anamnesis record** — one filled-out instance of a form for one
  customer, on a given date, optionally tied to the appointment it was
  collected for.
- **Answer** — one field's recorded value within a record. Every answer
  belongs to exactly one record and references the form field it answers.
- **Draft / Finalized** — a record's lifecycle. `DRAFT` records can still
  be edited; `FINALIZED` ones are locked (see Lifecycle below).
- **Signature** — a typed name + timestamp recorded when a record is
  finalized, confirming the person who reviewed/filled it out. Not a
  captured signature image — see `TODO.md` for that possible future.

## Business rules

- **History, not a living profile.** Each anamnesis record is its own row
  with its own `date` — filling out a new questionnaire for a customer
  creates a new record, it never overwrites a previous one. A customer can
  have any number of records over time.
- A record is filled out against exactly one [form](../anamnesis-field/FUNCTIONAL.md#concepts);
  the form must exist and be active at creation time.
- Every answer's field must belong to that same form, and must be active,
  at the time the record is created or updated — an answer can't reference
  a field from a different form, or one that's been deactivated. Violating
  this is rejected as unprocessable (the field reference is invalid), not
  "not found" (the record's own route identifies the *record*, not the
  field).
- **Per-answer validation.** Each submitted answer is checked against its
  field's *active* validation rules:
  - `REQUIRED` — the answer must be non-empty (for `CHECKBOX`, at least
    one selected value).
  - `MIN_LENGTH`/`MAX_LENGTH` — the answer's text length must fall in
    range.
  - `MIN_VALUE`/`MAX_VALUE` — the answer, read as a number, must fall in
    range.
  - `PATTERN` — the answer must match the configured regular expression.
  - `RADIO`/`SELECT` — the answer must be one of the field's configured
    options.
  - `CHECKBOX` — every selected value must be one of the field's
    configured options.
  - `BOOLEAN` — the answer must be exactly "true" or "false".
  - A field with no `REQUIRED` rule is optional — a record can simply omit
    an answer for it.
  - All violations across all answers are reported together, not just the
    first one encountered.
- **Optional appointment link, set once.** A record may optionally
  reference the appointment it was collected for. If given, that
  appointment must belong to the same customer as the record — a
  mismatched appointment is rejected. This link can only be set at
  creation; it doesn't change afterward.
- **Editing is blocked once finalized.** A `DRAFT` record's answers (and
  `date`) can be changed freely. Once a record is `FINALIZED`, no further
  edits are accepted — the only way to modify it is to delete it (see
  Lifecycle).
- **Deleting is unrestricted by status.** A record can be deleted (soft
  delete) whether it's `DRAFT` or `FINALIZED` — deleting doesn't mutate
  confirmed content, it just removes the record. Deletion is reserved for
  admin/owner roles (day-to-day staff can create/edit/finalize but not
  delete a health record — see the feature's permission definition in
  `src/core/auth/organization-access-control.ts`).
- **Viewing resolves against the current field definitions**, not a
  snapshot taken when the record was filled out — the same field's
  current label, section, and options are shown. If a field or one of its
  options was since deactivated or removed, the record still shows the
  raw value that was recorded, with an indication that the field is no
  longer available, rather than erroring.

## Lifecycle

| Status | Meaning | Triggered by |
| ------ | ------- | ------------- |
| `DRAFT` | Default status on creation. Editable. | Record creation. |
| `FINALIZED` | Locked — the record was reviewed and signed. | The `finalize` action. |

**Transition rules:**

- `DRAFT` → `FINALIZED` is the only transition, triggered by `finalize`
  (which also records `signedByName`/`signedAt`). There's no transition
  back to `DRAFT` — a finalized record can't be reopened for editing; if
  it needs to change, it's deleted and a new record is created instead.
- Calling `finalize` again on an already-`FINALIZED` record is a no-op —
  it succeeds without changing anything (the original signature is kept,
  a newly submitted `signedByName` is ignored).
- Attempting to `update` (edit answers/date) a `FINALIZED` record is
  rejected as a conflict with the record's current state.

Enforced in `CustomerAnamnesisService.update`/`finalize`.

## Scenarios

- **Valid fill-out succeeds**
  - Given an active form with a required `TEXT` field and an optional
    `NUMBER` field
  - When a record is created answering only the required field
  - Then it's created successfully, as a `DRAFT`

- **Missing a required answer**
  - Given a field with an active `REQUIRED` rule
  - When a record is created without an answer for that field
  - Then it's rejected, with a per-field detail identifying which field

- **Answer referencing a field from a different form**
  - Given a record being created against form A
  - When one of its answers references a field that belongs to form B
  - Then it's rejected

- **Answer referencing an inactive field**
  - Given a field that's been deactivated
  - When a record is created with an answer for that field
  - Then it's rejected

- **Appointment/customer mismatch**
  - Given an appointment that belongs to a different customer than the one
    the record is being created for
  - When that appointment's id is given as `appointmentId`
  - Then it's rejected

- **Editing a draft**
  - Given a `DRAFT` record
  - When its answers are updated
  - Then the update succeeds

- **Editing a finalized record**
  - Given a `FINALIZED` record
  - When an update is attempted
  - Then it's rejected as a conflict

- **Finalizing**
  - Given a `DRAFT` record with valid answers
  - When it's finalized with a `signedByName`
  - Then its status becomes `FINALIZED` and `signedByName`/`signedAt` are
    recorded

- **Finalizing twice**
  - Given an already-`FINALIZED` record
  - When `finalize` is called again
  - Then it succeeds as a no-op — the original signature is unchanged

- **Viewing a record after its field changed**
  - Given a record with an answer for a field that's since been
    deactivated or had an option removed
  - When the record is viewed
  - Then the previously recorded raw value is still shown, marked as
    referencing a field/option that's no longer available

## Out of scope

- Conditional/branching field logic — see
  [anamnesis-field's "Out of scope"](../anamnesis-field/FUNCTIONAL.md#out-of-scope)
  and `TODO.md`.
- A full field-level change-history/audit log of edits made while a
  record is still `DRAFT` — only the plain `lastUpdatedBy`/`updatedAt`
  every table gets. The `FINALIZED` lock prevents edits *after*
  confirmation; it doesn't track what changed *before* it. See `TODO.md`.
- A captured signature image or other stronger consent evidence —
  `signedByName`/`signedAt` is a simple typed acknowledgment, not a legal-
  grade e-signature. See `TODO.md`.
- Reporting/filtering across customers by answer (e.g. "list everyone
  allergic to X") — answers are stored as free text per field, not
  queryable structured data. See `TODO.md`.
