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
