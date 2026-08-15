<!--
Template — copy to docs/features/<feature>/FUNCTIONAL.md and fill in.
Audience: anyone (engineer, product, support) who needs the business rules
without reading code. No implementation details here (no table/column
names, no endpoint paths) — that's the DATABASE doc.
Delete these comment blocks once filled in.
-->

# [Feature name] — Functional

<!-- One or two sentences: what this feature is and why it exists. -->

## Concepts

<!--
Domain terms specific to this feature, one line each. Skip terms already
covered by another feature's doc — link to it instead of repeating.
-->

- **[Term]** — [definition]

## Business rules

<!--
The invariants and constraints that must hold, as a flat bullet list.
Phrase each as a rule, not a description ("X must be Y", not "X is
usually Y"). This is the section most likely to be read on its own —
keep it complete and self-contained.
-->

-

## Lifecycle

<!--
Only if the feature's main entity has a status/state machine. List the
states and what triggers each transition. A simple table or a short list
is usually enough; reach for a diagram only if the transitions aren't
linear.

| Status | Meaning | Triggered by |
| ------ | ------- | ------------- |
|        |         |               |
-->

## Scenarios

<!--
Given/When/Then acceptance criteria — the closest thing to an industry
standard for functional docs in software teams (maps directly to test
cases, unambiguous, no room for "usually"/"should" hand-waving). Cover
the happy path first, then the edge cases that aren't obvious from the
business rules above.
-->

- **[Scenario name]**
  - Given [starting state]
  - When [action]
  - Then [outcome]

## Out of scope

<!--
What this feature deliberately does NOT do (yet or ever) — prevents
readers from assuming something is supported when it isn't.
-->

-

## Open questions

<!-- Decisions not yet made. Remove this section once there are none. -->

-
