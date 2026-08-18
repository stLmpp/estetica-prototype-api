Generate a git commit message for the staged changes, using Conventional Commits format.

Steps:
1. Run `git add .` to stage all changes.
2. Run `git status` and `git diff --cached` to see exactly what's staged.
3. Determine the commit type (feat, fix, refactor, chore, docs, test, etc.) and an optional scope from the actual files touched.
4. Write a subject line: `type(scope): summary`, under ~70 characters, imperative mood, no trailing period.
5. Write the body as bullet points, weighted roughly:
   - 80% WHY — the motivating problem, bug, or decision behind the change. Ground this in real context (prior conversation, linked issue, a bug just diagnosed) — never invent a rationale that isn't evidenced.
   - 20% WHAT — a brief listing of the mechanical changes, for scanning purposes.
   - Exception: if the staged diff is predominantly new/added code rather than modifications to existing behavior, the "why" carries less weight — skip the justification and lead with a concise, what-focused summary instead.
6. If the staged changes span clearly unrelated concerns (e.g. an unrelated dependency bump alongside a feature), say so and suggest splitting into separate commits rather than forcing one artificial message. Present the proposed split and wait for confirmation before running anything, even if `execute` was passed — splitting into multiple commits is a bigger decision than running the one obvious commit and deserves a check-in.
7. If invoked with an `execute` or `--execute` argument, and step 6 didn't call for a split: run `git commit` with the generated message immediately, no further confirmation needed. Otherwise, output the message only and stop — don't run `git commit`.
