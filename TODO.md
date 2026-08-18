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
- [ ] Audit existing exception status codes against the new HTTP status
      code convention in `docs/CONVENTIONS.md` (**Exceptions**) — most
      exceptions predate that rule and weren't written with it in mind.
      Two known categories of likely violations, not yet fixed:
      - **404 used where it should be 422.** The rule reserves `404` for
        the resource a route's own URL identifies; a reference to some
        other entity that doesn't exist (an id from the request body, or
        one feature's service calling another's `require()`/
        `requireMany()`) should be `422`. Nearly every cross-feature
        `require()` call in the app currently throws that feature's
        `xNotFound` exception at `404` regardless of context — e.g.
        `AppointmentService.create` validating `dto.employeeId`/
        `dto.customerId`/`dto.catalogItemId`, or `SaleService.create`
        validating `dto.appointmentId` — because the exact same
        `require()`/exception is also used by that feature's own `GET
        /:id` route, where `404` is correct. Fixing this needs the
        `exception()`/`ExceptionFactory` (`src/core/exception/
        exception.ts`) to support an optional per-call status override, so
        cross-feature reference checks can ask for `422` while the owning
        route's own lookup keeps the default `404` — a global find/replace
        won't work since the two call sites throw the same exception today.
      - **409 that's arguably 422.** Some existing `409`s look like
        business-rule violations (state precondition, quota) rather than
        a resource-state conflict, per the rule's distinction — e.g.
        `SaleExceptions.saleAppointmentNotCompleted`,
        `CustomerExceptions.customerLimitExceeded`,
        `AppointmentExceptions.appointmentOutsideWorkingHours`. Needs a
        deliberate pass through every `*-exceptions.ts` file to decide
        each one case by case, not a blanket reclassification.
      Related, smaller gap noticed while grepping every `status:` in the
      codebase for this audit: `src/core/openapi/generate-open-api.ts`'s
      `errorStatus` list (used to document possible error responses per
      route in Swagger) has `400/401/403/404/409/422/429/500` but is
      missing `408` — `coreExceptions.requestTimeout` can genuinely fire,
      so the generated OpenAPI spec is silently incomplete. Add it once
      the status-code audit above is done, so the Swagger list matches
      whatever the final set of codes in active use turns out to be.

- [ ] `src/features/sale/sale.service.ts` (467 lines) has accumulated too
      much business logic in one place — most of it end-point-specific
      rules rather than shared logic. Consider splitting into per-endpoint
      "UseCase" services (one class per operation: create, addTransaction,
      refund, etc.), with `SaleService`/`SaleController` delegating to them,
      instead of one large service handling every route's rules.
- [ ] `src/database/main/main-entities.ts` (602 lines) defines every table
      across every domain in one file — split it into one file per domain
      (person/employee/customer, catalog-item, appointment, sale, config,
      etc.) inside `src/database/main/`. Two things to sort out before
      doing this: (1) `docs/CONVENTIONS.md`'s **Database schema (drizzle
      entities)** section says flatly "all tables are defined in
      `main-entities.ts`" — update that doc to describe the new layout;
      (2) cross-domain relations in `main-relations.ts` (e.g. sale →
      appointment → employee) could introduce circular imports between the
      new per-domain files — run the `madge --circular` check (see the
      CI/CD item below) after splitting. Keep a barrel `main-entities.ts`
      re-exporting everything so existing imports elsewhere don't need to
      change.

- [ ] `customer_anamnesis` has no change-history/audit trail beyond the
      plain `lastUpdatedBy`/`updatedAt` every table gets from `baseEntity`
      — those only show the *last* edit, not a full history of what
      changed. (Locking a record after signing is already handled — see
      the `status`/`finalize` design in `docs/features/customer-anamnesis/
      FUNCTIONAL.md` — this item is specifically about a full field-level
      audit log, worth it once these records are treated as real
      medical/legal documentation rather than internal notes.)
- [ ] `AnamnesisFieldValidationType`'s `MIN_VALUE`/`MAX_VALUE` compare
      `Number(value)`, so they're only meaningful on `NUMBER` fields —
      `DATE` fields currently have no range validation at all (see the
      field-type/validation-type compatibility table in
      `docs/features/anamnesis-field/FUNCTIONAL.md`). A date range needs
      its own validation types instead of reusing the numeric ones — e.g.
      `MIN_DATE`/`MAX_DATE` with a `{ date: string }` arg compared against
      the answer parsed as a date, not a number. Possibly other date-
      specific validations worth having too (e.g. "must be in the past").
      Add once there's a real need for date-range questions (birth date
      bounds, "date of last procedure must be within N days", etc.).
- [ ] No conditional/branching logic between anamnesis fields (e.g. "only
      show field B when field A = yes") — every active field in a form's
      section is always shown. Would need a `dependsOnFieldId`/
      `dependsOnValue` concept on `anamnesis_field` if this becomes a real
      requirement — not built speculatively ahead of one.
- [ ] The EAV-style `customer_anamnesis_field.value` (`varchar(2048)`)
      trades queryability for flexibility — filtering/reporting across
      customers by answer (e.g. "list everyone allergic to X") means
      parsing strings at the app layer, not a SQL `WHERE`. Fine for
      rendering a form back, not for analytics. Revisit (e.g. a
      materialized/indexed view) only if a real reporting need shows up.

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
- [ ] Custom colors per organization (branding). No backend support yet —
      `workingHours`/`customerLimit`/`membershipLimit` are the existing
      precedent for org-level settings, declared as `additionalFields` on
      the organization plugin config in `src/core/auth/auth.ts` and read
      via `core/auth/organization.service.ts` (see `updateWorkingHours`).
      A color field (or a small set — primary/accent) would follow the
      same shape: new `additionalFields` entry, a corresponding
      `OrganizationService.updateX` method, exposed to the frontend
      through `activeOrganization` on the session like `customerLimit`
      already is. Needs a decision on scope (one primary color vs. a
      small palette) and validation (hex format) before implementing.

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
