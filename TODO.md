# TODO

Things noticed in passing that aren't worth stopping the current task for.
Pull from this list when there's no specific task in flight. Finished items
move to `TODO_DONE.md` instead of being deleted outright.

- [ ] `email` sending isn't set up yet, so two better-auth flags in
      `src/core/auth/auth.ts` are `false` as a placeholder:
      `requireEmailVerificationOnInvitation` (organization plugin config)
      and `requireEmailVerification` (`emailAndPassword` config). Figure out
      the email-sending story (provider, templates) and flip both once it
      exists — right now anyone can sign up or accept an org invitation
      without proving they own the address.
- [ ] `src/app.module.ts`'s `ThrottlerModule.forRootAsync` throttler config
      doesn't set a custom key/tracker — improve it (currently whatever
      `@nestjs/throttler`'s default tracker resolves to, presumably raw
      client IP) once it's clear what should actually key the rate limit
      here (e.g. per-tenant, per-route).
- [ ] `src/core/filter/all-exception.filter.ts` hardcodes the Postgres error
      code `'42704'` as a raw string literal (used to detect
      `coreExceptions.databaseSessionNotSet` — see **Repositories** →
      `@MainTransactional()` in `docs/CONVENTIONS.md`). Extract it into a
      named enum/constant instead, for readability and so future error-code
      checks elsewhere don't repeat the same magic string.

## CI/CD dependencies

Items that need actual CI/CD infrastructure to exist before they can be
finished — parked here instead of the main list until that's set up.

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
- [ ] Figure out the unit test strategy and wire it into CI. Per **Testing**
      in `docs/CONVENTIONS.md`, there are no unit tests in `src` yet — jest
      config (`rootDir: src`, `*.spec.ts`) and the `pnpm test`/`test:watch`/
      `test:cov` scripts already exist, just unused. Needs a decision on:
      what's actually worth unit-testing here (service business logic is the
      obvious candidate — repositories are mostly thin query wrappers,
      controllers are thin pass-throughs per convention), whether to require
      coverage on new features going forward vs. backfilling existing ones,
      and where `pnpm test`/`pnpm test:e2e` fit in the CI pipeline once one
      exists.
