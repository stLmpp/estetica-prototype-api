# AGENTS.md

Guidance for any agent (human or AI) working in this repository. Follow the
patterns already established in the codebase over generic framework advice —
when in doubt, find the closest existing example and mirror it. If something
here looks stale or wrong, verify against the actual code/docs before acting
on it, and prefer asking over guessing when intent is unclear.

## Stack snapshot

- **NestJS 11** (`swc` builder via `nest-cli.json`), TypeScript in `strict`
  mode with `noUncheckedIndexedAccess`
- **drizzle-orm 1.0.0-rc.4** against Postgres (`pg`), using both the
  relational query API (`db.query.table.findFirst/findMany`) and the
  query builder (`db.select()...`)
- **better-auth** + `@thallesp/nestjs-better-auth` for authentication,
  organizations and role-based guards; session identity is bridged into
  request-scoped context via `nestjs-cls`
- **zod v4** + **nestjs-zod** for request/response validation, DTOs and
  Swagger schema generation
- **Redis** (`@upstash/redis`) for caching and better-auth secondary storage
- **pino** for logging
- **pnpm** is the only supported package manager (see `pnpm-workspace.yaml`,
  `pnpm-lock.yaml`) — never use npm/yarn or touch their lockfiles

## Project layout

```
src/
  app.module.ts          composition root — core modules + feature modules
  main.ts                bootstrap
  core/                  cross-cutting infrastructure, not business logic
    config/              AppEnv + @EnvProperty + EnvironmentModule
    exception/           generic exception() factory
    filter/              AllExceptionsFilter (global APP_FILTER)
    interceptor/         session/logging/timeout/zod-serializer interceptors
    logger/              LoggerService (pino)
    openapi/             swagger/openapi generation helpers
    redis/                RedisModule + better-auth secondary storage adapter
  database/main/         drizzle schema + data access
    main-entities.ts     table definitions
    main-relations.ts    drizzle relations
    main-database-connection.ts   pool, drizzle client, @MainTransactional()
    main-database.module.ts       registers all repositories
    repositories/        one repository class per aggregate
  auth/                  better-auth config, roles, session validation
  features/<feature>/    one folder per feature module (see below)
  shared/                reusable, framework-agnostic building blocks
    decorator/           e.g. @ResponseType
    domain/               shared enums
    model/                shared zod schemas (pagination, common param types)
    utils/                safe(), promiseAllObject(), etc.
migrations/               drizzle-kit migrations + per-datasource configs
test/                     e2e tests (jest-e2e.json)
```

## General TypeScript / Node / NestJS conventions

- Constructor injection only, `private readonly` fields. No field injection,
  no service locators.
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
- After changing entities: `pnpm migrations:build:main`, then
  `pnpm migrations:generate:main` to produce a migration — review the
  generated SQL before running `pnpm migrations:run:main`.

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

## Working in this repo (for agents)

- Mirror the closest existing feature module instead of introducing a new
  pattern. If a genuine deviation is needed, say so explicitly and why.
- Don't add speculative abstractions (a generic `BaseService`, repository
  interfaces/DI tokens beyond what already exists) — this codebase favors
  concrete classes until real repetition justifies an abstraction.
- `pnpm` only — don't run npm/yarn or touch `package-lock.json`/`yarn.lock`.
- Dependency patches live in `patches/` (see `patches/nestjs-zod.patch`,
  wired up via `pnpm-workspace.yaml`'s `patchedDependencies`) — check there
  before assuming a library's shipped types/behavior when something looks
  off.
- When unsure whether a library behaves a certain way (drizzle, zod,
  better-auth, etc.), verify against the installed package or official docs
  rather than pattern-matching from something that merely looks similar —
  and ask if it's still unclear.
