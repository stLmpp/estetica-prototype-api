# AGENTS.md

Guidance for any agent (human or AI) working in this repository. Follow the
patterns already established in the codebase over generic framework advice —
when in doubt, find the closest existing example and mirror it. If something
here looks stale or wrong, verify against the actual code/docs before acting
on it, and prefer asking over guessing when intent is unclear.

**Read `docs/CONVENTIONS.md` before writing or changing any code.** It has
the actual code-level rules this file used to inline — naming conventions,
DTO/controller/repository patterns, exceptions, auth, schema, caching,
logging, testing, lint/format. This file covers orientation and how an
agent should operate here; that one covers how the code itself is written.

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
docs/                     CONVENTIONS.md — code-level rules, see above
                          MIGRATIONS.md — drizzle migration workflow
                          features/<feature>/  FUNCTIONAL.md + DATABASE.md
                            per feature (templates in features/_templates/)
test/                     e2e tests (jest-e2e.json)
```

## Working in this repo (for agents)

- Mirror the closest existing feature module instead of introducing a new
  pattern. If a genuine deviation is needed, say so explicitly and why.
- `pnpm` only — don't run npm/yarn or touch `package-lock.json`/`yarn.lock`.
- Never run `npx`. In order of preference:
  1. If the command is already a `package.json` script (`lint`, `format`,
     `test`, `migrations:generate:main`, etc.), run it via `pnpm <script>` —
     e.g. `pnpm lint`, not `npx eslint --fix`.
  2. If it's a binary from a package already in `node_modules` but with no
     script for it (e.g. a one-off `tsc --noEmit`), use `pnpm exec <bin>` —
     e.g. `pnpm exec tsc --noEmit`. This runs the project's own installed
     binary; it doesn't fetch anything.
  3. Only when the package isn't installed at all, use `pnpm dlx` (or its
     `pnpx` shorthand) — and never bare `dlx tsc`/`pnpx tsc`: there's a
     same-named decoy package on the registry that isn't the TypeScript
     compiler. `tsc` specifically is always case 2 here (`typescript` is
     already a dependency) — never case 3.
- Dependency patches live in `patches/` (see `patches/nestjs-zod.patch`,
  wired up via `pnpm-workspace.yaml`'s `patchedDependencies`) — check there
  before assuming a library's shipped types/behavior when something looks
  off.
- When unsure whether a library behaves a certain way (drizzle, zod,
  better-auth, etc.), verify against the installed package or official docs
  rather than pattern-matching from something that merely looks similar —
  and ask if it's still unclear.
- **Read a feature's docs before implementing it.** Before writing or
  changing code for `features/<feature>/`, read that feature's
  `docs/features/<feature>/FUNCTIONAL.md` and `DATABASE.md` if they exist —
  they're the source of truth for business rules, lifecycle/status
  behavior, and scenarios the implementation must satisfy. Don't infer
  scope from the entity/table shape alone (e.g. a table with no
  service/controller yet, like `sale` before it had one, doesn't mean the
  feature has no documented rules to follow). If the docs don't exist yet,
  create them from the templates in `docs/features/_templates/` as part of
  the same change rather than skipping straight to code.
- **Keep `docs/features/<feature>/` in sync with the code.** Whenever a
  change adds, removes, or updates a database table/column/relationship, or
  changes a business rule (who can do what, when something is allowed,
  status/lifecycle behavior), update that feature's `DATABASE.md` and/or
  `FUNCTIONAL.md` in the same change — not as a follow-up. If the feature
  doesn't have these docs yet, create them from the templates in
  `docs/features/_templates/` rather than skipping documentation. Purely
  internal refactors with no schema or business-rule change don't need a
  doc update.
- **When a `TODO.md` item is done, move it to `TODO_DONE.md` — do not delete
  it outright.** Same rule on the frontend's `TODO.md`/`TODO_DONE.md`.
