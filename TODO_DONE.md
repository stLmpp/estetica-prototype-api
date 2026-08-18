# TODO (done)

Completed items moved out of `TODO.md`, kept for history instead of deleted
outright.

- [x] (2026-08-15) `employee_service`, `sale`, `sale_item`, and
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
- [x] (2026-08-15) `EmployeeServiceService.syncForEmployee` injected
      `CatalogItemRepository` directly for its bulk catalog-item existence
      check (`findManyByIds` + compare counts), violating **Cross-feature
      access**. Fixed by adding `CatalogItemReadService.requireMany(ids)`
      — a bulk form of `require` (throws listing whichever ids didn't
      resolve, in the `details` array, otherwise returns all matching rows)
      — and switching `syncForEmployee` to call it instead; also dropped its
      now-unused `CatalogItemRepository` and `CatalogItemExceptions`
      imports entirely. Documented the `requireMany` pattern in
      **Service method naming** in `docs/CONVENTIONS.md`.
- [x] (2026-08-15) `core/auth/auth.ts` and
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
- [x] (2026-08-15) Audited every `src/features/*/*.service.ts` against
      **Service method naming** in `docs/CONVENTIONS.md`. No violations —
      `ConfigService.get`/`listGroup` and
      `EmployeeServiceService.syncForEmployee` were already the doc's own
      canonical examples for `get<Resolved>`/`list<Grouping>`/
      `sync<Relation>`; `Customer`/`Employee`/`CatalogItem`/`Appointment`
      were already brought in line by the earlier `require`/`get` refactor.
      `AnamnesisFieldService` is an empty stub with no methods to check.
- [x] (2026-08-15) Audited every `src/features/*/*.service.ts` for direct
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
- [x] (2026-08-15) Audited every feature consumed cross-feature against
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

- [x] (2026-08-18) `src/core/filter/all-exception.filter.ts` hardcoded the
      Postgres error code `'42704'` as a raw string literal (used to detect
      `coreExceptions.databaseSessionNotSet`). Extracted into
      `PostgresErrorCode.UndefinedObject` in the new
      `src/core/filter/postgres-error-code.enum.ts`.

Remaining items live under **CI/CD dependencies** in `TODO.md`, parked until
that infrastructure exists, plus whatever's currently in the main list
above that.
