# CustomerFollowup Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the backend `CustomerFollowup` feature (BE-7) — create/list/get/update/delete
on a dated customer note with optional priced items and optional links to
the appointment/sale it follows up on.

**Architecture:** Standard `Read`/full module split (`docs/CONVENTIONS.md`).
One `CustomerFollowupRepository` owns both `customer_followup` and
`followup_item` (mirrors `SaleRepository` owning `sale`/`sale_item`/
`sale_transaction`). Business logic (cross-feature link validation, item
resolution, wholesale item replace on update) lives directly in
`CustomerFollowupService` — this feature's complexity (one optional
appointment ref + one optional sale ref + a replace-on-update child
collection) is closer to `CustomerAnamnesisService` (single service file)
than to `SaleService`'s multi-use-case split, so no separate `use-cases/`
directory is introduced here.

**Deviation from the spec:** the spec (`docs/superpowers/specs/
2026-08-21-customer-followup-design.md`) suggested mirroring `sale`'s
per-endpoint `use-cases/` split. Having now read `customer-anamnesis.service.ts`
closely (the actually-comparable precedent — one optional cross-feature
ref, EAV-style child rows replaced on update, similar line count), a single
service file fits better and avoids introducing structure the feature
doesn't need yet. Everything else in the spec is unchanged.

**Tech Stack:** NestJS 11, drizzle-orm, zod v4 + nestjs-zod, Postgres.

**Spec:** `docs/superpowers/specs/2026-08-21-customer-followup-design.md`

## Global Constraints

- `pnpm` only — never `npm`/`yarn`/`npx` (see `AGENTS.md`).
- Routes are flat, top-level, under `/customer-followup` — not nested
  under `/customer/:id/...`.
- Monetary amounts are validated with `/^\d{1,8}(\.\d{1,2})?$/` (copy this
  regex locally into each DTO/model file that needs it — this codebase
  duplicates it per file rather than sharing one constant; see
  `src/features/sale/model/sale.model.ts` and friends).
- Permissions: new `customerFollowup` access-control resource,
  `['get', 'create', 'update', 'delete']`. `owner`/`admin` get all four;
  `member` gets `get` only.
- No unit/e2e tests for this feature (repo has none yet, BE-18 defers that
  decision) — verify each task manually via `pnpm build` (type-check),
  `pnpm lint`, and a running dev server hit with `curl`.
- Run `pnpm format` then `pnpm lint` as the last step of every task that
  touches files.
- Every task ends with a commit.

---

## File Structure

```
src/database/main/entities/customer-followup.entities.ts   (MODIFY: +2 columns)
src/database/main/main-relations.ts                        (MODIFY: +2 relations, 1 fix)
src/core/auth/organization-access-control.ts                (MODIFY: +1 resource)
src/database/main/repositories/customer-followup.repository.ts   (NEW)
src/database/main/main-database.module.ts                   (MODIFY: register repo)
src/features/customer-followup/
  customer-followup-exceptions.ts                            (NEW)
  model/customer-followup.model.ts                            (NEW)
  customer-followup-read.service.ts                            (NEW)
  customer-followup-read.module.ts                             (NEW)
  customer-followup.service.ts                                  (NEW)
  customer-followup.controller.ts                                (NEW)
  customer-followup.module.ts                                     (NEW)
  dto/input/create-customer-followup.request.ts                   (NEW)
  dto/input/update-customer-followup.request.ts                    (NEW)
  dto/input/list-customer-followup.request.ts                      (NEW)
  dto/output/create-customer-followup.response.ts                  (NEW)
  dto/output/get-customer-followup.response.ts                     (NEW)
  dto/output/list-customer-followup.response.ts                    (NEW)
src/app.module.ts                                            (MODIFY: register module)
docs/features/customer-followup/FUNCTIONAL.md                (NEW)
docs/features/customer-followup/DATABASE.md                  (NEW)
TODO.md / TODO_DONE.md                                        (MODIFY)
```

---

### Task 1: Schema — new columns, relations, migration

**Files:**
- Modify: `src/database/main/entities/customer-followup.entities.ts`
- Modify: `src/database/main/main-relations.ts`
- Create: a new migration folder under `migrations/main/` (generated, not
  hand-authored)

**Interfaces:**
- Produces: `customerFollowupEntity` gains `appointmentId: varchar | null`
  and `saleId: varchar | null` columns, both FKs. `mainRelations.customerFollowup`
  gains `appointment`/`sale` one-relations. Every later task's repository
  and service code assumes these two columns and relations exist.

- [ ] **Step 1: Add the two columns + indexes to the entity**

Open `src/database/main/entities/customer-followup.entities.ts` and change
the `customerFollowupEntity` definition to:

```ts
export const customerFollowupEntity = pgTable.withRLS(
  'customer_followup',
  {
    ...baseEntity('cfup'),
    text: text('text').notNull(),
    customerId: varchar('customer_id', { length: 38 })
      .notNull()
      .references(() => customerEntity.id),
    appointmentId: varchar('appointment_id', { length: 38 }).references(
      () => appointmentEntity.id,
    ),
    saleId: varchar('sale_id', { length: 38 }).references(
      () => saleEntity.id,
    ),
    date: timestamp('date').notNull(),
  },
  (t) => [
    index()
      .on(t.tenantId, t.customerId)
      .where(sql`${t.isDeleted} = false`),
    index()
      .on(t.tenantId, t.appointmentId)
      .where(sql`${t.isDeleted} = false`),
    index()
      .on(t.tenantId, t.saleId)
      .where(sql`${t.isDeleted} = false`),
    addAuthenticatedPolicy(t),
    ...addDeletedAtPolicies(t),
  ],
);
```

Add the two new imports this needs at the top of the file (check what's
already imported first — `catalogItemEntity` is already imported for
`followupItemEntity`, follow the same relative-import style):

```ts
import { appointmentEntity } from './appointment.entities';
import { saleEntity } from './sale.entities';
```

If either import creates a circular-import warning from `madge` (see
BE-16 in `TODO.md` — not yet wired into CI, but worth a manual sanity
check), stop and report it rather than working around it silently;
`appointment.entities.ts` and `sale.entities.ts` are leaf entity files
with no back-reference to `customer-followup.entities.ts` today, so this
should be safe.

- [ ] **Step 2: Add the appointment/sale relations, and fix the existing `followupItem.catalogItem` optional flag**

In `src/database/main/main-relations.ts`, change the `customerFollowup`
block to:

```ts
  customerFollowup: {
    customer: r.one.customer({
      from: r.customerFollowup.customerId,
      to: r.customer.id,
      optional: false,
    }),
    appointment: r.one.appointment({
      from: r.customerFollowup.appointmentId,
      to: r.appointment.id,
      optional: true,
    }),
    sale: r.one.sale({
      from: r.customerFollowup.saleId,
      to: r.sale.id,
      optional: true,
    }),
    followupItems: r.many.followupItem(),
  },
```

While in this file, fix `followupItem.catalogItem` — it's currently
marked `optional: false` even though `followup_item.catalog_item_id` is a
nullable column (an existing inconsistency; Task 4 below queries this
relation and needs it typed correctly to map a possibly-absent catalog
item name):

```ts
  followupItem: {
    followup: r.one.customerFollowup({
      from: r.followupItem.followupId,
      to: r.customerFollowup.id,
      optional: false,
    }),
    catalogItem: r.one.catalogItem({
      from: r.followupItem.catalogItemId,
      to: r.catalogItem.id,
      optional: true,
    }),
  },
```

- [ ] **Step 3: Generate and review the migration**

```bash
pnpm migrations:build:main
pnpm migrations:generate:main
```

Open the newly created `migrations/main/<timestamp>_*/migration.sql` and
confirm it only adds `appointment_id` and `sale_id` columns (both
nullable, no default) plus their two indexes and FK constraints — no
`NOT NULL`, no drops. Per `docs/MIGRATIONS.md`, this table already has
data flowing through it in dev, but since both new columns are nullable
this should apply cleanly regardless.

- [ ] **Step 4: Apply the migration**

```bash
pnpm migrations:run:main
```

- [ ] **Step 5: Type-check**

```bash
pnpm build
```

Expected: succeeds (no consumers of `followupItem.catalogItem`'s type
exist yet, so the `optional: true` fix can't break anything at this
point).

- [ ] **Step 6: Format, lint, commit**

```bash
pnpm format
pnpm lint
git add src/database/main/entities/customer-followup.entities.ts src/database/main/main-relations.ts migrations/main
git commit -m "feat(customer-followup): add appointmentId/saleId columns"
```

---

### Task 2: Permissions

**Files:**
- Modify: `src/core/auth/organization-access-control.ts`

**Interfaces:**
- Produces: `HasPermission({ orgPermissions: { customerFollowup: [...] } })`
  becomes a valid call for `'get' | 'create' | 'update' | 'delete'` —
  every controller route added from Task 4 onward depends on this.

- [ ] **Step 1: Add the resource to the statement and all three roles**

In `src/core/auth/organization-access-control.ts`:

```ts
const statement = {
  ...defaultStatements,
  catalogItem: ['get', 'create', 'update', 'delete'],
  person: ['get', 'create', 'update'],
  customer: ['get', 'create', 'update', 'delete'],
  employee: ['get', 'create', 'update', 'delete'],
  employeeService: ['get', 'create', 'delete'],
  appointment: ['get', 'create', 'update', 'updateStatus', 'delete'],
  sale: ['get', 'create', 'addTransaction', 'updateStatus', 'delete'],
  anamnesisField: ['get', 'create', 'update', 'delete'],
  customerAnamnesis: ['get', 'create', 'update', 'finalize', 'delete'],
  customerFollowup: ['get', 'create', 'update', 'delete'],
} as const;
```

Add `customerFollowup: ['get', 'create', 'update', 'delete']` to both the
`owner` and `admin` role blocks (same list as the statement), and
`customerFollowup: ['get']` to the `member` role block — three edits
total, same pattern as every other resource already in those blocks.

- [ ] **Step 2: Type-check, format, lint**

```bash
pnpm build
pnpm format
pnpm lint
```

- [ ] **Step 3: Commit**

```bash
git add src/core/auth/organization-access-control.ts
git commit -m "feat(customer-followup): add customerFollowup permission resource"
```

---

### Task 3: Exceptions + shared item model

**Files:**
- Create: `src/features/customer-followup/customer-followup-exceptions.ts`
- Create: `src/features/customer-followup/model/customer-followup.model.ts`

**Interfaces:**
- Produces: `CustomerFollowupExceptions.{customerFollowupNotFound,
  customerFollowupAppointmentMismatch, customerFollowupSaleMismatch,
  customerFollowupSaleAppointmentMismatch}`; `CustomerFollowupItemInputSchema`
  + `CustomerFollowupItemInput` type (zod schema/type for one item on
  create/update), `CustomerFollowupItemModelSchema` + `CustomerFollowupItemModel`
  type (response shape for one item). Every later task imports from these
  two files.

- [ ] **Step 1: Write the exceptions file**

```ts
// src/features/customer-followup/customer-followup-exceptions.ts
import { exception } from '../../core/exception/exception';

export const CustomerFollowupExceptions = {
  customerFollowupNotFound: exception({
    code: 'CUSTOMER_FOLLOWUP_NOT_FOUND',
    message: 'Customer followup not found',
    status: 404,
  }),
  customerFollowupAppointmentMismatch: exception({
    code: 'CUSTOMER_FOLLOWUP_APPOINTMENT_MISMATCH',
    message: 'Appointment does not belong to the given customer',
    status: 422,
  }),
  customerFollowupSaleMismatch: exception({
    code: 'CUSTOMER_FOLLOWUP_SALE_MISMATCH',
    message: 'Sale does not belong to the given customer',
    status: 422,
  }),
  customerFollowupSaleAppointmentMismatch: exception({
    code: 'CUSTOMER_FOLLOWUP_SALE_APPOINTMENT_MISMATCH',
    message: 'Sale is not linked to the given appointment',
    status: 422,
  }),
} as const;
```

- [ ] **Step 2: Write the shared item model**

```ts
// src/features/customer-followup/model/customer-followup.model.ts
import { z } from 'zod';

const MonetaryAmountSchema = z
  .string()
  .trim()
  .regex(/^\d{1,8}(\.\d{1,2})?$/);

export const CustomerFollowupItemInputSchema = z.object({
  description: z.string().trim().min(1).max(2048),
  catalogItemId: z.string().trim().min(1).optional(),
  quantity: z.int().positive().default(1),
  priceApplied: MonetaryAmountSchema,
});

export type CustomerFollowupItemInput = z.output<
  typeof CustomerFollowupItemInputSchema
>;

export const CustomerFollowupItemModelSchema = z.object({
  id: z.string(),
  description: z.string(),
  catalogItemId: z.string().optional(),
  catalogItemName: z.string().optional(),
  quantity: z.int().positive(),
  priceApplied: MonetaryAmountSchema,
});

export type CustomerFollowupItemModel = z.input<
  typeof CustomerFollowupItemModelSchema
>;
```

- [ ] **Step 3: Type-check, format, lint, commit**

```bash
pnpm build
pnpm format
pnpm lint
git add src/features/customer-followup/customer-followup-exceptions.ts src/features/customer-followup/model/customer-followup.model.ts
git commit -m "feat(customer-followup): add exceptions and shared item model"
```

---

### Task 4: Repository, read module/service, and create endpoint (first vertical slice)

This is the largest task in the plan — it's kept as one task rather than
split further because the repository, read-service, and create-endpoint
files all reference each other's exports (the repository's `findPaginated`
signature needs the list DTO, the read-service's `requireWithItems`
return type needs the create-response DTO, the create endpoint needs
both). Splitting them across separate commits would leave intermediate
commits that don't compile — see the file list below, all of which land
together.

**Files:**
- Create: `src/database/main/repositories/customer-followup.repository.ts`
- Modify: `src/database/main/main-database.module.ts`
- Create: `src/features/customer-followup/customer-followup-read.service.ts`
- Create: `src/features/customer-followup/customer-followup-read.module.ts`
- Create: `src/features/customer-followup/dto/input/create-customer-followup.request.ts`
- Create: `src/features/customer-followup/dto/input/list-customer-followup.request.ts`
- Create: `src/features/customer-followup/dto/output/create-customer-followup.response.ts`
- Create: `src/features/customer-followup/customer-followup.service.ts`
- Create: `src/features/customer-followup/customer-followup.controller.ts`
- Create: `src/features/customer-followup/customer-followup.module.ts`
- Modify: `src/app.module.ts`

**Interfaces:**
- Consumes: `mainEntities.customerFollowup`/`mainEntities.followupItem`
  (Task 1), `CustomerFollowupExceptions`, `CustomerFollowupItemInputSchema`/
  `CustomerFollowupItemInput`/`CustomerFollowupItemModelSchema` (Task 3),
  `CustomerReadService.require(id)`, `AppointmentReadService.require(id)`,
  `SaleReadService.require(id)`, `CatalogItemReadService.requireMany(ids)`.
- Produces: `CustomerFollowupRepository` (`insert`, `insertItems`,
  `update`, `delete`, `deleteAllItemsByFollowupId`, `findFirstById`,
  `findFirstByIdWithItems`, `findPaginated(customerId, {page, limit})`);
  `FilterCustomerFollowupDto` (list filter shape, `{customerId, page,
  limit}`); `CustomerFollowupResSchema`/`CustomerFollowupResDto` (the
  shared full-record response shape reused by Tasks 5–6);
  `CustomerFollowupReadService.require(id)` /
  `.requireWithItems(id): Promise<CustomerFollowupResDto>`;
  `CustomerFollowupService.create(dto)` and the two private helpers
  `assertLinksValid`/`resolveItems` that Task 6 (update) reuses. `POST
  /customer-followup` is live and manually testable after this task.

- [ ] **Step 1: Write the repository**

```ts
// src/database/main/repositories/customer-followup.repository.ts
import { Injectable } from '@nestjs/common';
import { desc, eq, InferInsertModel, sql } from 'drizzle-orm';
import { mainEntities } from '../main-entities';
import { FilterCustomerFollowupDto } from '../../../features/customer-followup/dto/input/list-customer-followup.request';
import { promiseAllObject } from '../../../shared/utils/promise-all-object';
import { isObjectEmpty } from '../../../shared/utils/is-object-empty';
import { Repository } from './repository';

type CustomerFollowupInsert = Omit<
  InferInsertModel<typeof mainEntities.customerFollowup>,
  'id'
>;
type FollowupItemInsert = Omit<
  InferInsertModel<typeof mainEntities.followupItem>,
  'id' | 'followupId'
>;

@Injectable()
export class CustomerFollowupRepository extends Repository {
  async insert(customerFollowup: CustomerFollowupInsert) {
    const [entity] = await this.db
      .insert(this.db.e.customerFollowup)
      .values(customerFollowup)
      .returning();
    return entity!;
  }

  insertItems(followupId: string, items: FollowupItemInsert[]) {
    if (!items.length) {
      return Promise.resolve([]);
    }
    return this.db
      .insert(this.db.e.followupItem)
      .values(items.map((item) => ({ ...item, followupId })))
      .returning();
  }

  async update(id: string, patch: Partial<CustomerFollowupInsert>) {
    if (isObjectEmpty(patch)) {
      return;
    }
    await this.db
      .update(this.db.e.customerFollowup)
      .set(patch)
      .where(eq(this.db.e.customerFollowup.id, id));
  }

  async delete(id: string) {
    await this.db
      .update(this.db.e.customerFollowup)
      .set({ deletedAt: new Date() })
      .where(eq(this.db.e.customerFollowup.id, id));
  }

  async deleteAllItemsByFollowupId(followupId: string) {
    await this.db
      .update(this.db.e.followupItem)
      .set({ deletedAt: new Date() })
      .where(eq(this.db.e.followupItem.followupId, followupId));
  }

  findFirstById(id: string) {
    return this.db.query.customerFollowup.findFirst({
      where: { id },
    });
  }

  findFirstByIdWithItems(id: string) {
    return this.db.query.customerFollowup.findFirst({
      where: { id },
      with: {
        followupItems: {
          with: { catalogItem: { columns: { name: true } } },
        },
      },
    });
  }

  async findPaginated(
    customerId: string,
    { page, limit }: FilterCustomerFollowupDto,
  ) {
    const offset = (page - 1) * limit;
    const where = eq(this.db.e.customerFollowup.customerId, customerId);
    const customerFollowups = this.db
      .select()
      .from(this.db.e.customerFollowup)
      .where(where)
      .orderBy(desc(this.db.e.customerFollowup.date))
      .limit(limit)
      .offset(offset)
      .execute();
    const count = this.db
      .select({
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(this.db.e.customerFollowup)
      .where(where)
      .execute()
      .then((results) => results[0]?.count ?? 0);
    return promiseAllObject({ customerFollowups, count });
  }
}
```

- [ ] **Step 2: Register the repository**

In `src/database/main/main-database.module.ts`, add the import and add
`CustomerFollowupRepository` to the `REPOSITORIES` array (alongside
`SaleRepository`):

```ts
import { CustomerFollowupRepository } from './repositories/customer-followup.repository';
```

```ts
const REPOSITORIES = [
  // ...existing entries...
  SaleRepository,
  CustomerFollowupRepository,
];
```

- [ ] **Step 3: Write the list filter DTO (needed by the repository above and the list route later)**

```ts
// src/features/customer-followup/dto/input/list-customer-followup.request.ts
import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { RequestPaginatedSchema } from '../../../../shared/model/request.model';

export const FilterCustomerFollowupSchema = RequestPaginatedSchema.extend({
  customerId: z.string().trim().min(1),
});

export class FilterCustomerFollowupDto extends createZodDto(
  FilterCustomerFollowupSchema,
  { type: 'output' },
) {}
```

- [ ] **Step 4: Write the create request DTO**

```ts
// src/features/customer-followup/dto/input/create-customer-followup.request.ts
import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { DatetimeParamSchema } from '../../../../shared/model/common.model';
import { CustomerFollowupItemInputSchema } from '../../model/customer-followup.model';

export const CreateCustomerFollowupSchema = z.object({
  customerId: z.string().trim().min(1),
  text: z.string().trim().min(1),
  date: DatetimeParamSchema.optional(),
  appointmentId: z.string().trim().min(1).optional(),
  saleId: z.string().trim().min(1).optional(),
  items: z.array(CustomerFollowupItemInputSchema).optional(),
});

export class CreateCustomerFollowupDto extends createZodDto(
  CreateCustomerFollowupSchema,
  { type: 'output' },
) {}

export const CreateCustomerFollowupRequestSchema = z.object({
  customerFollowup: CreateCustomerFollowupSchema,
});

export class CreateCustomerFollowupRequest extends createZodDto(
  CreateCustomerFollowupRequestSchema,
  { type: 'output' },
) {}
```

- [ ] **Step 5: Write the create response DTO (also the shared `CustomerFollowupResSchema` reused by list/get in later tasks)**

```ts
// src/features/customer-followup/dto/output/create-customer-followup.response.ts
import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { createResponseSchema } from '../../../../shared/model/response.model';
import { DatetimeSchema } from '../../../../shared/model/common.model';
import { CustomerFollowupItemModelSchema } from '../../model/customer-followup.model';

export const CustomerFollowupResSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  text: z.string(),
  date: DatetimeSchema,
  appointmentId: z.string().optional(),
  saleId: z.string().optional(),
  items: z.array(CustomerFollowupItemModelSchema),
});

export type CustomerFollowupResDto = z.input<typeof CustomerFollowupResSchema>;

export const CreateCustomerFollowupResponseSchema = createResponseSchema(
  z.object({ customerFollowup: CustomerFollowupResSchema }),
);

export class CreateCustomerFollowupResponseModel extends createZodDto(
  CreateCustomerFollowupResponseSchema,
) {}
```

- [ ] **Step 6: Write the read service**

```ts
// src/features/customer-followup/customer-followup-read.service.ts
import { Injectable } from '@nestjs/common';
import { CustomerFollowupRepository } from '../../database/main/repositories/customer-followup.repository';
import { MainTransactional } from '../../database/main/main-database-connection';
import { CustomerFollowupExceptions } from './customer-followup-exceptions';
import { type CustomerFollowupResDto } from './dto/output/create-customer-followup.response';

@Injectable()
export class CustomerFollowupReadService {
  constructor(
    private readonly customerFollowupRepository: CustomerFollowupRepository,
  ) {}

  @MainTransactional()
  async require(id: string) {
    const record = await this.customerFollowupRepository.findFirstById(id);
    if (!record) {
      throw CustomerFollowupExceptions.customerFollowupNotFound([
        { field: 'customerFollowupId', issue: `not found with value '${id}'` },
      ]);
    }
    return record;
  }

  @MainTransactional()
  async requireWithItems(id: string): Promise<CustomerFollowupResDto> {
    const record =
      await this.customerFollowupRepository.findFirstByIdWithItems(id);
    if (!record) {
      throw CustomerFollowupExceptions.customerFollowupNotFound([
        { field: 'customerFollowupId', issue: `not found with value '${id}'` },
      ]);
    }
    return {
      id: record.id,
      customerId: record.customerId,
      text: record.text,
      date: record.date,
      appointmentId: record.appointmentId ?? undefined,
      saleId: record.saleId ?? undefined,
      items: record.followupItems.map((item) => ({
        id: item.id,
        description: item.description,
        catalogItemId: item.catalogItemId ?? undefined,
        catalogItemName: item.catalogItem?.name,
        quantity: item.quantity,
        priceApplied: item.priceApplied,
      })),
    };
  }
}
```

- [ ] **Step 7: Write the read module**

```ts
// src/features/customer-followup/customer-followup-read.module.ts
import { Module } from '@nestjs/common';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { CustomerFollowupReadService } from './customer-followup-read.service';

@Module({
  imports: [MainDatabaseModule],
  providers: [CustomerFollowupReadService],
  exports: [CustomerFollowupReadService],
})
export class CustomerFollowupReadModule {}
```

- [ ] **Step 8: Write the service**

```ts
// src/features/customer-followup/customer-followup.service.ts
import { Injectable } from '@nestjs/common';
import { CustomerFollowupRepository } from '../../database/main/repositories/customer-followup.repository';
import { CustomerReadService } from '../customer/customer-read.service';
import { AppointmentReadService } from '../appointment/appointment-read.service';
import { SaleReadService } from '../sale/sale-read.service';
import { CatalogItemReadService } from '../catalog-item/catalog-item-read.service';
import { MainTransactional } from '../../database/main/main-database-connection';
import { CustomerFollowupExceptions } from './customer-followup-exceptions';
import { type CreateCustomerFollowupDto } from './dto/input/create-customer-followup.request';
import { type CustomerFollowupResDto } from './dto/output/create-customer-followup.response';
import { type CustomerFollowupItemInput } from './model/customer-followup.model';

@Injectable()
export class CustomerFollowupService {
  constructor(
    private readonly customerFollowupRepository: CustomerFollowupRepository,
    private readonly customerReadService: CustomerReadService,
    private readonly appointmentReadService: AppointmentReadService,
    private readonly saleReadService: SaleReadService,
    private readonly catalogItemReadService: CatalogItemReadService,
  ) {}

  @MainTransactional()
  async create(dto: CreateCustomerFollowupDto): Promise<CustomerFollowupResDto> {
    await this.customerReadService.require(dto.customerId);
    await this.assertLinksValid(dto.customerId, dto.appointmentId, dto.saleId);

    const resolvedItems = await this.resolveItems(dto.items);

    const customerFollowup = await this.customerFollowupRepository.insert({
      customerId: dto.customerId,
      text: dto.text,
      date: dto.date ?? new Date(),
      appointmentId: dto.appointmentId,
      saleId: dto.saleId,
    });

    const insertedItems = await this.customerFollowupRepository.insertItems(
      customerFollowup.id,
      resolvedItems.map(({ catalogItemName: _catalogItemName, ...item }) => item),
    );
    const catalogItemNameById = new Map(
      resolvedItems
        .filter((item) => item.catalogItemId)
        .map((item) => [item.catalogItemId!, item.catalogItemName]),
    );

    return {
      id: customerFollowup.id,
      customerId: customerFollowup.customerId,
      text: customerFollowup.text,
      date: customerFollowup.date,
      appointmentId: customerFollowup.appointmentId ?? undefined,
      saleId: customerFollowup.saleId ?? undefined,
      items: insertedItems.map((item) => ({
        id: item.id,
        description: item.description,
        catalogItemId: item.catalogItemId ?? undefined,
        catalogItemName: item.catalogItemId
          ? catalogItemNameById.get(item.catalogItemId)
          : undefined,
        quantity: item.quantity,
        priceApplied: item.priceApplied,
      })),
    };
  }

  private async assertLinksValid(
    customerId: string,
    appointmentId: string | undefined,
    saleId: string | undefined,
  ) {
    const [appointment, sale] = await Promise.all([
      appointmentId
        ? this.appointmentReadService.require(appointmentId)
        : undefined,
      saleId ? this.saleReadService.require(saleId) : undefined,
    ]);

    if (appointment && appointment.customerId !== customerId) {
      throw CustomerFollowupExceptions.customerFollowupAppointmentMismatch([
        {
          field: 'appointmentId',
          issue: `appointment '${appointmentId}' does not belong to customer '${customerId}'`,
        },
      ]);
    }

    if (sale && sale.customerId !== customerId) {
      throw CustomerFollowupExceptions.customerFollowupSaleMismatch([
        {
          field: 'saleId',
          issue: `sale '${saleId}' does not belong to customer '${customerId}'`,
        },
      ]);
    }

    if (appointment && sale && sale.appointmentId !== appointment.id) {
      throw CustomerFollowupExceptions.customerFollowupSaleAppointmentMismatch([
        {
          field: 'saleId',
          issue: `sale '${saleId}' is not linked to appointment '${appointmentId}'`,
        },
      ]);
    }
  }

  private async resolveItems(items: CustomerFollowupItemInput[] | undefined) {
    if (!items?.length) {
      return [];
    }
    const catalogItemIds = [
      ...new Set(
        items
          .map((item) => item.catalogItemId)
          .filter((id): id is string => !!id),
      ),
    ];
    const catalogItems = catalogItemIds.length
      ? await this.catalogItemReadService.requireMany(catalogItemIds)
      : [];
    const catalogItemNameById = new Map(
      catalogItems.map((catalogItem) => [catalogItem.id, catalogItem.name]),
    );
    return items.map((item) => ({
      description: item.description,
      catalogItemId: item.catalogItemId,
      catalogItemName: item.catalogItemId
        ? catalogItemNameById.get(item.catalogItemId)
        : undefined,
      quantity: item.quantity,
      priceApplied: item.priceApplied,
    }));
  }
}
```

- [ ] **Step 9: Write the controller (create route only for now)**

```ts
// src/features/customer-followup/customer-followup.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { RequireActiveOrg } from '@thallesp/nestjs-better-auth';
import { CustomerFollowupService } from './customer-followup.service';
import { CreateCustomerFollowupRequest } from './dto/input/create-customer-followup.request';
import { CreateCustomerFollowupResponseModel } from './dto/output/create-customer-followup.response';
import { ResponseType } from '../../shared/decorator/response-type.decorator';
import { HasPermission } from '../../core/auth/has-permission.decorator';

@Controller({
  path: 'customer-followup',
  version: '1',
})
@RequireActiveOrg()
export class CustomerFollowupController {
  constructor(
    private readonly customerFollowupService: CustomerFollowupService,
  ) {}

  @ResponseType(CreateCustomerFollowupResponseModel, 201)
  @Post()
  @HasPermission({ orgPermissions: { customerFollowup: ['create'] } })
  async create(
    @Body() body: CreateCustomerFollowupRequest,
  ): Promise<CreateCustomerFollowupResponseModel> {
    const customerFollowup = await this.customerFollowupService.create(
      body.customerFollowup,
    );
    return { data: { customerFollowup } };
  }
}
```

(Tasks 5–7 add more imports/routes to this same file.)

- [ ] **Step 10: Write the module**

```ts
// src/features/customer-followup/customer-followup.module.ts
import { Module } from '@nestjs/common';
import { MainDatabaseModule } from '../../database/main/main-database.module';
import { CustomerReadModule } from '../customer/customer-read.module';
import { AppointmentReadModule } from '../appointment/appointment-read.module';
import { SaleReadModule } from '../sale/sale-read.module';
import { CatalogItemReadModule } from '../catalog-item/catalog-item-read.module';
import { CustomerFollowupReadModule } from './customer-followup-read.module';
import { CustomerFollowupController } from './customer-followup.controller';
import { CustomerFollowupService } from './customer-followup.service';

@Module({
  controllers: [CustomerFollowupController],
  imports: [
    MainDatabaseModule,
    CustomerReadModule,
    AppointmentReadModule,
    SaleReadModule,
    CatalogItemReadModule,
    CustomerFollowupReadModule,
  ],
  providers: [CustomerFollowupService],
})
export class CustomerFollowupModule {}
```

- [ ] **Step 11: Register the module in `app.module.ts`**

Add the import near `SaleModule`'s:

```ts
import { CustomerFollowupModule } from './features/customer-followup/customer-followup.module';
```

Add `CustomerFollowupModule` to the `imports` array, after `SaleModule`:

```ts
    HealthModule,
    CustomerModule,
    AnamnesisFieldModule,
    CustomerAnamnesisModule,
    ConfigModule,
    CatalogItemModule,
    EmployeeModule,
    EmployeeServiceModule,
    AppointmentModule,
    SaleModule,
    CustomerFollowupModule,
```

- [ ] **Step 12: Type-check**

```bash
pnpm build
```

Expected: succeeds. This is the first point everything from Steps 1–11
compiles together — if it fails, check that every file above exports the
exact names used by its consumers (the **Interfaces** block at the top
of this task lists them).

- [ ] **Step 13: Manual verification**

Start the dev server:

```bash
pnpm start:dev
```

In another terminal (adjust to however you currently obtain a session
cookie/token and an existing `customerId` in your dev org — same
approach used for manually testing any other endpoint here):

```bash
curl -X POST http://localhost:3000/v1/customer-followup \
  -H 'Content-Type: application/json' \
  -H 'Cookie: <your dev session cookie>' \
  -d '{
    "customerFollowup": {
      "customerId": "<an existing customer id>",
      "text": "Checked healing, looks good",
      "items": [
        { "description": "Follow-up cream", "quantity": 1, "priceApplied": "35.00" }
      ]
    }
  }'
```

Expected: `201`, body has `data.customerFollowup.id`,
`items[0].description === "Follow-up cream"`, `catalogItemId` and
`catalogItemName` absent (not provided). Confirm the row exists in
`customer_followup` and `followup_item` via your DB client of choice.

Also verify the appointment/sale mismatch rule: create a followup with an
`appointmentId` belonging to a *different* customer than `customerId` —
expect `422` with code `CUSTOMER_FOLLOWUP_APPOINTMENT_MISMATCH`.

- [ ] **Step 14: Format, lint, commit**

```bash
pnpm format
pnpm lint
git add src/database/main/repositories/customer-followup.repository.ts src/database/main/main-database.module.ts src/features/customer-followup/customer-followup-read.service.ts src/features/customer-followup/customer-followup-read.module.ts src/features/customer-followup/dto/input/create-customer-followup.request.ts src/features/customer-followup/dto/input/list-customer-followup.request.ts src/features/customer-followup/dto/output/create-customer-followup.response.ts src/features/customer-followup/customer-followup.service.ts src/features/customer-followup/customer-followup.controller.ts src/features/customer-followup/customer-followup.module.ts src/app.module.ts
git commit -m "feat(customer-followup): add repository, read service, and create endpoint"
```

---

### Task 5: List + get-by-id endpoints

**Files:**
- Create: `src/features/customer-followup/dto/output/list-customer-followup.response.ts`
- Create: `src/features/customer-followup/dto/output/get-customer-followup.response.ts`
- Modify: `src/features/customer-followup/customer-followup.service.ts`
- Modify: `src/features/customer-followup/customer-followup.controller.ts`

**Interfaces:**
- Consumes: `CustomerFollowupRepository.findPaginated` (Task 4),
  `CustomerFollowupReadService.requireWithItems` (Task 4),
  `FilterCustomerFollowupDto` (Task 4), `CustomerFollowupResSchema`
  (Task 4).
- Produces: `CustomerFollowupService.listPaginated(dto)`. `GET
  /customer-followup` and `GET /customer-followup/:customerFollowupId`
  are live and manually testable after this task.

- [ ] **Step 1: Write the list response DTO**

```ts
// src/features/customer-followup/dto/output/list-customer-followup.response.ts
import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { createPaginatedResponseSchema } from '../../../../shared/model/response.model';
import { DatetimeSchema } from '../../../../shared/model/common.model';

export const CustomerFollowupListItemSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  text: z.string(),
  date: DatetimeSchema,
  appointmentId: z.string().optional(),
  saleId: z.string().optional(),
});

export const ListCustomerFollowupResponseSchema = createPaginatedResponseSchema(
  CustomerFollowupListItemSchema,
);

export class ListCustomerFollowupResponseModel extends createZodDto(
  ListCustomerFollowupResponseSchema,
) {}
```

- [ ] **Step 2: Write the get response DTO (reuses the create response's schema, like `sale`)**

```ts
// src/features/customer-followup/dto/output/get-customer-followup.response.ts
import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { createResponseSchema } from '../../../../shared/model/response.model';
import { CustomerFollowupResSchema } from './create-customer-followup.response';

export const GetCustomerFollowupResSchema = CustomerFollowupResSchema;

export type GetCustomerFollowupResDto = z.input<typeof GetCustomerFollowupResSchema>;

export const GetCustomerFollowupResponseSchema = createResponseSchema(
  z.object({ customerFollowup: GetCustomerFollowupResSchema }),
);

export class GetCustomerFollowupResponseModel extends createZodDto(
  GetCustomerFollowupResponseSchema,
) {}
```

- [ ] **Step 3: Add `listPaginated` to the service**

In `customer-followup.service.ts`, add the import
`import { type FilterCustomerFollowupDto } from './dto/input/list-customer-followup.request';`
and this method:

```ts
  @MainTransactional()
  async listPaginated(dto: FilterCustomerFollowupDto) {
    const { customerFollowups, count } =
      await this.customerFollowupRepository.findPaginated(
        dto.customerId,
        dto,
      );
    return {
      items: customerFollowups.map((record) => ({
        id: record.id,
        customerId: record.customerId,
        text: record.text,
        date: record.date,
        appointmentId: record.appointmentId ?? undefined,
        saleId: record.saleId ?? undefined,
      })),
      count,
    };
  }
```

- [ ] **Step 4: Add the routes to the controller**

Update the imports at the top of `customer-followup.controller.ts` to
add `Get`, `Param`, `Query` to the `@nestjs/common` import, and add:

```ts
import { CustomerFollowupReadService } from './customer-followup-read.service';
import { FilterCustomerFollowupDto } from './dto/input/list-customer-followup.request';
import { ListCustomerFollowupResponseModel } from './dto/output/list-customer-followup.response';
import { GetCustomerFollowupResponseModel } from './dto/output/get-customer-followup.response';
```

Inject `CustomerFollowupReadService` in the constructor alongside
`CustomerFollowupService`, and add these two methods to the class:

```ts
  @ResponseType(ListCustomerFollowupResponseModel)
  @Get()
  @HasPermission({ orgPermissions: { customerFollowup: ['get'] } })
  async listPaginated(
    @Query() dto: FilterCustomerFollowupDto,
  ): Promise<ListCustomerFollowupResponseModel> {
    const { items, count } = await this.customerFollowupService.listPaginated(dto);
    return {
      data: { items },
      meta: { total: count, limit: dto.limit, page: dto.page },
    };
  }

  @ResponseType(GetCustomerFollowupResponseModel)
  @Get(':customerFollowupId')
  @HasPermission({ orgPermissions: { customerFollowup: ['get'] } })
  async getById(
    @Param('customerFollowupId') customerFollowupId: string,
  ): Promise<GetCustomerFollowupResponseModel> {
    const customerFollowup =
      await this.customerFollowupReadService.requireWithItems(customerFollowupId);
    return { data: { customerFollowup } };
  }
```

`CustomerFollowupReadService` doesn't need a `customer-followup.module.ts`
change — the module already imports `CustomerFollowupReadModule`, which
exports it, so the controller can inject it directly.

- [ ] **Step 5: Type-check**

```bash
pnpm build
```

- [ ] **Step 6: Manual verification**

With `pnpm start:dev` still running:

```bash
curl 'http://localhost:3000/v1/customer-followup?customerId=<id>&page=1&limit=10' \
  -H 'Cookie: <your dev session cookie>'

curl 'http://localhost:3000/v1/customer-followup/<the id from Task 4 step 13>' \
  -H 'Cookie: <your dev session cookie>'
```

Expected: list returns the record created in Task 4 with correct
`meta.total`; get-by-id returns the full record including `items`.

- [ ] **Step 7: Format, lint, commit**

```bash
pnpm format
pnpm lint
git add src/features/customer-followup/dto/output/list-customer-followup.response.ts src/features/customer-followup/dto/output/get-customer-followup.response.ts src/features/customer-followup/customer-followup.service.ts src/features/customer-followup/customer-followup.controller.ts
git commit -m "feat(customer-followup): add list and get-by-id endpoints"
```

---

### Task 6: Update endpoint

**Files:**
- Create: `src/features/customer-followup/dto/input/update-customer-followup.request.ts`
- Modify: `src/features/customer-followup/customer-followup.service.ts`
- Modify: `src/features/customer-followup/customer-followup.controller.ts`

**Interfaces:**
- Consumes: `CustomerFollowupReadService.require(id)` (Task 4),
  `assertLinksValid`/`resolveItems` private helpers (Task 4),
  `CustomerFollowupRepository.update`/`deleteAllItemsByFollowupId`/`insertItems`
  (Task 4).
- Produces: `CustomerFollowupService.update(id, dto): Promise<void>`.
  `PATCH /customer-followup/:customerFollowupId` is live after this task.

- [ ] **Step 1: Write the update request DTO**

`appointmentId`/`saleId` are `.optional().nullable()` — omitted means
"leave unchanged", `null` means "explicitly clear the link", a string
means "set to this value". Same convention as
`create-customer-anamnesis.request.ts`'s `appointmentId`.

```ts
// src/features/customer-followup/dto/input/update-customer-followup.request.ts
import { z } from 'zod';
import { createZodDto } from '@stlmpp/nestjs-zod';
import { DatetimeParamSchema } from '../../../../shared/model/common.model';
import { CustomerFollowupItemInputSchema } from '../../model/customer-followup.model';

export const UpdateCustomerFollowupSchema = z
  .object({
    text: z.string().trim().min(1).optional(),
    date: DatetimeParamSchema.optional(),
    appointmentId: z.string().trim().min(1).optional().nullable(),
    saleId: z.string().trim().min(1).optional().nullable(),
    items: z.array(CustomerFollowupItemInputSchema).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export class UpdateCustomerFollowupDto extends createZodDto(
  UpdateCustomerFollowupSchema,
  { type: 'output' },
) {}

export const UpdateCustomerFollowupRequestSchema = z.object({
  customerFollowup: UpdateCustomerFollowupSchema,
});

export class UpdateCustomerFollowupRequest extends createZodDto(
  UpdateCustomerFollowupRequestSchema,
  { type: 'output' },
) {}
```

- [ ] **Step 2: Add `update` to the service**

Add the import
`import { type UpdateCustomerFollowupDto } from './dto/input/update-customer-followup.request';`
and inject `CustomerFollowupReadService` into the constructor (it wasn't
needed there before — Tasks 4/5 only used it from the controller). Add
this method:

```ts
  @MainTransactional()
  async update(id: string, dto: UpdateCustomerFollowupDto): Promise<void> {
    const record = await this.customerFollowupReadService.require(id);

    const resolvedAppointmentId =
      dto.appointmentId !== undefined
        ? (dto.appointmentId ?? undefined)
        : (record.appointmentId ?? undefined);
    const resolvedSaleId =
      dto.saleId !== undefined
        ? (dto.saleId ?? undefined)
        : (record.saleId ?? undefined);
    await this.assertLinksValid(
      record.customerId,
      resolvedAppointmentId,
      resolvedSaleId,
    );

    const patch: {
      text?: string;
      date?: Date;
      appointmentId?: string | null;
      saleId?: string | null;
    } = {};
    if (dto.text !== undefined) {
      patch.text = dto.text;
    }
    if (dto.date !== undefined) {
      patch.date = dto.date;
    }
    if (dto.appointmentId !== undefined) {
      patch.appointmentId = dto.appointmentId;
    }
    if (dto.saleId !== undefined) {
      patch.saleId = dto.saleId;
    }
    await this.customerFollowupRepository.update(id, patch);

    if (dto.items !== undefined) {
      const resolvedItems = await this.resolveItems(dto.items);
      await this.customerFollowupRepository.deleteAllItemsByFollowupId(id);
      await this.customerFollowupRepository.insertItems(
        id,
        resolvedItems.map(
          ({ catalogItemName: _catalogItemName, ...item }) => item,
        ),
      );
    }
  }
```

Add `private readonly customerFollowupReadService: CustomerFollowupReadService,`
to the constructor and
`import { CustomerFollowupReadService } from './customer-followup-read.service';`
at the top.

- [ ] **Step 3: Add the route to the controller**

Add `Patch` to the `@nestjs/common` import and
`import { UpdateCustomerFollowupRequest } from './dto/input/update-customer-followup.request';`,
then add:

```ts
  @Patch(':customerFollowupId')
  @HasPermission({ orgPermissions: { customerFollowup: ['update'] } })
  async update(
    @Param('customerFollowupId') customerFollowupId: string,
    @Body() body: UpdateCustomerFollowupRequest,
  ): Promise<void> {
    await this.customerFollowupService.update(
      customerFollowupId,
      body.customerFollowup,
    );
  }
```

- [ ] **Step 4: Type-check**

```bash
pnpm build
```

- [ ] **Step 5: Manual verification**

```bash
curl -X PATCH 'http://localhost:3000/v1/customer-followup/<id>' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: <your dev session cookie>' \
  -d '{
    "customerFollowup": {
      "text": "Updated note",
      "items": [
        { "description": "New item", "quantity": 2, "priceApplied": "10.00" }
      ]
    }
  }'
```

Expected: `200`/`204` (no body), then a follow-up `GET
/customer-followup/<id>` shows `text: "Updated note"` and exactly the
one new item (the original item from Task 4 is gone — confirms the
wholesale replace). Also verify: `PATCH` with an empty `{}` body returns
`400` (the `.refine` "at least one field" rule); `PATCH` setting
`appointmentId` and `saleId` to a mismatched pair returns `422`.

- [ ] **Step 6: Format, lint, commit**

```bash
pnpm format
pnpm lint
git add src/features/customer-followup/dto/input/update-customer-followup.request.ts src/features/customer-followup/customer-followup.service.ts src/features/customer-followup/customer-followup.controller.ts
git commit -m "feat(customer-followup): add update endpoint"
```

---

### Task 7: Delete endpoint

**Files:**
- Modify: `src/features/customer-followup/customer-followup.service.ts`
- Modify: `src/features/customer-followup/customer-followup.controller.ts`

**Interfaces:**
- Consumes: `CustomerFollowupReadService.require(id)`,
  `CustomerFollowupRepository.delete(id)`.
- Produces: `CustomerFollowupService.delete(id): Promise<void>`. `DELETE
  /customer-followup/:customerFollowupId` is live after this task.

- [ ] **Step 1: Add `delete` to the service**

```ts
  @MainTransactional()
  async delete(id: string): Promise<void> {
    await this.customerFollowupReadService.require(id);
    await this.customerFollowupRepository.delete(id);
  }
```

- [ ] **Step 2: Add the route to the controller**

Add `Delete` to the `@nestjs/common` import, then:

```ts
  @Delete(':customerFollowupId')
  @HasPermission({ orgPermissions: { customerFollowup: ['delete'] } })
  async delete(
    @Param('customerFollowupId') customerFollowupId: string,
  ): Promise<void> {
    await this.customerFollowupService.delete(customerFollowupId);
  }
```

- [ ] **Step 3: Type-check**

```bash
pnpm build
```

- [ ] **Step 4: Manual verification**

```bash
curl -X DELETE 'http://localhost:3000/v1/customer-followup/<id>' \
  -H 'Cookie: <your dev session cookie>'
```

Expected: `200`/`204`. A subsequent `GET` on the same id returns `404`
`CUSTOMER_FOLLOWUP_NOT_FOUND`. Confirm `deleted_at` is set (not a hard
delete) on both the `customer_followup` row and its `followup_item` rows
— check that the soft-delete trigger (`tg_soft_delete`, already present
on this table since it predates this feature) actually flips
`is_deleted` to `true` on both, not just `customer_followup`.

- [ ] **Step 5: Format, lint, commit**

```bash
pnpm format
pnpm lint
git add src/features/customer-followup/customer-followup.service.ts src/features/customer-followup/customer-followup.controller.ts
git commit -m "feat(customer-followup): add delete endpoint"
```

---

### Task 8: Feature docs

**Files:**
- Create: `docs/features/customer-followup/FUNCTIONAL.md`
- Create: `docs/features/customer-followup/DATABASE.md`

**Interfaces:** None — documentation only.

- [ ] **Step 1: Write `FUNCTIONAL.md`**

```markdown
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
  - Then it and its items are marked deleted and no longer returned by
    `GET`, but the rows still exist

## Out of scope

- Status (pending/done) and reminders/notifications — no due-date
  concept exists yet either (see `TODO.md`).
- Prompting to create a follow-up right after an appointment or sale is
  completed — this version only supports creating one manually (see
  `TODO.md`).
- Before/after photos (tracked separately as BE-8 in `TODO.md`, blocked
  on a storage design).
```

- [ ] **Step 2: Write `DATABASE.md`**

```markdown
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
```

- [ ] **Step 3: Commit**

```bash
git add docs/features/customer-followup/FUNCTIONAL.md docs/features/customer-followup/DATABASE.md
git commit -m "docs(customer-followup): add feature docs"
```

---

### Task 9: TODO.md housekeeping + full verification pass

**Files:**
- Modify: `TODO.md`
- Modify: `TODO_DONE.md`

**Interfaces:** None.

- [ ] **Step 1: Move BE-7 to `TODO_DONE.md`**

Cut the entire `BE-7` bullet out of `TODO.md` (the one starting `- [ ]
**BE-7** \`customer_followup\`/\`followup_item\`...`) and paste it into
`TODO_DONE.md`, changing `- [ ]` to `- [x]` at the start, following
whatever format the rest of `TODO_DONE.md` already uses for finished
items (check the file first — it may prefix each entry with a
completion date; match that convention).

- [ ] **Step 2: Add the two new TODO items surfaced during design**

Add these to `TODO.md`'s main list, using the next two unused `BE-N`
numbers (check both `TODO.md` and `TODO_DONE.md` for the current highest
`BE-N` first, per the numbering rule at the top of `TODO.md`):

```markdown
- [ ] **BE-XX** `CustomerFollowup` has no status (pending/done) and no
      reminder/notification mechanism — `date` is just the date the note
      was written, not a due date. Revisit once there's a concrete need;
      see `docs/features/customer-followup/FUNCTIONAL.md`'s "Out of
      scope" section.
- [ ] **BE-XX** Offer to create a `CustomerFollowup` immediately after an
      appointment or a sale is marked completed, rather than only
      supporting creation from the customer-followup tab directly.
      Likely frontend-led (a prompt/shortcut in the appointment/sale
      completion flow that pre-fills `appointmentId`/`saleId`) — no
      backend change expected beyond what this feature already builds,
      but confirm once the frontend side is designed. Paired with a
      frontend TODO of the same name (`estetica-prototype-fe`'s
      `TODO.md`).
```

- [ ] **Step 3: Full verification pass**

```bash
pnpm build
pnpm lint
pnpm format
```

All three must succeed with no errors. Then, with `pnpm start:dev`
running, re-run through the full CRUD sequence from Tasks 4–7 once more
end to end (create → list → get → update → delete) to confirm nothing
regressed across tasks.

- [ ] **Step 4: Commit**

```bash
git add TODO.md TODO_DONE.md
git commit -m "docs(todo): move BE-7 to done, add follow-up status/prompt TODOs"
```

---

## After this plan

Backend is done. The frontend phase (`customer-followup-tab` in
`estetica-prototype-fe`, per the spec's **Frontend integration**
section) gets its own plan once this one is implemented and verified —
don't start it from this document.
