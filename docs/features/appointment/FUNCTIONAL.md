# Appointment — Functional

An appointment is a booking of one customer with one employee, for one
catalog item (a service), over a specific time range. It drives the
calendar/day-schedule views, and — once completed — can optionally have a
[sale](../sale/FUNCTIONAL.md) created from it. A sale doesn't require an
appointment at all (see "orphan sale" in the sale docs).

## Concepts

- **Appointment** — the booking header: customer, employee, time range,
  status, optional notes.
- **Appointment item** — the catalog item (service) booked, with the price
  applied at booking time. There is exactly one per appointment today (see
  Out of scope).
- **Day schedule** — a read view of one employee's appointments within a
  date range, used to render "what's booked today".
- **Calendar range** — a read view across a date range, for one employee or
  all of them, used to render week/month calendar UI.

## Business rules

- The `customer`, `employee`, and `catalogItem` referenced must all exist —
  each is validated independently and reported separately if missing.
- `priceApplied` defaults to the catalog item's `defaultPrice` when not
  explicitly provided. If the catalog item has no default price and none is
  given, creation is rejected.
- An employee cannot have two overlapping appointments in a non-`CANCELLED`
  status. Creating an appointment, or rescheduling one (changing
  `startTime`/`endTime`), into a range that overlaps another of that
  employee's appointments is rejected.
- `CANCELLED` appointments are excluded from the overlap check — cancelling
  an appointment frees that time slot for rebooking.
- `endTime` must be after `startTime`, enforced both on create and update.
- The appointment's time range must fall on a single day, and within that
  day's working hours: the employee's own schedule if they have one
  configured, otherwise the organization's, otherwise a default of
  08:00–20:00. An explicit day off (a configured day with no hours) is
  respected even if the organization is open that day — the employee's
  schedule is only ignored when the employee has no schedule configured at
  all. Checked on both create and update (when the time range changes).
- Once created, only `startTime`, `endTime`, and `notes` can change via
  update. The customer, employee, and booked catalog item/price are
  immutable after creation.
- `status` changes through a separate action, governed by the transition
  rules below.
- Deleting an appointment is a soft delete.

## Lifecycle

| Status | Meaning |
| ------ | ------- |
| Agendado (`SCHEDULED`) | Default status on creation. The only non-terminal status. |
| Concluído (`COMPLETED`) | Appointment was fulfilled — the only status a [sale](../sale/FUNCTIONAL.md) can be created *from*, when one is created from an appointment at all |
| Cancelado (`CANCELLED`) | Appointment was cancelled — its time slot no longer counts toward conflicts |
| Não compareceu (`NO_SHOW`) | Customer didn't show up |

**Transition rules:**

- `SCHEDULED` → `COMPLETED`, `CANCELLED`, or `NO_SHOW` — any of the three
  outcomes is reachable from the only non-terminal status.
- `COMPLETED`, `CANCELLED`, and `NO_SHOW` are terminal — none of them
  transition to any other status, including back to `SCHEDULED`. An
  appointment's outcome, once recorded, doesn't change; if a customer needs
  to be rebooked, a new appointment is created instead of reopening the old
  one.
- Setting a status equal to the current one is a no-op, not a transition —
  it succeeds without changing anything.
- An attempted transition out of a terminal status is rejected with a
  conflict error.

Enforced in `AppointmentService.updateStatus`.

## Scenarios

- **Price defaults from the catalog item**
  - Given a catalog item with a `defaultPrice` and no `priceApplied` in the request
  - When an appointment is created
  - Then `priceApplied` is copied from the catalog item's `defaultPrice`

- **No price available anywhere**
  - Given a catalog item with no `defaultPrice`, and no `priceApplied` provided
  - When creating an appointment is attempted
  - Then it's rejected as an invalid request

- **Overlapping booking for the same employee**
  - Given an employee already has a `SCHEDULED` appointment from 10:00–11:00
  - When another appointment is created for that employee overlapping that range
  - Then it's rejected with a conflict error

- **Rebooking a cancelled slot**
  - Given an employee had a 10:00–11:00 appointment that is now `CANCELLED`
  - When a new appointment is created for that employee in the same range
  - Then it succeeds — cancelled appointments don't count toward conflicts

- **Rescheduling into a conflict**
  - Given an existing appointment being rescheduled to a new time range
  - When that range overlaps another of the same employee's non-cancelled appointments
  - Then the update is rejected (the appointment being rescheduled is excluded from its own conflict check)

- **Attempting to change the booked service**
  - Given an existing appointment
  - When an update request includes a different catalog item
  - Then it's rejected — update only accepts `startTime`, `endTime`, and `notes`

- **Marking a scheduled appointment as completed**
  - Given an appointment with status `SCHEDULED`
  - When its status is set to `COMPLETED`
  - Then the transition succeeds

- **Attempting to reopen a terminal appointment**
  - Given an appointment with status `COMPLETED`, `CANCELLED`, or `NO_SHOW`
  - When its status is set to any other value, including `SCHEDULED`
  - Then the transition is rejected — terminal statuses don't change

- **Booking outside the employee's configured hours**
  - Given an employee whose Tuesday hours are configured as 09:00–12:00
  - When an appointment is created for that employee on a Tuesday from
    13:00–14:00
  - Then it's rejected — the employee's own schedule applies, regardless of
    what the organization's hours are that day

- **Booking on an employee's day off**
  - Given an employee with no hours configured for Sunday (an explicit day
    off within their configured schedule)
  - When an appointment is created for that employee on a Sunday
  - Then it's rejected, even if the organization is open on Sundays — an
    employee's own configured schedule is never overridden by the
    organization's

- **Booking when the employee has no schedule configured at all**
  - Given an employee with no working hours configured (not even a
    day-by-day schedule with some days off)
  - When an appointment is created for that employee
  - Then the organization's working hours apply for that day instead — and
    the default 08:00–20:00 window applies if the organization has no
    working hours configured either

- **Appointment crossing midnight**
  - Given a time range where `endTime` falls on a different calendar day
    than `startTime`
  - When an appointment is created or rescheduled into that range
  - Then it's rejected — an appointment must start and end on the same day

## Out of scope

- Exactly one catalog item per appointment — no multi-service bookings in a
  single appointment (unlike a sale, which supports multiple line items).
