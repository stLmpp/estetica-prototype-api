# Sale — Functional

A sale is the record of a commercial transaction: a customer paying for one
or more catalog items (products or services). A sale can be created either
as the checkout step after a completed appointment, or standalone at the
register — a walk-in purchase with no appointment behind it.

## Concepts

- **Sale** — the transaction header: who bought, who processed it, how much,
  and (optionally) which appointment it came from.
- **Sale item** — a line item within a sale: one catalog item, a quantity,
  and the price applied at the time of sale.
- **Sale transaction** — a single financial event against a sale: a payment
  or a refund. A sale can have many of these — one per installment, one per
  payment method in a split payment, plus any refunds.
- **Orphan sale** — a sale with no linked appointment (`appointmentId` is
  null). Typically a walk-in retail purchase.
- **Installment** — a portion of a payment scheduled to land on a future
  date. Represented as its own sale transaction, not a separate concept.

## Business rules

- A sale always has a `customer` and an `employee` — it is never anonymous
  or unattributed, even when it's an orphan sale.
- A sale may optionally link to one `appointment`. When it doesn't, it's an
  orphan sale.
- A sale can only be created from an appointment whose status is
  `COMPLETED`.
- An appointment may have more than one sale — there's no restriction to a
  single sale per appointment (e.g. partial/split checkouts).
- When a sale is created from an appointment, its items default to that
  appointment's existing items (from `appointment_item`), editable before
  the sale is saved.
- Payment history is never overwritten. A refund does not erase the record
  that a payment happened — it adds a new transaction alongside it.
- Split payments (e.g. part cash, part card) are represented as multiple
  `PAYMENT` transactions, one per payment method.
- An installment plan is represented as multiple `PAYMENT` transactions that
  share the same `installmentCount`, each with its own `installmentNumber`,
  `dueDate`, and `receivedAt`.
- A transaction with `receivedAt` unset is still pending — the money hasn't
  been confirmed yet, whether that's a future installment or an
  unconfirmed payment.
- `sale.status` is a high-level summary, not hand-edited — it's kept in sync
  with the underlying transactions.

## Lifecycle

| Status                  | Meaning                                   | Triggered by                                        |
|-------------------------|-------------------------------------------|-----------------------------------------------------|
| Pendente (`PENDING`)    | Sale created, not yet fully paid          | Sale created                                        |
| Pago (`PAID`)           | Confirmed payments cover the total amount | Enough `PAYMENT` transactions have `receivedAt` set |
| Cancelado (`CANCELLED`) | Sale was cancelled before being paid      | Explicit cancellation                               |
| Estornado (`REFUNDED`)  | A previously paid sale was refunded       | A `REFUND` transaction is recorded                  |

## Scenarios

- **Orphan retail sale, paid in full immediately**
  - Given a customer buys a product at the counter with no appointment
  - When the sale is created with one sale item and one `PAYMENT`
    transaction (cash, confirmed immediately)
  - Then `appointmentId` is null and the sale's status becomes `PAID`

- **Sale created from a completed appointment**
  - Given an appointment with status `COMPLETED` and its existing
    `appointment_item` rows
  - When a sale is created for that appointment
  - Then the sale's items default to the appointment's items and
    `appointmentId` is set to that appointment

- **Attempt to create a sale from an unfinished appointment**
  - Given an appointment with status `SCHEDULED`
  - When someone tries to create a sale for it
  - Then the operation is rejected

- **Installment payment**
  - Given a sale of R$300 to be paid in 3x on a credit card
  - When the sale is finalized
  - Then three `PAYMENT` transactions are created, each ~R$100, sharing
    `installmentCount: 3`, with `installmentNumber` 1/2/3 and their own
    `dueDate`s — only the first may have `receivedAt` set immediately

- **Split payment**
  - Given a customer pays part in cash and part by card
  - When the sale is finalized
  - Then two `PAYMENT` transactions are recorded, one per payment method,
    each with its own amount

- **Refund after a completed payment**
  - Given a sale already fully paid (transactions with `receivedAt` set
    summing to the total amount)
  - When a refund is issued
  - Then a new `REFUND` transaction is recorded, the original `PAYMENT`
    transactions are left untouched, and the sale's status becomes
    `REFUNDED`

## Out of scope

- No API/service layer yet — this pass only covers the data model. Creating,
  listing, or updating sales isn't possible through the app yet.
- No automatic `sale.status` derivation logic yet — that's future
  service-layer work.
- Discounts and taxes are not modeled.
- Refund amount validation (e.g. blocking a refund larger than what was
  paid) is not enforced anywhere yet.
