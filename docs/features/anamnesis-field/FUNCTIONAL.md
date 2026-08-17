# Anamnesis field — Functional

Admin-managed definition of a clinic's intake questionnaire(s) — forms,
their sections, the fields within them, and each field's validation rules.
This feature only covers *defining* the questionnaire; a customer's actual
answers live in [customer-anamnesis](../customer-anamnesis/FUNCTIONAL.md).

## Concepts

- **Form** — a named, selectable questionnaire template (e.g. "Anamnese
  Facial", "Anamnese Corporal"). A clinic can define more than one, for
  different procedure types.
- **Section** — an optional named group of fields within one form (e.g.
  "Alergias", "Medicamentos"), used to organize the fill-out UI. A field
  doesn't have to belong to a section.
- **Field** — one question in a form: a type, a label, optional helper
  text, and (for choice-based types) a list of options.
- **Field type** — what kind of answer a field expects: `TEXT`, `NUMBER`,
  `DATE`, `BOOLEAN` (single yes/no), `CHECKBOX` (multi-select checklist),
  `RADIO` (single choice, buttons), `SELECT` (single choice, dropdown).
- **Validation rule** — one constraint attached to a field (required,
  min/max length, min/max value, or a regex pattern). A field can have
  several active rules at once.
- **Version** — sections and fields are never edited in place; editing
  supersedes the current row with a new one (see Business rules). Forms
  are the exception — a form's own name/description/order is plain,
  in-place-editable metadata, not versioned.

## Business rules

- A field belongs to exactly one form. It may optionally belong to one
  section — and if it does, that section must belong to the same form as
  the field itself (a field can't be grouped into another form's section).
- A section always belongs to exactly one form.
- Only `RADIO`, `SELECT`, and `CHECKBOX` fields carry an options list
  (`fieldArgs.options`, each `{ value, label }`). `TEXT`, `NUMBER`, `DATE`,
  and `BOOLEAN` fields don't use `fieldArgs`.
- Which validation types are meaningful depends on the field's type — this
  is a UI-level guard (the field-definition form only offers the relevant
  ones), not a database constraint:

  | Field type         | Meaningful validation types                       |
  |--------------------|---------------------------------------------------|
  | `TEXT`             | `REQUIRED`, `MIN_LENGTH`, `MAX_LENGTH`, `PATTERN` |
  | `NUMBER`           | `REQUIRED`, `MIN_VALUE`, `MAX_VALUE`              |
  | `DATE`             | `REQUIRED`                                        |
  | `BOOLEAN`          | `REQUIRED`                                        |
  | `RADIO` / `SELECT` | `REQUIRED`                                        |
  | `CHECKBOX`         | `REQUIRED`                                        |

  `DATE` has no range validation yet — `MIN_VALUE`/`MAX_VALUE` compare
  `Number(value)`, which doesn't apply to a date string. A date range needs
  its own validation types (e.g. `MIN_DATE`/`MAX_DATE` with a date-typed
  arg), not a reuse of the numeric ones. See `TODO.md`.

- **Editing a section or field always creates a new version — never an
  in-place update.** A `customer_anamnesis_field` answer pins to one
  specific field id; if that field's `fieldType`, options, or label
  could change in place, every past answer referencing it would silently
  be reinterpreted under the new definition. The same applies one level up
  to a section's label (it's what groups those fields for display).
  Editing therefore always: deactivates the current row (`active: false`),
  inserts a brand-new row carrying the edited content plus
  `previousVersionId` pointing back at the row it replaces, and returns
  the new row (its `id` is different from the one that was edited).
  **Forms are the one exception** — a form is a container/label, not
  something a customer answer is ever recorded "as of a specific
  version" of; renaming it doesn't change what any past question meant,
  so forms are edited in place like any ordinary admin-managed record.
- **Only the current version of a section or field can be edited.**
  Attempting to `PATCH` a row that's already been superseded (something
  else already points back to it via `previousVersionId`) is rejected as
  a conflict — edit the current version instead.
- **Deleting is not editing.** Delete is a plain soft delete on both
  sections and fields — it doesn't create a new version, it removes the
  row from use entirely. A deleted row still exists (soft-deleted) but
  drops out of the live joins used to display historical answers, at
  which point the FE falls back to showing the raw recorded value (see
  [customer-anamnesis](../customer-anamnesis/FUNCTIONAL.md)).
- **Superseding a section doesn't move its fields.** Fields keep
  pointing at whichever section id they were assigned when they were
  last created/edited — renaming a section doesn't retroactively relabel
  the fields grouped under it. To have a field appear under a section's
  new version, the field itself has to be edited (which, per the rule
  above, creates a new version of the field too).
- Deactivating (`active: false`), as part of an edit, still just stops a
  row from being offered going forward — it doesn't affect any
  [customer-anamnesis](../customer-anamnesis/FUNCTIONAL.md) record
  created while the row (or an earlier version of it) was active.
- Child rows (sections under a deleted form, fields under a deleted
  section/form, validation rules under a deleted or superseded field) are
  left as-is when their parent is deleted or superseded — not cascade
  soft-deleted or cascade re-created — since nothing queries them
  independently of their still-visible parent chain being intact.
- A field can have several active validation rules at once (e.g.
  `REQUIRED` + `MAX_LENGTH` on the same `TEXT` field) — they all apply
  together when a customer-anamnesis answer is validated. Editing a
  field's validations is part of the same versioning rule above — the new
  field version gets fresh validation rows, not a patch to the old ones.

## Scenarios

- **Creating a choice field**
  - Given a `SELECT` field is being created with two options
  - When it's saved with `fieldArgs.options: [{value: "a", label: "A"}, {value: "b", label: "B"}]`
  - Then it's created successfully

- **Field's section must belong to the field's own form**
  - Given a form "Anamnese Facial" with section "Alergias", and a
    different form "Anamnese Corporal"
  - When a field is created with `anamnesisFormId` set to "Anamnese
    Corporal" but `anamnesisSectionId` set to "Alergias" (which belongs to
    "Anamnese Facial")
  - Then it's rejected

- **Deactivating a field doesn't affect its history**
  - Given a field that already has answers recorded against it in one or
    more `customer_anamnesis` records
  - When the field is deactivated
  - Then those existing records still display the field's answer — it's
    just no longer offered when starting a *new* fill-out

- **Editing a field creates a new version**
  - Given an existing, active field
  - When it's edited (any property, including just re-labeling it)
  - Then the original row becomes inactive, a new row is created with the
    edited content and `previousVersionId` pointing at the original, and
    the new row's `id` is returned — the field the admin now sees/edits
    going forward is the new id, not the original one

- **Editing an already-superseded version is rejected**
  - Given a field that was already edited once (so an earlier row is now
    superseded by a newer one)
  - When a `PATCH` is attempted against the *superseded* row's id
  - Then it's rejected as a conflict

- **Renaming a section doesn't relabel its existing fields**
  - Given a section "Alergias" with two fields grouped under it
  - When the section is renamed to "Alergias conhecidas" (creating a new
    section version)
  - Then the two existing fields keep pointing at the original "Alergias"
    section row — they don't automatically move to the new version unless
    each field is separately edited

## Out of scope

- Conditional/branching field logic (showing a field only when another
  field has a given answer) — see `TODO.md`.
- Cross-tenant shared/library field templates — every form/section/field
  is scoped to one organization.
- A full field-level change-history/audit log for edits to the
  questionnaire definition itself (as opposed to a customer's answers,
  which is covered by [customer-anamnesis](../customer-anamnesis/FUNCTIONAL.md))
  — see `TODO.md`. The `previousVersionId` chain gives basic provenance
  (what a field/section used to say, and when — via the superseded row's
  own `createdAt`/`createdBy`), but there's no dedicated diff/changelog
  view.
- Moving a field to a *different* form — a field's `anamnesisFormId` is
  fixed at creation and carries through every version; there's no
  "update" path that reassigns a field to another form. Recreating it
  under the new form is a different (unrelated) field, not a new version
  of the same one.
