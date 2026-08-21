# Anamnesis field — Functional

Admin-managed definition of a clinic's intake questionnaire(s) — forms,
their sections, the fields within them, and each field's validation rules.
This feature only covers *defining* the questionnaire; a customer's actual
answers live in [customer-anamnesis](../customer-anamnesis/FUNCTIONAL.md),
which snapshots what it needs from a field/section at answer time — see
that doc's Design decisions for why editing a field/section here is safe
to do in place.

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
  min/max length, min/max value, a regex pattern, or a date bound/relative-
  to-today check). A field can have
  several active rules at once.

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
  | `DATE`             | `REQUIRED`, `MIN_DATE`, `MAX_DATE`, `DATE_IN_FUTURE`, `DATE_IN_PAST`, `DATE_TODAY_OR_LATER`, `DATE_TODAY_OR_EARLIER` |
  | `BOOLEAN`          | `REQUIRED`                                        |
  | `RADIO` / `SELECT` | `REQUIRED`                                        |
  | `CHECKBOX`         | `REQUIRED`                                        |

  `DATE` has two shapes of range validation, both compared against the
  answer as an ISO (`YYYY-MM-DD`) string rather than `Number(value)` (which
  `MIN_VALUE`/`MAX_VALUE` use and doesn't apply to a date):
  - **Fixed bounds** — `MIN_DATE`/`MAX_DATE`, each with a `{ date: string }`
    arg (also ISO `YYYY-MM-DD`) compared directly against the answer, e.g.
    a hard cutoff birth date.
  - **Relative to today** — `DATE_IN_FUTURE`, `DATE_IN_PAST`,
    `DATE_TODAY_OR_LATER`, `DATE_TODAY_OR_EARLIER`. No args; evaluated
    against the current date (server clock, UTC) at validation time rather
    than a stored value — e.g. "birth date must be in the past" or
    "appointment date must not be in the past".

- **Forms, sections, and fields are edited in place** — a `PATCH` updates
  the row directly, no new id, no history kept here. This is safe because
  nothing depends on a field/section's definition staying frozen: a
  customer-anamnesis answer copies the label/type/options/section it needs
  onto itself at the moment it's recorded (see
  [customer-anamnesis/DATABASE.md](../customer-anamnesis/DATABASE.md)), so
  editing a field afterward never changes how a past answer reads.
- Deactivating (`active: false`) a form, section, or field doesn't delete
  it — it just stops it from being offered when starting a new
  customer-anamnesis fill-out. Existing answers are unaffected either way,
  per the snapshot behavior above.
- Deleting a form, section, or field is a soft delete. Child rows (sections
  under a deleted form, fields under a deleted section/form, validation
  rules under a deleted field) are left as-is — not cascade soft-deleted —
  since nothing queries them independently of their still-visible parent
  chain being intact; once a parent is gone, its orphaned children simply
  stop being reachable through the normal lookup paths.
- A field can have several active validation rules at once (e.g.
  `REQUIRED` + `MAX_LENGTH` on the same `TEXT` field) — they all apply
  together when a customer-anamnesis answer is validated. Editing a
  field's validations fully replaces its rule set (the field's existing
  rules are deleted and the submitted set is inserted fresh) — there's no
  partial patch of individual rules.

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
  - Then those existing records still display the answer exactly as
    recorded — it's just no longer offered when starting a *new* fill-out

- **Editing a field doesn't affect its history**
  - Given a field with existing answers recorded against it
  - When the field's label, type, or options are edited
  - Then existing answers still display exactly as they were recorded
    (their own snapshot), even though the live field has changed; only
    *new* fill-outs see the edited definition

## Out of scope

- Conditional/branching field logic (showing a field only when another
  field has a given answer) — see `TODO.md`.
- Cross-tenant shared/library field templates — every form/section/field
  is scoped to one organization.
- A full field-level change-history/audit log for edits to the
  questionnaire definition itself — see `TODO.md`.
- Moving a field to a *different* form — a field's `anamnesisFormId` is
  fixed at creation; there's no "update" path that reassigns a field to
  another form. Recreating it under the new form is a different
  (unrelated) field.
