# Migrations

How to produce and apply a database migration after changing
`src/database/main/main-entities.ts` (or any other drizzle schema file).

## Workflow

Run these in order, every time — skipping the build step is the single most
common mistake here (`migrations:generate:main` will silently generate an
empty or stale migration against the config in `migrations/dist/`, not your
latest schema changes, if you skip it):

1. `pnpm migrations:build:main`
   Compiles `migrations/main-drizzle.config.ts` (and friends) into
   `migrations/dist/main-drizzle.config.js`. drizzle-kit reads the compiled
   config, not the TypeScript source, so this must run first — every time,
   even if you think nothing config-related changed.
2. `pnpm migrations:generate:main`
   Diffs the schema in `main-entities.ts` against the compiled config from
   step 1 and writes a new migration folder under `migrations/main/`.
3. **Review the generated SQL** in the new `migrations/main/<timestamp>_*/`
   folder before applying it. Check for things drizzle can't infer safely on
   its own: `NOT NULL` on a column with existing rows, dropped columns/tables,
   renames drizzle mistook for a drop+add, etc. **For any new soft-deletable
   table, also add its `tg_soft_delete` trigger via a custom migration** (see
   **Custom / hand-written SQL migrations** below) — drizzle-kit has no idea
   the trigger exists (see **Database schema (drizzle entities)** in
   `docs/CONVENTIONS.md`), so it never generates it for you. Forgetting it is
   easy and silent (see `TODO.md` for tables this already happened to) — no
   error, `isDeleted` just never flips to `true`.
4. `pnpm migrations:run:main`
   Applies all pending migrations to the local dev database.

## Quick reference

| Step         | Command                                |
| ------------ | --------------------------------------- |
| Build        | `pnpm migrations:build:main`            |
| Generate     | `pnpm migrations:generate:main`         |
| Generate (custom/empty) | `pnpm migrations:generate-empty:main` |
| Run          | `pnpm migrations:run:main`              |

The auth datasource has its own runner (`pnpm migrations:run:auth`) and does
not go through this build/generate flow — it's managed by better-auth's CLI
directly. It reads the compiled `dist/core/auth/auth.js`, not the TypeScript
source, so **run `pnpm build` before `pnpm migrations:run:auth`** every time
you change `additionalFields` or anything else in `auth.ts` — otherwise it
migrates against a stale config.

Adding a new `required: true` additional field to a table that already has
rows will fail (`column ... contains null values`) — better-auth's migrator
doesn't backfill existing rows for a field's `defaultValue`, it only applies
that default at the application layer for new records. For an org that
already has data, add the field as `required: false` first, run the
migration, backfill the column, then flip it to `required: true` and migrate
again — the same add-nullable → backfill → set-not-null sequence documented
above for the main schema, just driven through `auth.ts` + the CLI instead of
hand-written SQL.

## Custom / hand-written SQL migrations

For anything not representable in `main-entities.ts` — triggers, functions,
data backfills, one-off `ALTER`s — don't hand-edit a drizzle-generated
migration file to smuggle it in; that breaks drizzle's own diff trail
(it'll think that migration only did what it generated, not what you added).
Instead generate an empty migration and write the SQL yourself:

1. `pnpm migrations:build:main` (same as always — still needed first)
2. `pnpm migrations:generate-empty:main`
   Writes a new `migrations/main/<timestamp>_*/migration.sql` containing
   only a comment placeholder — no diffing against the schema.
3. Write the SQL by hand, in the same `--> statement-breakpoint`-separated
   style drizzle itself generates (see any existing migration for the
   pattern).
4. `pnpm migrations:run:main`, same as any other migration.

Concrete example — adding `employee_service`, `sale`, `sale_item`, and
`sale_transaction` to the `tg_soft_delete` trigger after they'd been created
without it:

```sql
-- Custom SQL migration file, put your code below! --
CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "employee_service" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();--> statement-breakpoint
CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "sale" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();
```

## Notes

- Never hand-edit a migration's SQL file to add logic that changes semantics
  drizzle didn't generate (e.g. a data backfill) — use
  `migrations:generate-empty:main` for that instead (see **Custom /
  hand-written SQL migrations** above), so drizzle's own diff stays
  trustworthy.
- Before generating a `NOT NULL` migration on a column that may already have
  rows, check the live dev table's row count / existing values first — a
  `NOT NULL` migration on a populated column with nulls will fail to apply.
