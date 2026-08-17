# Conventions

Code-level rules and patterns for this repository — how things are named,
structured and wired up. `AGENTS.md` at the repo root covers orientation
(stack, layout) and how an agent should operate here; this document covers
the actual coding conventions it points to.

## General TypeScript / Node / NestJS conventions

- Constructor injection only, `private readonly` fields. No field injection,
  no service locators.
- Don't add speculative abstractions (a generic `BaseService`, repository
  interfaces/DI tokens beyond what already exists) — this codebase favors
  concrete classes until real repetition justifies an abstraction.
- `noUncheckedIndexedAccess` is on: any array/record index access is
  `T | undefined`. Handle it explicitly — see the `results.at(0)!` /
  `results[0]?.count ?? 0` patterns used after operations that are known to
  always return a row (a single-row insert, an aggregate `count(*)`).
- Type-only imports use the inline style: `import { type Foo } from '...'`
  (enforced by `@typescript-eslint/consistent-type-imports` with
  `fixStyle: inline-type-imports`) — don't write a separate `import type`
  statement.
- `no-explicit-any` is disabled project-wide, but that's not license to use
  `any` — prefer `unknown` plus narrowing (see `shared/utils/safe.ts`).
- `no-floating-promises` is only a warning here, not an error. Still always
  `await` a promise or explicitly mark it fire-and-forget with `void` (see
  `void this.redis.set(...)` in `ConfigService.get`) — don't leave a bare
  unawaited call.
- Formatting is Prettier-owned (single quotes, trailing commas everywhere,
  `prettier-plugin-multiline-arrays`). Don't hand-format arrays/objects to
  satisfy the plugin — just run `pnpm format`.
- Never throw a raw `Error`, a built-in Nest `HttpException`, or an ad hoc
  object from feature code — see **Exceptions** below.
- Avoid `try`/`catch`. Use the Go-style `safe`/`safeAsync` helpers
  (`shared/utils/safe.ts`) instead — they wrap a callback and return a
  `[error, data]` tuple, so the error is a normal value you check inline
  instead of a control-flow jump: `const [error, data] = await safeAsync(() => thing())`.
  Reach for `try`/`catch` only when `safe`/`safeAsync` genuinely doesn't fit
  (e.g. an event-listener/lifecycle callback where you can't return a tuple).
- Never do decimal arithmetic (sum, subtract, multiply, divide) on money/
  numeric-column values with native JS operators or `parseFloat`/`Number`
  math — floating-point error compounds silently on `numeric`-backed values
  like `priceApplied`/`totalAmount`/`amount`. Use `big.js` (`Big` from
  `'big.js'`) for the calculation and convert back with `.toFixed(2)` (or
  the column's actual scale) before persisting/returning the string. See
  `SaleService`'s money helpers (`src/features/sale/sale.service.ts`) for
  the pattern.
- **Avoid nested conditionals — return early / fail fast instead.** When a
  method has several preconditions to check before doing its real work,
  check each one on its own line and `return`/`throw` immediately rather
  than wrapping the "happy path" in progressively deeper `if` blocks.
  Nesting forces the reader to hold every enclosing condition in their head
  to know what a given line actually depends on; a flat sequence of guard
  clauses reads top-to-bottom and each one can be understood in isolation.

  ```ts
  // Avoid — the real logic is buried three levels deep, and every branch
  // has to be traced back through both enclosing conditions to know when
  // it actually runs.
  async updateStatus(id: string, dto: UpdateSaleStatusDto) {
    const sale = await this.require(id);
    if (dto.status !== sale.status) {
      if (sale.status === SaleStatus.PENDING) {
        if (dto.status === SaleStatus.CANCELLED) {
          await this.saleRepository.update(id, { status: dto.status });
        } else {
          throw SaleExceptions.saleInvalidStatusTransition([...]);
        }
      } else {
        throw SaleExceptions.saleInvalidStatusTransition([...]);
      }
    }
  }

  // Prefer — each guard clause stands on its own; by the last line, every
  // invalid case has already exited.
  async updateStatus(id: string, dto: UpdateSaleStatusDto) {
    const sale = await this.require(id);
    if (dto.status === sale.status) {
      return;
    }
    if (sale.status !== SaleStatus.PENDING || dto.status !== SaleStatus.CANCELLED) {
      throw SaleExceptions.saleInvalidStatusTransition([...]);
    }
    await this.saleRepository.update(id, { status: dto.status });
  }
  ```

  See `SaleService.updateStatus` (`src/features/sale/sale.service.ts`) for
  this exact shape in real code.

## Adding a new feature module

Use `src/features/config` as the reference implementation (it's the most
recently built and touches most of the conventions below). For a new feature
`foo`:

1. `src/features/foo/foo.module.ts` — import `MainDatabaseModule` (if it uses
   repositories), `EnvironmentModule`/`RedisModule` if needed, register the
   controller(s) and service(s).
2. `src/features/foo/foo.controller.ts` — thin; only maps HTTP ⇄ service
   calls, never touches a repository or the db directly.
3. `src/features/foo/foo.service.ts` — business logic, orchestrates one or
   more repositories, owns transaction boundaries (`@MainTransactional()`).
4. `src/features/foo/foo-exceptions.ts` — feature-specific exception
   factories (see **Exceptions**).
5. `src/features/foo/dto/input/*.request.ts` and
   `src/features/foo/dto/output/*.response.ts` — zod schemas + DTO classes.
6. `src/features/foo/model/foo.model.ts` (optional) — a shared domain-shaped
   zod schema reused across multiple DTOs (see `config/model/config.model.ts`).
7. Register `FooModule` under the `// Features` section of
   `src/app.module.ts`.
8. If it needs DB access, add a repository (see **Repositories**) and add it
   to the `REPOSITORIES` array in
   `src/database/main/main-database.module.ts` (both the `providers` and
   `exports` list).
9. Run `pnpm format` (Prettier) over every file you created or edited — see
   **Linting / formatting**.

**File naming matters for Swagger:** the `@nestjs/swagger` CLI plugin
(configured in `nest-cli.json`) only introspects files ending in `.dto.ts`,
`.entity.ts`, `.param.ts`, `.response.ts`, `.request.ts`, `.enum.ts` or
`.model.ts`. Name new DTO/model/enum files with one of those suffixes or
their Swagger schemas won't be generated correctly.

## Controllers

- Always version routes: `@Controller({ path: 'foo', version: '1' })`.
- One responsibility per handler; delegate to the service immediately.
- Declare the response shape with `@ResponseType(SomeResponseModel, status?)`
  (`shared/decorator/response-type.decorator.ts`) — it wires up
  `ZodSerializerDto`, the Swagger `@ApiResponse`, and `@HttpCode` in one go.
  Default status is 200; pass `201` for creates (see
  `CustomerController.create`). For simple responses without the `{ data }`
  envelope, `@ZodResponse({ type })` from `nestjs-zod` is used directly (see
  `HealthController`).
- Input is typed with the zod-DTO classes via `@Body()` / `@Query()` /
  `@Param()`. Validation is automatic through the global `ZodValidationPipe`
  (`APP_PIPE` in `app.module.ts`) — don't add manual validation in handlers.
- **Auth is opt-out, not opt-in** — every route requires a session unless
  annotated otherwise. Use whichever of these matches the route:
  - `@OptionalAuth()` — no session required (e.g. health check).
  - `@RequireActiveOrg()` — caller must have an active organization/tenant
    (controller-level on `CustomerController`).
  - `@Roles([AuthRole.Admin])` — restrict by global auth role
    (`ConfigController` is admin-only).
  - `@OrgRoles([AuthOrgRole.Admin])` — restrict by org-scoped role
    (method-level on customer create/update).
  - All from `@thallesp/nestjs-better-auth`; roles themselves come from
    `AuthRole` / `AuthOrgRole` in `src/core/auth/auth.ts` — don't invent new role
    strings ad hoc.
- Session identity (tenantId/userId/role) is populated into CLS by
  `SessionInterceptor` and should be read via `ClsService` or
  `AuthValidationService` in the service layer — don't read it off the raw
  request in feature code.

## DTOs & validation (zod)

- Every input/output shape is a zod schema wrapped with
  `createZodDto(schema, { type: 'output' })`. Follow the existing
  `{ type: 'output' }` convention used throughout the codebase unless a
  specific DTO has a documented reason to differ.
- Naming: `FooSchema` for the schema, `FooDto` / `FooRequest` /
  `FooResponseModel` for the class.
- When a request body needs a named root key rather than posting the bare
  object, split the "domain" schema from the "wire" schema that wraps it,
  e.g. `PublishConfigSchema` → `PublishConfigRequestSchema` wraps it as
  `{ config: PublishConfigSchema }`. This project consistently nests payloads
  under a named key.
- Response envelopes: use `createResponseSchema(schema)` for `{ data: T }`
  and `createPaginatedResponseSchema(schema)` for
  `{ data: { items: T[] }, meta: { total, page, limit } }`
  (`shared/model/response.model.ts`) — don't hand-roll response envelopes.
- Reuse the shared param schemas in `shared/model/common.model.ts`
  (`IntParamSchema`, `DateParamSchema`, `DatetimeSchema`, `BooleanParamSchema`,
  `PhoneNumberSchema`, `ZipCodeSchema`, etc.) instead of writing ad hoc
  regex/coercion logic for the same concepts. Query-string values are always
  strings, so numeric/boolean query params must go through the matching
  `*ParamSchema` codec.
- Multi-tenant/scoping fields that are optional at the API layer default to
  the GLOBAL sentinels rather than being left undefined — e.g.
  `.default(GLOBAL_TENANT)`, `.default(GLOBAL_USER)`,
  `.default(CONFIG_GROUP_GLOBAL)`. Follow this for new tenant/user/group
  scoped fields.

## Authorization patterns

Two layers work together:

1. **Route-level guards** (`@Roles`, `@OrgRoles`, `@RequireActiveOrg`,
   `@OptionalAuth`) decide who can call the route at all — see
   **Controllers** above.
2. **Data-scoped access**, enforced in the service layer via
   `AuthValidationService` (`src/core/auth/auth-validation.service.ts`):
   - `assertSessionHasAccess(tenantId, userId)` — checks the current CLS
     session against the target resource's tenant/user. `GLOBAL_TENANT` /
     `GLOBAL_USER` are treated as shared/public scope, and the `Admin` role
     bypasses the check entirely.
   - `assertTenantExists(tenantId)` / `assertUserExists(userId)` — validate
     that referenced ids exist.

Call the access check **before** any lookups whose result (found vs.
not-found) could leak information to an unauthorized caller — i.e. don't let
a 404 "tenant not found" reach someone who would otherwise get a 403.

## Repositories

- One repository per aggregate root in `src/database/main/repositories`,
  extending the abstract `Repository` base class.
- Never inject the drizzle client directly. Access it through the `this.db`
  getter, and reference tables via `this.db.e.<table>` or, for the
  relational query API, `this.db.query.<table>`.
- Repositories don't open transactions themselves — they run inside whatever
  transaction is active on the calling service method via `@MainTransactional()`
  (`src/database/main/main-database-connection.ts`, backed by
  `nestjs-cls` + the drizzle transactional adapter).
- **`@MainTransactional()` is mandatory, not just for atomicity.** Almost
  every table has `addAuthenticatedPolicy(t)`, an RLS policy that filters
  rows by `current_setting('tenant.id')`. That setting only exists because
  `TransactionalAdapterDrizzleOrmCustom`
  (`src/core/transactional-adapter-drizzle-orm-custom.ts`) runs
  `SET LOCAL role '...'` and `SET LOCAL tenant.id = '<tenantId>'` at the start
  of every transaction opened via `@MainTransactional()`. Any service method
  that queries a tenant-scoped table — **reads included, not just
  writes/`SELECT`s alone** — must be wrapped in `@MainTransactional()`, or the
  query fails with `coreExceptions.databaseSessionNotSet` (Postgres error
  `42704`, handled in `AllExceptionsFilter`).
  - **Exception: the `config` module.** `configEntity` intentionally omits
    `addAuthenticatedPolicy` (see `main-entities.ts`) because configs can be
    scoped to `GLOBAL_TENANT`/`GLOBAL_USER` — shared across tenants — so its
    table isn't tenant-RLS-scoped. That's why `ConfigService.get`,
    `listGroup` and `listPaginated` don't use `@MainTransactional()`, while
    `publish` still does (for the insert/inactivate/cache-invalidate to be
    atomic, not for RLS). This is the one deliberate exception — don't drop
    `@MainTransactional()` from a new feature's read methods without the same
    genuinely cross-tenant requirement and the matching schema change (no
    `addAuthenticatedPolicy`).
- Use drizzle's native conditional filters — `.if(condition)` on a filter
  expression (e.g. `eq(this.db.e.config.group, dto.group).if(dto.group)`) —
  to conditionally include a WHERE clause, instead of building the `and(...)`
  argument list manually with ternaries/pushes. This is a drizzle-orm
  feature (added in v0.30.10), not a project-specific helper.
- For "list + count" endpoints, run both queries concurrently and combine
  with `promiseAllObject({ list, count })`
  (`shared/utils/promise-all-object.ts`) rather than sequential awaits.
- Single-row inserts: `.returning()` the row and assert it exists —
  `const [entity] = await ...; return entity!;` — since Postgres guarantees a
  row back for a successful insert.
- Prefer the relational query API (`db.query.table.findFirst({ where, with })`)
  for read paths that need nested relations; drop to the query builder
  (`db.select()...`) for joins-as-flat-columns, aggregates, unions, or
  subqueries.
- **Getter naming convention:**
  - `findBy<Criteria>` — returns many rows filtered by `<Criteria>` (e.g.
    `findByGroup`).
  - `findFirstBy<Criteria>` — returns a single row (or `undefined`) filtered
    by `<Criteria>` (e.g. `findFirstById`, `findFirstByGroupAndNameAndUserIdAndTenantId`).
  - `findFirstBy<Criteria>With<Relation>` — same as above, additionally
    loading a named relation (e.g. `findFirstByIdWithPersonAndPhones`). Chain
    `With<RelationA><RelationB>` for multiple relations.
  - Paginated list endpoints use `findPaginated` (see config/customer
    repositories), not `findBy`/`findFirstBy` — it's a distinct convention
    for the "filters + page/limit + count" shape.
  - Follow this for new repository methods; don't invent `getById`,
    `getBy<Criteria>`, `fetchX`, etc. Some older repositories (e.g.
    `CustomerRepository.getById`) predate this convention — don't copy their
    naming into new code.
- **Never hard-delete a row.** Every table has `deletedAt` from `baseEntity`
  and (usually) `addDeletedAtPolicy`, which makes the RLS policy itself
  filter out soft-deleted rows for every statement — so a "delete" repository
  method just sets `deletedAt: new Date()` via `update(...).set(...)`, the
  same way `ConfigRepository.inactivate` sets `inactivatedAt`. Once that
  transaction commits, ordinary queries (`findFirst`/`findBy*`/`select`) stop
  seeing the row automatically; no manual `isNull(deletedAt)` filter is
  needed in the repository.

## Service method naming

This governs the *service* layer specifically — it's a separate convention
from the **Getter naming convention** under **Repositories** above, which
stays as-is (`findFirstById` keeps `Id` explicit even though it's the
primary key). At the service layer, the primary key is the implicit,
default criteria: name it only when the lookup uses something else,
exactly like the existing `update`/`updateStatus`/`delete` never say
`updateById`/`deleteById`.

**Writes**

- `create(dto)` — single insert.
- `update(id, dto)` — partial update of the row's general fields, by
  primary key (implicit).
- `updateBy<Field>(value, dto)` — same, when the row is targeted by a field
  other than the primary key.
- `update<Field>(id, dto)` — narrow update of one specific field/subresource
  that carries its own business rules distinct from the general `update`
  (e.g. `updateStatus` — status has transition rules `update` doesn't
  touch).
- `delete(id)` — soft delete, by primary key (implicit).
- `sync<Relation>(id, relatedIds[])` — reconcile a child/many-to-many
  collection to match a given target set, adding/removing as needed (e.g.
  `syncForEmployee`).
- Escape hatch: when a write is a real domain action that isn't
  create/update/delete, name it after that action instead of forcing it
  into one of the above (e.g. `Config.publish`, which creates a new version
  *and* deactivates the old one).

**Reads**

- `get(id)` — **never throws.** Returns the row (or `null`/`undefined`) by
  primary key. Only add this when some caller genuinely needs to handle
  "not found" itself instead of an exception — don't add it just to have
  the pair.
- `require(id)` — **always throws** its feature's own not-found exception
  when the row doesn't exist, otherwise returns it non-nullable. This is the
  default/expected accessor: used by that feature's own controller for its
  `GET /:id` endpoint, by other features' services (see **Cross-feature
  access** below — `require`/`get` specifically live on the feature's
  `Read` service, not its full one), and by the same feature's own write
  service internally wherever it used to inline a fetch-then-throw before
  mutating (`update`/`updateStatus`/`delete` etc. call the injected
  `<Feature>ReadService.require(id)` rather than duplicating the check).
- **Relation-loading variants**, on both `get` and `require`, mirror the
  repository layer's `With<Relation>` chaining one level up: `require(id)`
  is the lean/no-relations form; `requireWithPerson(id)`,
  `requireWithPersonAndPhones(id)` etc. load progressively more, matching
  whichever repository method backs them
  (`findFirstById` → `findFirstByIdWithPerson` →
  `findFirstByIdWithPersonAndPhones`). Add only the variants that have an
  actual caller — e.g. `update`/`delete` use the lean `require(id)`, a
  cross-feature caller that only needs a name uses `requireWithPerson(id)`,
  and the owning controller's detail endpoint uses whichever variant matches
  its full response shape. There is no single "the" shape reused by every
  caller — each caller gets the variant that matches what it actually needs.
- `getBy<Field>(value)` / `requireBy<Field>(value)` — same idea, when the
  lookup uses a field other than the primary key (e.g. `getByName`). Combine
  with the relation-loading suffix if needed
  (`requireByNameWithPerson(value)`).
- `requireMany(ids[])` — bulk form of `require`: throws (listing which
  ids didn't resolve, in the `details` array) unless every given id matches
  a row, otherwise returns all of them. Prefer this over a call site
  fetching by ids and hand-rolling its own `results.length !== ids.length`
  check (e.g. `CatalogItemReadService.requireMany`, used by
  `EmployeeServiceService.syncForEmployee` to validate a batch of
  `catalogItemId`s in one call instead of injecting `CatalogItemRepository`
  directly).
- `listPaginated(dto)` — paginated list + total count.
- `list<Grouping>(dto)` — a non-paginated list variant (e.g. `listGroup`).
- `get<Resolved>(dto)` — a single value resolved through a scope/fallback
  hierarchy rather than a plain id lookup (e.g. `Config.get`, which walks
  tenant/user/group).
- `get<View>(dto)` — a specialized multi-row read shaped for one UI need,
  not generic pagination (e.g. `getDaySchedule`, `getCalendarRange`).
- `getCurrent<Thing>()` — no id param; resolved from the current auth/session
  context (e.g. `getCurrentTenantId`, `getWorkingHoursForCurrentOrganization`).

## Cross-feature access

- A feature's service must not inject another feature's repository to
  fetch-and-validate an entity it doesn't own, nor hand-roll that other
  feature's exception itself (e.g. `AppointmentService` throwing
  `CustomerExceptions.customerNotFound`). The owning feature's service
  exposes a `require...` method instead (see **Service method naming**
  above) — whichever relation-loading variant matches the caller's actual
  need, not necessarily the full response DTO from that feature's own
  controller — which throws its own not-found exception. The caller uses
  that method and never touches the other feature's repository or exception
  file directly.
  - Example: to validate `customerId` on create, `AppointmentService` calls
    `CustomerReadService.requireWithPerson(id)` (it only needs the
    customer's name) rather than injecting `CustomerRepository` and throwing
    `CustomerExceptions.customerNotFound` itself.
- **Exception: sub-entities with no feature/service of their own.** A
  repository for an entity that's always accessed through a parent
  aggregate — not independently exposed via its own feature/controller — can
  be injected directly by whichever service already owns that parent. E.g.
  `PersonPhoneRepository` has no owning service; phones are a child
  collection of `Person`, so `CustomerService`/`EmployeeService` (which
  already compose `Person`) use `PersonPhoneRepository` directly.
- Rationale: keeps "what does 'not found' mean for X, and what shape
  represents X" defined in exactly one place — the feature that owns X — so
  a future change to that entity's validation or shape happens in one file
  instead of wherever it happened to get consumed.

### Module structure: split into a `Read` module and the full module

Calling another feature's service is only half the problem — importing that
feature's *whole* module (controller, write logic, its own cross-feature
dependencies) creates the conditions for a circular import the moment that
other feature ever needs something back from you. So for every feature
that's consumed cross-feature, split it in two:

- **`<Feature>ReadModule`** (e.g. `CustomerReadModule`,
  `customer-read.module.ts`) — provides and exports `<Feature>ReadService`
  only. This service holds just the repository injection(s) needed for its
  `get`/`require` family of methods (see **Service method naming**).
  **It may only import the datasource module (`MainDatabaseModule`) —
  never another feature's module, `Read` or otherwise.** This is what makes
  it structurally impossible for the read side to end up in a cycle: a
  cycle needs two modules that each depend on the other, and a module that
  depends on nothing outside its own repositories can never be one of those
  two, no matter how the rest of the graph grows.
- **`<Feature>Module`** (unchanged in spirit) — provides `<Feature>Service`
  (`create`/`update`/`delete`/`listPaginated`/etc.) and the controller. It
  imports its own `<Feature>ReadModule` so `<Feature>Service` can inject
  `<Feature>ReadService` and call `.require(id)` for its own existence
  checks instead of duplicating that logic.

**Other features only ever import `<Feature>ReadModule`, never the full
`<Feature>Module`.** A controller that needs both reads and writes on the
same entity (rare, and only ever within that entity's own feature) injects
both services directly — `<Feature>Service` doesn't re-expose
`require`/`get` under its own name just to save the controller an
injection.

This is the standard answer to this problem in NestJS, not a
project-specific invention — often called a "facade" (export a narrow
public service, keep the rest private). `forwardRef()` is not an acceptable
substitute for it: NestJS's own docs treat it as a last resort, and reaching
for it here would just be hiding a design problem this split avoids
outright.

For cross-feature *side effects* rather than reads — e.g. "when an
appointment is completed, also do something in another feature" — prefer an
event (`EventEmitter2`) over a direct service call once that need actually
comes up. Not implemented anywhere yet; don't build it speculatively ahead
of a real caller.

### Batching and cross-feature joins

Composing data from another feature — validating existence or just
enriching a response — costs at least one extra query. How many, and how
safely, depends on the shape of the relationship:

- **Never query in a loop (N+1).** Enriching N primary rows with related
  data from another feature means one batched call, not one call per row.
  Batch methods on a `Read` service return a `Map<id, value>` (or array)
  keyed for O(1) lookup by the caller — e.g.
  `SaleReadService.findAppointmentIdToSaleIdMap(appointmentIds)`, used by
  `AppointmentService.listPaginated` to attach `saleId` to a whole page of
  appointments in one extra query total, not one per row.
- **Parallelize independent cross-feature reads.** When a method needs data
  from more than one other feature to build a single response, and neither
  depends on the other's result, fire them concurrently with `Promise.all`
  rather than sequential `await`s — e.g. `AppointmentService.getById`
  fetching the appointment and its sale together.
- **A direct cross-feature join in your own repository is fine when the
  relationship is many-to-one from your side** — you're joining "up" via a
  foreign key you hold, so the join is guaranteed to match at most one row
  on the other side. This is already the pattern for
  `customerName`/`employeeName`/`catalogItemName` in
  `AppointmentRepository` (joins straight into `customer`/`employee`/
  `catalogItem`/`person`, no `Read` service involved) — it's display
  enrichment, not fetch-and-validate, so the "must go through the owning
  service" rule above (which is about *validation* ownership, not query
  mechanics) doesn't forbid it.
- **Don't join the reverse direction (one-to-many, or unenforced-unique)
  the same way.** A plain join from the "one" side into a table that could
  have more than one matching row (nothing in the DB prevents it) risks
  silently duplicating primary rows — e.g. joining `appointment` to `sale`
  via `sale.appointmentId`, which is nullable and *not* unique. Use a
  batched separate query instead (see above). A
  `LEFT JOIN LATERAL ... ORDER BY ... LIMIT 1` can collapse that into one
  query too, but isn't used anywhere in this codebase yet — treat it as a
  deliberate, reviewed exception for a hot path that actually needs to
  shave off the extra round trip, not a default.
- **Composition that needs another feature's `Read` service belongs in the
  full `<Feature>Service` (or its controller), never inside your own
  `<Feature>ReadService`.** A `Read` module may only import
  `MainDatabaseModule` (see **Module structure** above) — that's what keeps
  the read side cycle-proof — so it can never import another feature's
  `Read` module either, no matter how well-intentioned the enrichment.
  `AppointmentService.getById`, not `AppointmentReadService`, is what calls
  both `AppointmentReadService` and `SaleReadService` and merges the
  result.

## Database schema (drizzle entities)

- All tables are defined in `src/database/main/main-entities.ts`, relations
  in `main-relations.ts`.
- New tables should spread `...baseEntity('xyz')` (a 3–5 character id
  prefix) to get a prefixed-UUID `id`, `createdAt`/`updatedAt`/`deletedAt`,
  `createdBy`/`lastUpdatedBy` and `tenantId` — all auto-populated from the
  CLS session. Don't add these columns by hand.
- Add `addDeletedAtPolicy(t)` (and `addAuthenticatedPolicy(t)` for
  tenant-scoped RLS) to the table's policy list unless there's a specific
  reason not to — `configEntity` is the one deliberate exception; see the
  `@MainTransactional()`/RLS note under **Repositories**.
- Add indexes/unique constraints that match actual query patterns (see
  `configEntity`'s unique index on `group, tenantId, userId, name, version`)
  — a repository method that filters/sorts on a column combination should
  usually have a matching index.
- **New soft-deletable tables need a hand-added trigger — drizzle-kit won't
  generate it.** Repositories only ever set `deletedAt` on delete, never
  `isDeleted` directly (see **Repositories** → *Never hard-delete a row*).
  `isDeleted` is flipped to `true` by the `fn_soft_delete_trigger()` Postgres
  function (created once, in the initial migration), fired by a
  `tg_soft_delete` trigger attached per-table (`AFTER UPDATE OF deleted_at`).
  That trigger isn't part of the Drizzle schema, so it's invisible to
  `migrations:generate:main` — after generating the migration for a new
  soft-deletable table, hand-add
  `CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "<table>" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();`
  to it yourself, or `isDeleted` never flips and the RLS policies (which
  filter on `is_deleted`, not `deleted_at`) silently keep "deleted" rows
  fully visible/writable. `employee_service`, `sale`, `sale_item`, and
  `sale_transaction` were missed this way — see `TODO.md`.
- After changing entities, see [`docs/MIGRATIONS.md`](./MIGRATIONS.md) for
  the build → generate → review → run workflow. The build step is easy to
  forget and `migrations:generate:main` will misbehave silently without it —
  don't skip straight to generate.

## Exceptions

- Never throw a plain `Error`, a Nest `HttpException` subclass, or an ad hoc
  object from service/feature code.
- Cross-cutting exceptions live in `src/core/core-exceptions.ts`
  (`coreExceptions`); feature-specific ones live in `<feature>-exceptions.ts`
  next to the feature (see `config-exceptions.ts`, `customer-exceptions.ts`),
  built with the `exception({ code, message, status })` factory from
  `src/core/exception/exception.ts`.
- Exception factories accept an optional message override and/or
  `ErrorDetailModel[]` details (`{ field, issue }`) — pass details when the
  error concerns a specific field.
- Every exception is eventually rendered as a `ResponseErrorModel` by
  `AllExceptionsFilter` (`src/core/filter/all-exception.filter.ts`), which
  also translates Zod, Drizzle, Throttler, `NotFoundException` and
  better-auth API errors into the same shape. Extend this filter for new
  classes of upstream error rather than adding another global filter.
- **HTTP status codes mean something specific — pick the one that matches
  what actually went wrong:**
  - `400` — the request itself is malformed (fails input validation). This
    is what `ZodValidationPipe` already produces automatically for a
    request that doesn't match its schema; don't hand-roll this one.
  - `401` — the caller isn't authenticated at all.
  - `403` — the caller is authenticated but isn't allowed to access the
    resource.
  - `404` — **only** for the resource a route's own URL identifies (a path
    parameter naming "the" resource of that route — e.g.
    `GET /customer/:customerId` when `customerId` doesn't exist). A
    reference to some *other* entity that turns out not to exist — a body
    field on the route's own feature, or an id handed to another feature's
    `require()`/`requireMany()` — is `422`, not `404`. E.g. `POST
    /appointment` with an `employeeId` that doesn't exist returns `422`,
    not `404`: the appointment isn't "not found", the request is
    unprocessable because it references something that doesn't exist.
  - `409` — a conflict between the request and the current state of a
    resource that can't both be true at once (double-booking a time slot,
    linking an employee to a service they're already linked to).
  - `422` — the request is well-formed and every reference in it resolves,
    but it violates a business rule (an appointment must be `COMPLETED`
    before a sale can be created from it, a refund can't exceed what was
    paid, a status transition isn't legal from the current status). See
    `authExceptions.tenantNotFound`/`userNotFound`
    (`src/core/auth/auth-exceptions.ts`) for existing precedent of this
    same 404-vs-422 distinction applied correctly.
  - `408` — the request itself took too long and was aborted server-side
    (see the timeout interceptor) — not something a specific feature
    throws deliberately.
  - `429` — the caller is being rate-limited (`ThrottlerException`,
    translated automatically in `AllExceptionsFilter`) — also not
    something feature code throws directly.
  - `500` — our own code or infrastructure is broken in a way no caller
    input could have triggered or fixed (a response failed to serialize
    against its own schema, a DTO's Zod schema was never registered, a
    query ran outside a transaction, a session's organization couldn't be
    resolved). If a condition can legitimately happen from something a
    caller did, it isn't a `500` — reach for one of the codes above
    instead.

## Environment / configuration

- Every env var is declared once as an `@EnvProperty(...)` field on `AppEnv`
  (`src/core/config/app-env.ts`) — never read `process.env` directly
  elsewhere.
- Inject `AppEnv` via `EnvironmentModule` in normal DI code; use
  `AppEnv.instance` only in module-scope bootstrap code that runs before DI
  exists (see `auth.ts`, `main-database-connection.ts`).
- Supported `type`s: default (string), `'number'`, `'boolean'`, `'json'`
  (with an optional zod `typeGetter` validator), `'list'` (comma-separated by
  default). Mark `required: true` for anything without a sane default.

## Caching (Redis)

- The Redis client is injected via `RedisModule` (`Redis` from
  `@upstash/redis`).
- A cache key must encode everything that affects the response — every
  scoping/filter parameter that changes the result, not just the ones that
  are convenient. A key coarser than the query it represents will hand back
  the wrong data to a request that legitimately differs on an unincluded
  parameter.
- If a read can resolve a value through a fallback/hierarchy (see how
  `ConfigService.get` walks tenant/user/group combinations), the write path
  needs to invalidate every cache entry that hierarchy could have populated,
  not just the entry for the exact scope being written.
- Always set a TTL from an env-configured value (`ex: appEnv.xCacheExpireSeconds`)
  — never cache indefinitely.

## Logging

- Use `LoggerService` (`src/core/logger/logger.service.ts`). Call
  `logger.setContext(ClassName.name)` in the constructor of anything that
  logs, and pass structured metadata as a second argument
  (`logger.error('message', { error, ... })`) instead of string-concatenating
  context into the message.

## Testing

- Unit test config is in `package.json` (`rootDir: src`, matches
  `*.spec.ts`); e2e config is `test/jest-e2e.json`.
- There are no unit tests in `src` yet. When adding tests for a feature,
  colocate `foo.service.spec.ts` next to `foo.service.ts` (etc.) rather than
  introducing a separate test tree.
- `pnpm test`, `pnpm test:watch`, `pnpm test:cov`, `pnpm test:e2e`.

## Linting / formatting

- `pnpm lint` (`eslint --fix`) and `pnpm format` (`prettier --write`) —
  run both before considering a change done.
- **Run `pnpm format` as the last step of any task that touches files, every
  time** — right after you finish creating/editing all the files you needed
  for that task, not just when something looks misformatted. Prettier owns
  layout here (multiline-arrays plugin, trailing commas, quote style); don't
  rely on hand-formatting matching it, and don't skip this step because the
  diff "looks fine."
- The TS config is strict (`strict`, `noUncheckedIndexedAccess`,
  `noFallthroughCasesInSwitch`, etc.) — expect `T | undefined` on
  array/record indexing and handle it explicitly rather than silencing it
  with `!` unless the invariant is genuinely guaranteed (and ideally that's
  obvious at the call site, the way `.at(0)!` is used after a known-single-row
  insert).
