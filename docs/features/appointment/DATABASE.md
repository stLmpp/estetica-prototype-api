# Appointment — Database

Schema: `src/database/main/main-entities.ts` (entities) and
`main-relations.ts` (relations) — that's the source of truth for exact
columns, types, and constraints.

## Tables

- `appointment` — a booking of one employee for one customer over a time
  range, with a status and optional notes.
- `appointment_item` — the catalog item (service) booked within an
  appointment, with the price applied at booking time.

## Relationships

- `appointment.customerId` → `customer.id`, required — every appointment
  always has a customer.
- `appointment.employeeId` → `employee.id`, required — every appointment
  always has an employee.
- `appointment_item.appointmentId` → `appointment.id`, required: modeled as
  one-to-many, though the service layer only ever inserts a single item per
  appointment today (see [FUNCTIONAL.md](FUNCTIONAL.md#out-of-scope)) — the
  table isn't restricted to one row by a DB constraint.
- `appointment_item.catalogItemId` → `catalog_item.id`, required.

## Design decisions

- `appointment_item.priceApplied` is a snapshot taken at booking time, not
  derived from `catalog_item.defaultPrice` at read time — a later price
  change on the catalog item doesn't retroactively change what a past
  appointment shows as charged. Same reasoning as `sale_item.priceApplied`
  (see [sale/DATABASE.md](../sale/DATABASE.md)).
- Scheduling conflicts (no overlapping appointments for the same employee)
  are enforced in the service layer
  (`AppointmentRepository.hasConflict` — a time-range overlap query scoped
  to `employeeId`, excluding `CANCELLED` appointments) rather than a DB
  exclusion constraint, consistent with this codebase's general preference
  for business rules in the service layer over DB-level constraints.
