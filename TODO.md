# TODO

Things noticed in passing that aren't worth stopping the current task for.
Pull from this list when there's no specific task in flight. Finished items
move to `TODO_DONE.md` instead of being deleted outright.

- [ ] Wire `madge` up as an actual project check (`pnpm` script, and ideally
      a CI step), scoped to all of `src` — `madge --circular --extensions ts
      src/app.module.ts`. Confirmed via `pnpm dlx madge` that `src` is clean
      right now (exit code 0); the one blocker
      (`core/auth/auth.ts` ↔ `core/auth/extra-auth-end-points.plugin.ts`) is
      fixed — that file was a test and got deleted. Needs graphviz's `dot`
      installed for `--image` output, but not for the plain `--circular`
      check used here. See **Module structure: split into a `Read` module
      and the full module** in `docs/CONVENTIONS.md` for the pattern this is
      meant to guard.
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
      `PersonPhoneRepository` exception). `EmployeeServiceService`'s
      `CatalogItemRepository` injection is now fixed (see `TODO_DONE.md`) —
      check whether there are others across `Config`/`AnamnesisField`/other
      features not yet reviewed.
- [ ] Audit every feature consumed cross-feature against **Module structure:
      split into a `Read` module and the full module** in
      `docs/CONVENTIONS.md` — confirm each has a `<Feature>ReadModule` /
      `<Feature>ReadService` that only imports `MainDatabaseModule`, and
      that every cross-feature import points at the `Read` module, never the
      full one. Only `Customer`/`Employee`/`CatalogItem` have been split so
      far; re-check once `Appointment` or anything else starts being
      consumed cross-feature (e.g. by the upcoming `Sale` feature).
