# TODO (done)

Completed items moved out of `TODO.md`, kept for history instead of deleted
outright.

- [x] **BE-19** (2026-08-15) `employee_service`, `sale`, `sale_item`, and
      `sale_transaction` were missing the `tg_soft_delete` trigger
      (`fn_soft_delete_trigger()`, created in
      `migrations/main/20260520144049_initial`, attached per-table in
      `migrations/main/20260803034517_trigger_deleted`) that every other
      soft-deletable table has. Without it, `isDeleted` never flipped to
      `true` on delete, and the RLS policies (which filter on `is_deleted`,
      not `deleted_at`) silently kept "deleted" rows fully
      visible/writable on these four tables. Fixed via a custom migration
      (`migrations/main/20260815021753_bizarre_shriek`) adding the trigger
      to all four. See **Custom / hand-written SQL migrations** in
      `docs/MIGRATIONS.md` for the workflow used.
- [x] **BE-20** (2026-08-15) `EmployeeServiceService.syncForEmployee` injected
      `CatalogItemRepository` directly for its bulk catalog-item existence
      check (`findManyByIds` + compare counts), violating **Cross-feature
      access**. Fixed by adding `CatalogItemReadService.requireMany(ids)`
      — a bulk form of `require` (throws listing whichever ids didn't
      resolve, in the `details` array, otherwise returns all matching rows)
      — and switching `syncForEmployee` to call it instead; also dropped its
      now-unused `CatalogItemRepository` and `CatalogItemExceptions`
      imports entirely. Documented the `requireMany` pattern in
      **Service method naming** in `docs/CONVENTIONS.md`.
- [x] **BE-21** (2026-08-15) `core/auth/auth.ts` and
      `core/auth/extra-auth-end-points.plugin.ts` had a real circular
      dependency (`auth.ts` builds `auth` from a plugin list that includes
      `extraAuthEndPointsPlugin()`; that plugin's handler called
      `auth.api.addMember(...)`, needing the fully-built `auth` back) —
      found via `pnpm dlx madge --circular --extensions ts
      src/app.module.ts`. Turned out the plugin was only ever added as a
      test and wasn't needed, so it (and its registration in `auth.ts`) was
      deleted outright rather than restructured. `madge` now reports no
      circular dependencies anywhere in `src` (previously only verified
      clean under `src/features`).
- [x] **BE-22** (2026-08-15) Audited every `src/features/*/*.service.ts` against
      **Service method naming** in `docs/CONVENTIONS.md`. No violations —
      `ConfigService.get`/`listGroup` and
      `EmployeeServiceService.syncForEmployee` were already the doc's own
      canonical examples for `get<Resolved>`/`list<Grouping>`/
      `sync<Relation>`; `Customer`/`Employee`/`CatalogItem`/`Appointment`
      were already brought in line by the earlier `require`/`get` refactor.
      `AnamnesisFieldService` is an empty stub with no methods to check.
- [x] **BE-23** (2026-08-15) Audited every `src/features/*/*.service.ts` for direct
      injection of another feature's repository, per **Cross-feature
      access** in `docs/CONVENTIONS.md`. No remaining violations —
      every repository injection is either the feature's own
      (`AppointmentRepository` in `AppointmentService`, etc.),
      `ConfigAdminRepository` alongside `ConfigRepository` in
      `ConfigService` (both operate on the `config` table — same feature,
      two repository classes, not a cross-feature access), or the
      documented `PersonRepository`/`PersonPhoneRepository` sub-entity
      exception (`Customer`/`Employee`). `AnamnesisFieldService` is an
      empty stub with no repositories injected.
- [x] **BE-24** (2026-08-15) Audited every feature consumed cross-feature against
      **Module structure: split into a `Read` module and the full module**
      in `docs/CONVENTIONS.md`. Only `Customer`, `Employee`, and
      `CatalogItem` are actually imported by another feature's module
      (`Appointment` and `EmployeeService` both consume all three; nothing
      else is consumed cross-feature yet) — all three already have their
      `<Feature>ReadModule`, each importing only `MainDatabaseModule`, and
      every cross-feature import (`AppointmentModule`,
      `EmployeeServiceModule`) points at the `Read` module, never the full
      one. Re-run this check once `Appointment` or anything else starts
      being consumed cross-feature (e.g. by the upcoming `Sale` feature).

- [x] **BE-25** (2026-08-18) `GET /v1/health` unconditionally returned
      `{ status: 'OK' }` with no actual check, so it couldn't distinguish
      a genuinely healthy instance from one that's up but can't reach
      Postgres or Redis. Installed `@nestjs/terminus` (v11.1.1,
      peer-compatible with this app's Nest 11) and split it into two
      routes matching the standard liveness/readiness distinction: `GET
      /v1/health/live` (unchanged no-op, kept on the existing
      `@ZodResponse`/`HealthResponse` pattern) and `GET /v1/health/ready`
      (new — `@HealthCheck()` + `HealthCheckService.check()`, composing
      `MainDatabaseHealthIndicator` (pings the main DB via
      `MainDatasource.execute(sql\`select 1\`)`) and `RedisHealthIndicator`
      (pings via `Redis.ping()`) — 503 automatically when either is down.
      Redis included because `ThrottlerGuard` is a global `APP_GUARD`
      backed by Upstash Redis, so it's a hard dependency for effectively
      every request, not an optional feature. Route shape (split
      live/ready, not query-param-based) picked as the de facto standard
      regardless of what ends up deploying this, since it doesn't
      foreclose any future target. `tsc`/lint/`pnpm build` all clean;
      `/v1/health/ready` verified against the running dev server showing
      `mainDatabase: up` — the paired `redis` check is code-complete and
      typechecked but not yet confirmed live, since the dev server's
      watcher hadn't picked up the latest edit by the time this was
      written down.
- [x] **BE-26** (2026-08-18) `src/core/filter/all-exception.filter.ts` hardcoded the
      Postgres error code `'42704'` as a raw string literal (used to detect
      `coreExceptions.databaseSessionNotSet`). Extracted into
      `PostgresErrorCode.UndefinedObject` in the new
      `src/core/filter/postgres-error-code.enum.ts`.
- [x] **BE-27** (2026-08-18) `GET /v1/anamnesis-field` was paginated
      (`AnamnesisFieldController.listPaginated` →
      `AnamnesisFieldRepository.findPaginated`) though every real caller
      wanted the full flat list, unlike `anamnesis-section`'s correctly
      non-paginated equivalent. Dropped `page`/`limit` from
      `FilterAnamnesisFieldDto`, renamed `AnamnesisFieldRepository
      .findPaginated` → `findByAnamnesisFormId` (plain `findMany`-style,
      mirroring `AnamnesisSectionRepository.findByAnamnesisFormId`),
      renamed `AnamnesisFieldService.listPaginated` → `listByForm`
      (matching the `list<Grouping>` convention in
      **Service method naming**, `docs/CONVENTIONS.md`), and switched
      `ListAnamnesisFieldResponseModel` to the flat-array shape
      (`createResponseSchema` instead of `createPaginatedResponseSchema`).
      Paired with the frontend update in `estetica-prototype-fe`'s
      `TODO_DONE.md`.
- [x] **BE-1** (2026-08-18) `patches/nestjs-zod.patch` patched `nestjs-zod`'s
      compiled `dist/dto-*.{d.mts,mjs,cjs}` files directly to backport the
      `createZodDto(schema, { type: 'input' | 'output' })` API, and broke on
      every version bump because the bundler content-hashes those compiled
      filenames — confirmed twice, most recently bumping 5.4.0 → 5.5.0.
      Forked `nestjs-zod` instead: published `@stlmpp/nestjs-zod` (own repo,
      `github.com/stLmpp/nestjs-zod`, published to npm as `1.0.0`) with the
      `type` option applied at the source level, replaced every `import ...
      from 'nestjs-zod'` across the codebase with `@stlmpp/nestjs-zod`,
      dropped the plain `nestjs-zod` dependency, and deleted
      `patches/nestjs-zod.patch` along with its `patchedDependencies` entry
      in `pnpm-workspace.yaml` — `pnpm patch` is no longer part of this
      project's dependency story for this package.
- [x] **BE-6** (2026-08-19) `src/database/main/main-entities.ts` (602 lines)
      defined every table across every domain in one file. Split into
      `src/database/main/entities/` — one file per domain
      (`person.entities.ts` for person/employee/customer/personPhone,
      `catalog-item.entities.ts`, `employee-service.entities.ts`,
      `customer-followup.entities.ts`, `appointment.entities.ts`,
      `anamnesis-field.entities.ts`, `customer-anamnesis.entities.ts`,
      `sale.entities.ts`, `config.entities.ts`) plus `entities/base.ts` for
      the shared helpers (`baseEntity`, `addAuthenticatedPolicy`,
      `addDeletedAtPolicies`). `main-entities.ts` is now a barrel
      re-exporting every entity file and assembling `mainEntities`, so
      existing imports (`main-relations.ts`, every repository, several
      feature services) needed no changes. Confirmed via `pnpm dlx madge
      --circular --extensions ts src/app.module.ts` that the split
      introduced no circular imports (cross-domain foreign keys form a DAG:
      `person`/`catalog-item` have no outgoing domain deps, everything else
      only imports "down" from those), and via `pnpm migrations:generate:main`
      that the generated drizzle schema is byte-for-byte unchanged ("No
      schema changes, nothing to migrate"). Updated **Database schema
      (drizzle entities)** in `docs/CONVENTIONS.md` and the project-layout
      snapshot in `AGENTS.md` to describe the new layout.
- [x] **BE-5** (2026-08-21) `src/features/sale/sale.service.ts` (466 lines) had
      accumulated too much endpoint-specific business logic in one place.
      Split `create`/`addTransaction` — the two operations that actually
      carried business rules — into their own `use-cases/` classes
      (`CreateSaleUseCase`, `AddSaleTransactionUseCase`, each a single
      `execute()` method carrying the `@MainTransactional()` boundary moved
      from `SaleService`); `updateStatus`/`delete`/`listPaginated` stayed on
      `SaleService` since they had no endpoint-specific rules to isolate.
      Shared pure helpers (money math, transaction expansion/installments,
      status derivation, entity→model mappers) moved to a new
      `sale.util.ts` as plain exported functions — no DI needed, mirrors
      `shared/utils/`. While scoping this, found `SaleService` was also the
      one feature keeping its own `require`/`requireWithDetails` instead of
      delegating to its `Read` service, unlike every other split feature
      (`CustomerService`/`CustomerReadService`, etc.) — moved both onto
      `SaleReadService` and updated `SaleController` to inject
      `SaleReadService` directly for `getById`, matching the established
      **Module structure** convention in `docs/CONVENTIONS.md`. Pure
      structural move, no behavior change; verified with `pnpm exec tsc
      --noEmit`, `pnpm build`, and `pnpm dlx madge --circular --extensions
      ts src/app.module.ts` (still no circular imports).

Remaining items live under **CI/CD dependencies** in `TODO.md`, parked until
that infrastructure exists, plus whatever's currently in the main list
above that.
