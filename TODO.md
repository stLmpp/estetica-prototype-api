# TODO

Things noticed in passing that aren't worth stopping the current task for.
Pull from this list when there's no specific task in flight. Finished items
move to `TODO_DONE.md` instead of being deleted outright.

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
