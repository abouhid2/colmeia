---
name: verify-feature
description: The full verification routine to run before calling any Colmeia change done. Use when finishing a feature or fix, before reporting back, or when asked to check that a branch is ready. Runs both suites, typecheck, build, and the review checklist.
---

# Verify a feature

Run every step. Report the real result of each one, including failures. A step you skipped is a step
you report as skipped, never as passed.

Work from the worktree that holds the change. `pwd` first.

## 1. API

```bash
cd api
bundle exec rubocop
bundle exec brakeman -q --no-pager
bundle exec rspec
```

If specs fail on a missing table, the worktree's database was never prepared: `bin/rails db:prepare`.
If they fail on a schema mismatch after merging `main`: `bin/rails db:migrate`.

## 2. Web

```bash
cd web
pnpm test
pnpm typecheck
pnpm build
pnpm lint
```

- Typecheck must be clean before the build, since the build runs `tsc -b` first anyway.
- `pnpm lint` can exhaust memory when several worktrees are busy. That is the machine, not the diff.
  Retry with nothing else running. If it still dies, compare against `main` before blaming the change,
  and say in the report that lint did not complete.
- A vitest summary that looks green with a non-zero exit code means the exit code is right.
  Check `echo $?`.

## 3. Parity

If the change touched points, ratings, recurrence, multipliers, limits or serialized fields:

```bash
# name the rule, then prove both sides moved
git diff main...HEAD --stat -- api/app web/src/domain web/src/api
```

Both sides changed and both have a test with the same expected number. See `.claude/rules/parity.md`.

## 4. Browser

Follow `.claude/skills/browser-check/SKILL.md`. Screenshot at 390px and 1280px. Exercise the actual
path a person takes, not just the page load: open the dialog, submit the form, see the toast.

## 5. Adversarial pass

Walk `.claude/rules/review.md` against your own diff. Isolation, parity, dates, dialogs, limits,
migrations, dead ends.

## 6. Report

```
Suites:    rspec <n> examples, 0 failures | vitest <n> tests, 0 failed
Static:    rubocop clean | brakeman clean | tsc clean | build ok | lint <ok|not run, reason>
Parity:    <rule changed on both sides, tests naming the same number> or n/a
Browser:   390px <what you saw> | 1280px <what you saw>
Review:    <blockers found and fixed, or none>
Left out:  <anything not done, and why>
```

Nothing is "done" until every line above is filled with something you actually observed.
