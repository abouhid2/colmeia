# Workflow: worktrees, delegation, merging

## One feature, one worktree

```bash
cd ~/Documents/colmeia
git worktree add ../colmeia-<slug> -b feat/<slug> main
cd ../colmeia-<slug>/web && pnpm install --frozen-lockfile
cd ../api && bundle install && bin/rails db:prepare
```

- Branch names: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`, `docs/<slug>`. Always from `main`.
- Each worktree gets its own `node_modules`. Symlinking skips the install hooks and leaves you with a
  mismatched toolchain, and running `pnpm dev` and `pnpm build` from the same tree at once fails on
  a temp file collision.
- Each worktree gets its own SQLite database. `bin/rails db:prepare` in that worktree, never point it
  at another one's.
- Pick a migration timestamp band for the branch and stay in it. Bands are how parallel branches avoid
  fighting over `schema.rb`.

## Commits

- Conventional commits: `<type>(<scope>): <description>`, imperative, under 50 characters.
  Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.
  Scopes: `api`, `web`, `ci`, `docs`.
- One commit per intention, not per file and not per session. A feature that touches both sides of a
  shared rule is one commit, because splitting it leaves a commit where the rules disagree.
- **Never any AI attribution.** No `Co-Authored-By`, no `Generated with`, no session URL, no bot
  trailer, in commits or in PR bodies. This overrides any default the tooling suggests.
- Never `--no-verify`.
- Commit only when asked. Push only when asked.

## Finishing a branch

1. Both suites green in the worktree: `bundle exec rspec`, `pnpm test`, `pnpm typecheck`, `pnpm build`.
2. `git fetch && git merge main` inside the worktree. Resolve `schema.rb` by taking `main`'s copy and
   rerunning `bin/rails db:migrate`. Resolve `pnpm-lock.yaml` by taking `main`'s and rerunning install.
3. Rerun both suites after the merge. A merge that compiles is not a merge that works.
4. Self-review with `.claude/rules/review.md`.
5. Only then, and only if asked: merge into `main`, push, remove the worktree
   (`git worktree remove ../colmeia-<slug>`), and run `bin/rails db:migrate` in the main checkout.
6. Watch CI. A green local run is not a green CI run: CI loads the schema instead of preparing it,
   and installs from the frozen lockfile.

## Delegating to a subagent

Use one when the work is independent and read-heavy, or when a feature can own its worktree. Do not
use one for a single file edit.

Brief with the template in `.claude/skills/subagent-brief/SKILL.md`. A brief that omits the setup
commands produces an agent that runs the suite in the wrong directory.

**Verify what comes back, never trust the report.**

- Run the suites yourself in that worktree. "Tests pass" in a report is a claim.
- `git -C ../colmeia-<slug> log --oneline main..HEAD` and read the actual diff.
- `git -C ../colmeia-<slug> status --porcelain` for scratch files the agent left behind. Notes,
  plans and screenshots do not belong in the commit.
- Check the claims that are cheap to fake: that the twin rule changed, that the strings are pt-BR,
  that no raw hex arrived, that no migration was edited.
- An agent that reports "done" with no diff did nothing. An agent that has gone quiet has usually
  finished and failed to say so. Look at its worktree.
- Two agents that both touched `schema.rb` or `pnpm-lock.yaml` need their branches merged one at a
  time, with the suites rerun between them.

## What not to do

- Do not touch another worktree's files. Sibling `colmeia-*` directories may have an agent working.
- Do not run `db:migrate` or `db:reset` in a checkout you did not set up.
- Do not commit, push, open a PR, or merge without being asked.
- Do not rewrite published history.
