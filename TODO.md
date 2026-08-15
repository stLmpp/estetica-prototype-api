# TODO

Things noticed in passing that aren't worth stopping the current task for.
Pull from this list when there's no specific task in flight.

- [ ] `employee_service`, `sale`, `sale_item`, and `sale_transaction` are
      missing the `tg_soft_delete` trigger (`fn_soft_delete_trigger()`,
      created in `migrations/main/20260520144049_initial`, attached per-table
      in `migrations/main/20260803034517_trigger_deleted`) that every other
      soft-deletable table has. Without it, `isDeleted` never flips to `true`
      on delete, and the RLS policies (which filter on `is_deleted`, not
      `deleted_at`) silently keep "deleted" rows fully visible/writable on
      these four tables. Add a migration with
      `CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "<table>"
      FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();` for each. See
      **Database schema (drizzle entities)** in `docs/CONVENTIONS.md` for why
      `migrations:generate:main` never adds this automatically.
- [ ] `EmployeeServiceService.syncForEmployee` still injects
      `CatalogItemRepository` directly for its bulk catalog-item existence
      check (`findManyByIds` + compare counts) — no bulk equivalent exists on
      `CatalogItemService` yet, so this one didn't fit the `require(id)`
      pattern applied everywhere else. Add a bulk method
      (e.g. `CatalogItemService.requireManyByIds(ids)`) once there's a second
      caller that needs the same thing, so it's not a speculative addition.
- [ ] Investigate `madge` (dependency-graph / circular-dependency detector)
      and wire it up as a project check (`pnpm` script, and ideally a CI
      step) so an accidental circular import between feature modules gets
      caught automatically instead of relying on code review to notice. See
      **Module structure: split into a `Read` module and the full module**
      in `docs/CONVENTIONS.md` for the pattern this is meant to guard.
- [ ] Audit every `src/features/*/*.service.ts` against **Service method
      naming** in `docs/CONVENTIONS.md` — `create`/`update`/`updateBy<Field>`/
      `update<Field>`/`delete`/`sync<Relation>` for writes,
      `get`/`require`/`getBy<Field>`/`requireBy<Field>`/`listPaginated`/
      `list<Grouping>`/`get<Resolved>`/`get<View>`/`getCurrent<Thing>` for
      reads, `get` never throwing and `require` always throwing. Only
      `Customer`/`Employee`/`CatalogItem`/`Appointment` were brought in line
      so far (via the `require`/`get` refactor) — `Config`,
      `AnamnesisField`, and `EmployeeService` haven't been checked against
      the current rules yet.
- [ ] Audit every `src/features/*/*.service.ts` for direct injection of
      another feature's repository (`src/database/main/repositories/*`) —
      violates **Cross-feature access** in `docs/CONVENTIONS.md` unless the
      repository belongs to a sub-entity with no owning service (the
      `PersonPhoneRepository` exception). Known remaining violation:
      `EmployeeServiceService` still injects `CatalogItemRepository`
      directly for its bulk lookup (see the bullet above) — check whether
      there are others across `Config`/`AnamnesisField`/other features not
      yet reviewed.
- [ ] Audit every feature consumed cross-feature against **Module structure:
      split into a `Read` module and the full module** in
      `docs/CONVENTIONS.md` — confirm each has a `<Feature>ReadModule` /
      `<Feature>ReadService` that only imports `MainDatabaseModule`, and
      that every cross-feature import points at the `Read` module, never the
      full one. Only `Customer`/`Employee`/`CatalogItem` have been split so
      far; re-check once `Appointment` or anything else starts being
      consumed cross-feature (e.g. by the upcoming `Sale` feature).
