# CustomerFollowup — Database

Covers the `customer_followup` and `followup_item` tables.

Schema: `src/database/main/main-entities.ts` (entities) and
`main-relations.ts` (relations) — that's the source of truth for exact
columns, types, and constraints.

## Tables

- `customer_followup` — a dated note tied to a customer, optionally
  referencing the appointment and/or sale it follows up on.
- `followup_item` — a priced line item under a follow-up. Structurally
  close to `sale_item`, but `description` is always present (a
  free-form item is valid) and `catalogItemId` is optional.

## Relationships

- `customer_followup.customerId` → `customer.id` — required, the
  follow-up's owner.
- `customer_followup.appointmentId` → `appointment.id` — optional; when
  set, must belong to the same customer as the follow-up, and if
  `saleId` is also set, that sale's own `appointmentId` must match this
  one.
- `customer_followup.saleId` → `sale.id` — optional; when set, must
  belong to the same customer as the follow-up.
- `followup_item.followupId` → `customer_followup.id` — required.
- `followup_item.catalogItemId` → `catalog_item.id` — optional; absent
  for a free-form item that isn't tied to a catalog entry.

## Design decisions

- `followup_item.priceApplied` is always required on input, even when
  `catalogItemId` is set — deliberately simpler than `sale_item`, which
  can omit it and fall back to the catalog item's default price. No
  catalog-price lookup exists for follow-up items.
- `appointmentId`/`saleId` are independent nullable columns rather than
  a single polymorphic reference, so both can be set at once (with the
  cross-check business rule above) rather than forcing an either/or.
- Editing a follow-up's items is a delete-then-reinsert of the full set,
  not a diff — items have no independent identity worth preserving
  across an edit.
