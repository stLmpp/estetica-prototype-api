# Sale — Database

Schema: `src/database/main/main-entities.ts` (entities) and
`main-relations.ts` (relations) — that's the source of truth for exact
columns, types, and constraints.

## Tables

- `sale` — a commercial transaction header: who bought (customer), who
  processed it (employee), optionally which appointment it came from, and a
  high-level status/total.
- `sale_item` — a line item within a sale: which catalog item, how many, and
  the price applied at the time of sale.
- `sale_transaction` — a single financial event against a sale (a payment or
  a refund), including individual installments.

## Relationships

- `sale.appointmentId` → `appointment.id`, nullable: null means an "orphan"
  sale with no appointment behind it (e.g. a walk-in retail sale).
- `sale.customerId` / `sale.employeeId` are always required — a sale is
  never anonymous or unattributed.
- `sale_item.saleId` → `sale.id`: a sale can have many items, one per
  catalog item sold in that transaction.
- `sale_transaction.saleId` → `sale.id`: a sale can have many transactions —
  one per payment/refund event, including one per installment.

## Design decisions

- `sale.status` is a denormalized summary column, not the source of truth
  for payment history — `sale_transaction` rows are. A single mutable
  status/payment-method pair on `sale` can't represent a payment followed by
  a refund without losing the record that a payment happened, and can't
  represent split payments either.
- Installments are modeled as multiple `sale_transaction` rows (same
  `installmentCount`, distinct `installmentNumber`) rather than a separate
  installment table — an installment is just a financial event scheduled
  for a future date, so it fits the existing "one row per event" model
  instead of needing its own table.
- `sale_transaction.installmentNumber` / `installmentCount` are nullable
  with no default (not defaulted to `1`) to avoid storing a value that means
  nothing ("not an installment") on every row of what could become a large
  table.
- `sale_transaction.receivedAt` doubles as both a status flag and a
  timestamp: null means the event (e.g. a future installment) hasn't been
  confirmed yet; a non-null value records when it was.
- `sale_item` and `sale_transaction` follow the same `pgTable.withRLS(...)`
  + tenant-scoped partial index + soft-delete pattern as every other table
  in `main-entities.ts` — closest precedent is `appointment` /
  `appointment_item`.
