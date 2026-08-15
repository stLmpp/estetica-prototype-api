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
   table, also hand-add its `tg_soft_delete` trigger** — drizzle-kit has no
   idea it exists (see **Database schema (drizzle entities)** in
   `docs/CONVENTIONS.md`), so it never generates
   `CREATE TRIGGER tg_soft_delete AFTER UPDATE OF deleted_at ON "<table>" FOR EACH ROW EXECUTE FUNCTION fn_soft_delete_trigger();`
   for you. Forgetting it is easy and silent (see `TODO.md` for tables this
   already happened to) — no error, `isDeleted` just never flips to `true`.
4. `pnpm migrations:run:main`
   Applies all pending migrations to the local dev database.

## Quick reference

| Step   | Command                        |
| ------ | ------------------------------- |
| Build  | `pnpm migrations:build:main`    |
| Generate | `pnpm migrations:generate:main` |
| Run    | `pnpm migrations:run:main`      |

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

## Notes

- Never hand-edit a migration's SQL file to add logic that changes semantics
  drizzle didn't generate (e.g. a data backfill) — if you need that, add a
  plain `.sql` follow-up migration instead, so drizzle's own diff stays
  trustworthy.
- Before generating a `NOT NULL` migration on a column that may already have
  rows, check the live dev table's row count / existing values first — a
  `NOT NULL` migration on a populated column with nulls will fail to apply.
