# CustomerFollowup — Functional

A dated note about a customer, optionally linked to the appointment
and/or sale it follows up on, with optional priced items underneath
(e.g. a recommended follow-up product or service). Used for
post-procedure tracking ("check healing in 2 weeks").

## Concepts

- **Follow-up** — a dated text note tied to a customer, optionally
  referencing an appointment and/or a sale.
- **Follow-up item** — an optional priced line item under a follow-up
  (a description, an optional link to a catalog item, quantity, and the
  price applied).

## Business rules

- A follow-up always belongs to exactly one customer.
- `date` is the date the note was written, not a due/target date — there
  is no due-date or reminder concept yet (see `TODO.md`).
- `appointmentId` and `saleId` are both optional and independent — a
  follow-up can reference neither (standalone), either one, or both.
- If both `appointmentId` and `saleId` are set, the referenced sale's own
  `appointmentId` must equal the given `appointmentId` — a follow-up
  can't claim a sale and an appointment that aren't actually linked to
  each other.
- A referenced appointment or sale must belong to the same customer as
  the follow-up.
- Items are entirely optional — a follow-up can be a plain note with no
  items.
- Every item's `priceApplied` is required on input, regardless of
  whether `catalogItemId` is set — unlike `sale`'s items, there is no
  auto-pricing lookup from the catalog item.
- Editing a follow-up replaces its items wholesale — there is no
  per-item add/remove/edit; a `PATCH` that includes `items` discards the
  previous set and inserts the new one.

## Lifecycle

None — a follow-up has no status/state machine in this version.

## Scenarios

- **Create a standalone follow-up**
  - Given a customer with no appointment/sale reference
  - When a follow-up is created with just `text` and `date`
  - Then it's saved with `appointmentId`/`saleId` both absent

- **Create a follow-up linked to one source**
  - Given a customer with a completed appointment (or a sale) belonging
    to them
  - When a follow-up is created with `appointmentId` (or `saleId`) set
  - Then it's saved with that single link

- **Reject a mismatched appointment**
  - Given an appointment belonging to a different customer
  - When a follow-up is created for this customer with that
    `appointmentId`
  - Then the request is rejected with `422`
    `CUSTOMER_FOLLOWUP_APPOINTMENT_MISMATCH`

- **Reject a sale not linked to the given appointment**
  - Given an appointment and a sale that exist but aren't linked to each
    other
  - When a follow-up is created referencing both
  - Then the request is rejected with `422`
    `CUSTOMER_FOLLOWUP_SALE_APPOINTMENT_MISMATCH`

- **Edit replaces items wholesale**
  - Given a follow-up with one item
  - When it's updated with a different `items` array
  - Then the original item is gone and only the new items remain

- **Delete is soft**
  - Given an existing follow-up
  - When it's deleted
  - Then it is marked deleted and no longer returned by `GET`; its items
    remain in the database but are only reachable through the parent, so
    they become unreachable too

## Out of scope

- Status (pending/done) and reminders/notifications — no due-date
  concept exists yet either (see `TODO.md`).
- Prompting to create a follow-up right after an appointment or sale is
  completed — this version only supports creating one manually (see
  `TODO.md`).
- Before/after photos (tracked separately as BE-8 in `TODO.md`, blocked
  on a storage design).
