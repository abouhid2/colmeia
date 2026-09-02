---
name: merge-branch
description: Routine for finishing a Colmeia feature branch: verify in the worktree, merge main in, merge to main, push, remove the worktree, migrate the local database, watch CI. Use only when the owner has explicitly asked to merge or publish.
---

# Merge a branch

**Gate.** Merging and pushing happen only when the owner asks. Verifying and merging `main` into the
branch are safe and can happen any time. Everything from step 4 needs an explicit go-ahead.

## 1. Verify in the worktree

```bash
cd ~/Documents/colmeia-<slug>
git status --porcelain      # must be empty; scratch files are not deliverables
git log --oneline main..HEAD
```

Run `.claude/skills/verify-feature/SKILL.md`. Green here, not from a report someone handed you.

## 2. Bring `main` in

```bash
git fetch origin
git merge main
```

Conflicts that repeat:

- `api/db/schema.rb`: take `main`'s version, then `cd api && bin/rails db:migrate` to regenerate.
  Never hand-merge the schema. If the branch's migration version is older than `main`'s latest, the
  migration will not run on a database that is already past it. Renumber it.
- `web/pnpm-lock.yaml`: take `main`'s version, then `pnpm install`, then commit the result.
- Never `git stash` in the middle of a merge, it swallows `MERGE_HEAD`.

## 3. Rerun both suites after the merge

A merge that compiles is not a merge that works. `bundle exec rspec` and `pnpm test` again.

## 4. Merge into `main` (needs the go-ahead)

```bash
cd ~/Documents/colmeia
git checkout main && git pull
git merge --ff-only feat/<slug>     # fast-forward, since step 2 rebased the history onto main
```

If it is not a fast-forward, `main` moved again. Go back to step 2.

## 5. Push and clean up

```bash
git push origin main
git worktree remove ../colmeia-<slug>
git branch -d feat/<slug>
bin/rails db:migrate                # in api/, so the main checkout's database catches up
```

`git worktree remove` refuses if the worktree is dirty. Do not force it, look at what is there first.

## 6. Watch CI

```bash
gh run list --limit 3
gh run watch
```

Two workflows fire on `main`: CI runs both suites, and the Pages deploy publishes `web/`. The deploy
copies `dist/index.html` to `dist/404.html` so deep links work on GitHub Pages. If a deep link 404s
after a deploy, that step is what to check.

CI is not the same environment as your machine: it installs from the frozen lockfile and loads the
schema with `db:schema:load` rather than seeding. A green local run can still fail there.

## 7. Report

Branch merged, commit on `main`, CI run result, deploy result, and anything left open.
