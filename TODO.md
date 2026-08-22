# TODO

Things noticed in passing that aren't worth stopping the current task for.
Pull from this list when there's no specific task in flight. Finished items
move to `TODO_DONE.md` instead of being deleted outright.

Each item has a stable ID (`BE-N`) for easy reference — keep the ID when an
item moves to `TODO_DONE.md`, and give any new item the next unused number
(highest across both files, plus one).

- [ ] **BE-2** `email` sending isn't set up yet, so two better-auth flags in
      `src/core/auth/auth.ts` are `false` as a placeholder:
      `requireEmailVerificationOnInvitation` (organization plugin config)
      and `requireEmailVerification` (`emailAndPassword` config). Figure out
      the email-sending story (provider, templates) and flip both once it
      exists — right now anyone can sign up or accept an org invitation
      without proving they own the address.
- [ ] **BE-3** `src/app.module.ts`'s `ThrottlerModule.forRootAsync` throttler config
      doesn't set a custom key/tracker — improve it (currently whatever
      `@nestjs/throttler`'s default tracker resolves to, presumably raw
      client IP) once it's clear what should actually key the rate limit
      here (e.g. per-tenant, per-route).
- [ ] **BE-4** Audit existing exception status codes against the new HTTP status
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

      **Note (2026-08-21):** this needs more discussion before starting —
      not doing this refactor yet.

- [ ] **BE-8** `customer_followup`/`followup_item` (see BE-7 in
      `TODO_DONE.md` and `docs/features/customer-followup/`) needs
      before/after photo support — an employee
      should be able to attach and later view photos per follow-up. Photos
      shouldn't live in Postgres or on the API's own disk; needs an
      external object storage bucket (S3-compatible — AWS S3, Cloudflare
      R2, etc., not decided; there's no deployment story yet either, see
      the CI/CD section below), with only the object key stored in the DB
      (a new `followup_photo` table: `followupId`, `key`, maybe a
      `type: BEFORE | AFTER`) and short-lived presigned URLs for
      upload/read rather than a public bucket — these are sensitive
      medical/aesthetic photos. Worth building as one shared storage
      abstraction (a `StorageModule`/`StorageService`, tenant-prefixed
      object keys like everything else) rather than a one-off, since the
      receipt-PDF TODO below needs the same underlying piece (persisting a
      generated file outside the API). Needs a real design pass (which
      provider, key structure, upload flow) before building — paired with
      a frontend TODO of the same name once the API side exists.
- [ ] **BE-9** Sale receipts (PDF) don't exist yet — no generation, no storage, no
      endpoint. Suggested shape based on what's already been discussed:
      its own feature module (`src/features/receipt/`) depending on
      `SaleReadModule` (per **Cross-feature access** in
      `docs/CONVENTIONS.md`) rather than folding into
      `sale.service.ts` (already flagged above as overloaded). Needs to be
      idempotent but produce a stateful artifact (a PDF file) — one way to
      get both: key the generated file off `(saleId, a hash/version of the
      sale's finalized state)`; a repeat request for the same inputs
      returns the already-generated file (from the storage bucket in the
      TODO above) instead of regenerating. PDF generation approach (HTML
      template + headless render vs. a PDF-building library) and the
      actual receipt content/layout aren't decided yet. Only makes sense
      once a sale is in a state receipts apply to (paid/completed) —
      confirm against the `SaleStatus`/transaction model before designing
      further.
- [ ] **BE-10** `customer_anamnesis` has no change-history/audit trail beyond the
      plain `lastUpdatedBy`/`updatedAt` every table gets from `baseEntity`
      — those only show the *last* edit, not a full history of what
      changed. (Locking a record after signing is already handled — see
      the `status`/`finalize` design in `docs/features/customer-anamnesis/
      FUNCTIONAL.md` — this item is specifically about a full field-level
      audit log, worth it once these records are treated as real
      medical/legal documentation rather than internal notes.)
- [ ] **BE-12** No conditional/branching logic between anamnesis fields (e.g. "only
      show field B when field A = yes") — every active field in a form's
      section is always shown. Would need a `dependsOnFieldId`/
      `dependsOnValue` concept on `anamnesis_field` if this becomes a real
      requirement — not built speculatively ahead of one.
- [ ] **BE-13** The EAV-style `customer_anamnesis_field.value` (`varchar(2048)`)
      trades queryability for flexibility — filtering/reporting across
      customers by answer (e.g. "list everyone allergic to X") means
      parsing strings at the app layer, not a SQL `WHERE`. Fine for
      rendering a form back, not for analytics. Revisit (e.g. a
      materialized/indexed view) only if a real reporting need shows up.

- [ ] **BE-14** No statistics/aggregation endpoints exist yet — every current `GET`
      route returns entity rows (paginated or flat), nothing pre-aggregated
      (counts, sums, time-series). Needed for the frontend's home-page
      dashboard TODO (`estetica-prototype-fe`'s `TODO.md`, same date) —
      widgets like today's appointment count, revenue over time, or
      customer counts need dedicated endpoints (e.g. a `dashboard` or
      `statistics` feature) rather than the frontend fetching full entity
      lists and aggregating client-side. Start with whatever hardcoded set
      of widgets the frontend TODO settles on, add the endpoints those
      specific widgets need.

- [ ] **BE-15** No platform-admin / cross-tenant capability exists yet — every query
      goes through RLS policies keyed on `current_setting('tenant.id')`
      (set per-request, see `main-entities.ts`'s `using`/`withCheck` and
      `MainTransactional()` in `database/main/main-database-connection.ts`),
      so today there's no way to query or administer across organizations
      at all. Once there's an actual need (managing orgs, cross-tenant
      reporting, support tooling), this needs deliberate design, not just
      "skip RLS": likely a separate platform-admin auth path (its own role/
      guard, not just an org member with elevated permissions) and
      explicit escape hatches for the tenant-scoped queries it's allowed to
      run (e.g. a raw connection/role that bypasses the RLS policy, used
      only by that path) — everything else in the app should keep going
      through the tenant-scoped connection as-is. Don't build this
      speculatively; start once a concrete platform-admin endpoint is
      actually needed.

- [ ] **BE-28** ESLint config (`eslint.config.mjs`) only has a handful of custom
      rules on top of `@eslint/js` recommended + `typescript-eslint`
      recommended-type-checked — no stricter code-style/consistency rules
      (import ordering, naming conventions, member ordering, complexity
      limits, etc.) beyond what's inherited. Decide and adopt a stricter
      rule set once there's time to do it deliberately — exact scope TBD.
      Paired with the frontend TODO of the same name
      (`estetica-prototype-fe`'s `TODO.md`, FE-23) — worth deciding once
      for rules that are language-agnostic (e.g. import ordering) and
      applying consistently to both repos, though each stack (NestJS vs
      Angular) will also need some rules of its own.

- [ ] **BE-29** No protection against duplicate mutating requests (double-submit,
      accidental client retry, a flaky connection resending the same
      `POST`/`PATCH`/`DELETE` a moment later) — every request is processed
      independently, so the exact same create/update can be executed twice.
      `ThrottlerModule.forRootAsync` (`app.module.ts`, backed by Redis via
      `RedisThrottlerStorage`) caps *volume* per key/window (see BE-3, key
      still undecided) — that's a different concern from detecting the
      *exact same* request repeated within a short window and short-
      circuiting the second one. No interceptor/guard for this exists yet
      (`src/core/interceptor/` currently has `logging`, `timeout`, and the
      zod serializer only); the existing `Redis` client
      (`src/core/redis/`, already used for the throttler's storage and
      better-auth's secondary storage) is the natural place to hold a
      short-TTL lock/fingerprint. Two directions, needs a decision:
      - **Client-supplied idempotency key** — caller sends an
        `Idempotency-Key` header (or similar) generated once per logical
        action; the server stores `(tenantId, userId, key) -> response`
        for a short TTL and replays the stored response instead of
        re-executing on a repeat. Requires frontend cooperation — pair
        with the frontend TODO of the same name
        (`estetica-prototype-fe`'s `TODO.md`) if this direction is chosen.
      - **Server-side fingerprint** — hash `(tenantId, userId, method,
        path, body)` and reject/short-circuit an identical request seen
        again within a short window (low hundreds of ms to a couple of
        seconds), no client changes needed. Risks false positives on
        legitimately-repeated actions (e.g. deliberately creating two
        identical catalog items back to back) unless the window is kept
        tight and scoped carefully.
      Needs deciding which routes this applies to (every mutating route by
      default vs. opt-in per-route via a decorator) and the exact window
      length before building either direction.

- [ ] **BE-30** `CustomerFollowup` has no status (pending/done) and no
      reminder/notification mechanism — `date` is just the date the note
      was written, not a due date. Revisit once there's a concrete need;
      see `docs/features/customer-followup/FUNCTIONAL.md`'s "Out of
      scope" section.
- [ ] **BE-31** Offer to create a `CustomerFollowup` immediately after an
      appointment or a sale is marked completed, rather than only
      supporting creation from the customer-followup tab directly.
      Likely frontend-led (a prompt/shortcut in the appointment/sale
      completion flow that pre-fills `appointmentId`/`saleId`) — no
      backend change expected beyond what this feature already builds,
      but confirm once the frontend side is designed. Paired with a
      frontend TODO of the same name (`estetica-prototype-fe`'s
      `TODO.md`).
- [ ] **BE-32** `GET /v1/customer-followup`'s list rows have no items/total —
      only the detail endpoint (`GET /v1/customer-followup/:id`) returns
      `items`. The frontend's follow-up list can't show an item count/total
      per row without an N+1 fetch (see `FE-26` in
      `estetica-prototype-fe`'s `TODO.md`). Revisit whether a cheap
      items-count/total is worth adding to the list row if this becomes a
      real usability gap in practice; low priority.

## CI/CD dependencies

Items that need actual CI/CD infrastructure to exist before they can be
finished — parked here instead of the main list until that's set up.

- [ ] **BE-16** Wire `madge` up as an actual project check (`pnpm` script, and ideally
      a CI step), scoped to all of `src` — `madge --circular --extensions ts
      src/app.module.ts`. Confirmed via `pnpm dlx madge` that `src` is clean
      right now (exit code 0); the one blocker
      (`core/auth/auth.ts` ↔ `core/auth/extra-auth-end-points.plugin.ts`) is
      fixed — that file was a test and got deleted. Needs graphviz's `dot`
      installed for `--image` output, but not for the plain `--circular`
      check used here. See **Module structure: split into a `Read` module
      and the full module** in `docs/CONVENTIONS.md` for the pattern this is
      meant to guard.
- [ ] **BE-17** Custom colors per organization (branding). No backend support yet —
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

- [ ] **BE-18** Figure out the unit test strategy and wire it into CI. Per **Testing**
      in `docs/CONVENTIONS.md`, there are no unit tests in `src` yet — jest
      config (`rootDir: src`, `*.spec.ts`) and the `pnpm test`/`test:watch`/
      `test:cov` scripts already exist, just unused. Needs a decision on:
      what's actually worth unit-testing here (service business logic is the
      obvious candidate — repositories are mostly thin query wrappers,
      controllers are thin pass-throughs per convention), whether to require
      coverage on new features going forward vs. backfilling existing ones,
      and where `pnpm test`/`pnpm test:e2e` fit in the CI pipeline once one
      exists.
