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
- **Installments are only available on credit card.** A sale can be created
  with an installment plan shorthand — total amount + installment count —
  instead of the caller building each transaction by hand; the API rejects
  the request if the plan's payment method isn't `CREDIT_CARD`. The
  schedule is always monthly: installment *N* is due *N*-1 months after the
  given first due date (same day each month). Splitting the total evenly
  rarely divides cleanly, so the last installment absorbs whatever's left
  over rather than distributing the remainder — the installments still
  always sum exactly to the plan's total. The first installment can
  optionally be marked as already received (paid on the spot) as part of
  the same request; every other installment starts unconfirmed
  (`receivedAt` unset) and is confirmed later like any other transaction.
- **A sale cannot be created already refunded.** The `transactions` an
  API caller can submit at sale creation are payments only — a `REFUND`
  is only valid against a sale that already exists (via the add-transaction
  action), never in the initial creation payload.
- A transaction with `receivedAt` unset is still pending — the money hasn't
  been confirmed yet, whether that's a future installment or an
  unconfirmed payment.
- `sale.status` is a high-level summary, not hand-edited — it's kept in sync
  with the underlying transactions.
- A refund cannot exceed the net amount already paid: total `REFUND`
  amount for a sale can never exceed the sum of its confirmed (`receivedAt`
  set) `PAYMENT` transactions. This is checked against the sale's full
  transaction history, not just the single new transaction being added —
  e.g. a second refund is rejected once it would push the combined
  refunded total past what was actually paid.

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
  - Given a sale of R$300 to be paid in 3x on a credit card, with a first
    due date of the 15th
  - When the sale is created with an installment plan (amount R$300, count
    3, first due date the 15th)
  - Then three `PAYMENT` transactions are created — R$100 due the 15th,
    R$100 due the following 15th, R$100 due the 15th after that — sharing
    `installmentCount: 3` with `installmentNumber` 1/2/3, and none of them
    are confirmed (`receivedAt` unset) unless the request also marked the
    first as received

- **Installment plan on an uneven split**
  - Given a sale of R$100 to be paid in 3x on a credit card
  - When the sale is created with that installment plan
  - Then the first two installments are R$33.33 each and the third is
    R$33.34 — the rounding remainder lands on the last installment so the
    total still adds up to exactly R$100

- **Attempt to finance a non-credit-card payment**
  - Given a sale being created with an installment plan whose payment
    method is cash or debit card
  - When the request is submitted
  - Then it's rejected — only credit card can be split into installments

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

- **Refund larger than what was paid**
  - Given a sale with R$100 in confirmed `PAYMENT` transactions
  - When a `REFUND` transaction for R$150 is submitted
  - Then the operation is rejected — a refund can never push the sale's
    total refunded amount past its confirmed paid amount

- **Second refund exceeding the remaining paid balance**
  - Given a sale with R$100 confirmed paid and a R$60 `REFUND` already
    recorded against it
  - When a second `REFUND` transaction for R$50 is submitted
  - Then the operation is rejected — R$60 + R$50 would exceed the R$100
    confirmed paid, even though neither refund alone does

- **Attempt to include a refund at sale creation**
  - Given a sale creation request whose `transactions` include one with
    `type: REFUND`
  - When the request is submitted
  - Then it's rejected — a refund can only be recorded against a sale that
    already exists

## Out of scope

- Discounts and taxes are not modeled.
