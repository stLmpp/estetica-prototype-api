# CustomerFollowup feature — design

Closes **BE-7** (backend, this repo's `TODO.md`) and **FE-7**
(`estetica-prototype-fe`'s `TODO.md`). Builds the `CustomerFollowup`
feature: a dated note per customer, with optional priced items
underneath, optionally linked to the appointment and/or sale it follows
up on.

## Scope

- Backend: new feature module (`src/features/customer-followup/`), schema
  migration (two new nullable FK columns), permissions, feature docs.
- Frontend: new `customer-followup-tab` in `customer-details`, following
  the `customer-anamnesis-tab` pattern.
- Implementation order: backend first (verified working), then frontend.

Out of scope for this pass (tracked as new TODO items instead):
- Follow-up status (pending/done) and reminders/notifications.
- Prompting to create a follow-up immediately after an appointment or
  sale is completed.
- Before/after photos (BE-8/FE-8 — blocked separately on a storage
  design).

## Data model

`customer_followup` (`src/database/main/entities/customer-followup.entities.ts`)
gains two new **nullable** columns, neither present today:

- `appointmentId` — `varchar(38)`, FK to `appointment.id`, nullable.
- `saleId` — `varchar(38)`, FK to `sale.id`, nullable.

Both are optional and independent — a follow-up can reference neither
(standalone), either one, or both. `date` keeps its existing meaning:
the date the note was written, not a due/target date (there is no
due-date concept in this pass).

**Business rule:** if both `appointmentId` and `saleId` are set on the
same follow-up, the referenced sale's own `appointmentId` must equal the
given `appointmentId`. A mismatch (including a sale with no
`appointmentId` at all) is rejected with a `422`.

`followup_item` is unchanged — `description` (required), `catalogItemId`
(nullable FK to `catalog_item`), `priceApplied`, `quantity`. Differences
from `sale_item`'s otherwise-similar shape:
- `priceApplied` is **always required on input**, regardless of whether
  `catalogItemId` is set — no auto-pricing lookup from the catalog item
  (unlike `sale`'s items, which can omit it and get priced from the
  catalog).
- Items are **entirely optional** — a follow-up can have zero items (a
  plain note).

New indexes to add alongside the columns (mirroring the existing
`tenantId, customerId` index style already on this table):
- `(tenantId, appointmentId)` where not deleted.
- `(tenantId, saleId)` where not deleted.

## API surface

Flat top-level routes, filtered by a `customerId` query param on list —
matches `sale`/`appointment`'s pattern (`/sale`, `/appointment`), not
nested under `/customer/:id/...` the way `customer-anamnesis` is
(`/customer/:customerId/anamnesis`) — `followup_item` is structurally
closest to `sale_item`, and the optional `appointmentId`/`saleId`
cross-references read more naturally as a flat resource:

```
POST   /customer-followup            create
GET    /customer-followup            list, paginated, filtered by customerId
GET    /customer-followup/:id        get one (with items)
PATCH  /customer-followup/:id        full edit: text, date, appointmentId,
                                      saleId, items (items replaced wholesale)
DELETE /customer-followup/:id        soft delete
```

`PATCH` replaces the items array wholesale (delete-then-reinsert inside
the transaction) rather than diffing individual add/remove/edit
operations — items have no independent identity worth preserving across
an edit, so this is the simplest correct approach.

### Create/update request shape (sketch)

```ts
{
  customerId: string;
  text: string;
  date: string; // ISO date
  appointmentId?: string;
  saleId?: string;
  items?: Array<{
    description: string;
    catalogItemId?: string;
    quantity: number; // positive int, default 1
    priceApplied: string; // monetary string, always required
  }>;
}
```

## Permissions

New access-control resource in
`src/core/auth/organization-access-control.ts`:

```ts
customerFollowup: ['get', 'create', 'update', 'delete'],
```

- **owner** / **admin**: `get`, `create`, `update`, `delete`.
- **member**: `get` only (treated like `sale` — items carry pricing —
  rather than like `customerAnamnesis`, where members can log their own
  clinical notes).

## Backend module structure

Follows the `Read`/full module split
(`docs/CONVENTIONS.md` → **Module structure**):

- **`CustomerFollowupReadModule`** → `CustomerFollowupReadService`
  (`require`/`get`/`requireWithItems`). Imports only `MainDatabaseModule`.
- **`CustomerFollowupModule`** → controller + write logic. Given create
  validates two optional cross-feature references (appointment, sale)
  plus the cross-check business rule, split writes into per-endpoint
  use-cases under `use-cases/`, mirroring the recent `sale.service.ts`
  → `use-cases/` split (`cb9c2be`) rather than one large service file.
- Cross-feature reads needed: `CustomerReadService` (`customerId`),
  `AppointmentReadService` (`appointmentId`, and to fetch the
  appointment for the cross-check), `SaleReadService` (`saleId`, same
  cross-check), `CatalogItemReadService` (item `catalogItemId` when
  present).
- New `CustomerFollowupRepository` in `src/database/main/repositories/`.
- New `docs/features/customer-followup/FUNCTIONAL.md` and `DATABASE.md`,
  created from `docs/features/_templates/`.
- New drizzle-kit migration adding the two columns + indexes above.

## Frontend integration (estetica-prototype-fe)

New `customer-followup-tab` inside `customer-details`, following the
`customer-anamnesis-tab` pattern (full CRUD, unlike the read-only
`customer-sales-tab`):

- **`customer-followup-tab.component`** — list of the customer's
  follow-ups (date, text preview, item count/total), "Novo follow-up"
  action, edit/delete per row.
- **`customer-followup-form-page`** — shared create/edit form: date
  picker, text area, optional appointment picker and optional sale
  picker (both scoped to the customer), items sub-form (description,
  optional catalog item picker, quantity, price).
- **`customer-followup-detail-page`** — view a single follow-up in full
  (no separate finalize/lock flow exists here, unlike anamnesis).
- **`customer-followup.store.ts`** / `.service.ts` / `.model.ts` /
  `.dto.ts`, mirroring the anamnesis tab's split.
- Client-side validation mirrors the backend cross-check: if both an
  appointment and a sale are picked and the sale isn't linked to that
  appointment, warn/block before submit rather than relying solely on
  the `422` round-trip.

## New TODO items to add (not part of this build)

- **Status/reminders**: no `pending`/`done` status and no
  reminder/notification mechanism in this pass — revisit once there's a
  concrete need (paired BE/FE items).
- **Post-completion prompt**: offer to create a follow-up immediately
  after an appointment or a sale is marked completed, rather than only
  ever starting from the customer-followup tab (paired BE/FE items,
  frontend-led — likely no backend change needed beyond what this spec
  already builds).
