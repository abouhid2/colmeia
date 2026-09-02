---
name: subagent-brief
description: Template for delegating a Colmeia feature to an agent working in its own git worktree. Use when spawning a subagent to build a feature or fix, so the brief carries setup, conventions, deliverables, verification and reporting rules. A subagent sees none of this conversation.
---

# Briefing a worktree agent

A subagent starts with no context. Everything it needs goes in the brief. Fill every section; an
omitted setup command produces an agent that runs the suite in the wrong directory and reports green.

Create the worktree yourself before briefing, so two agents never race on the same branch name.

## Template

```
## Setup

Work only in /Users/alexandrebouhid/Documents/colmeia-<slug>, on branch feat/<slug>.
Never touch the main checkout or any sibling colmeia-* directory; other agents are working there.

  cd /Users/alexandrebouhid/Documents/colmeia-<slug>/web && pnpm install --frozen-lockfile
  cd /Users/alexandrebouhid/Documents/colmeia-<slug>/api && bundle install && bin/rails db:prepare

Read /Users/alexandrebouhid/Documents/colmeia/CLAUDE.md first, then the rules it points to.

## The job

<What the family should be able to do afterwards, in two or three sentences, in product terms.
Not a list of files. The agent decides the files.>

## Conventions

- Code, comments and commits in English. Everything a person reads in the UI in pt-BR:
  read .claude/rules/copy.md before writing a single string.
- Design tokens only, from web/src/index.css. No raw hex, no arbitrary Tailwind values.
- Components presentational, logic in hooks or src/domain. See .claude/rules/frontend.md.
- Rails: scoped by current_household, services for verbs, no editing applied migrations.
  See .claude/rules/rails.md.
- Any product rule you change exists twice, in Ruby and in TypeScript. See .claude/rules/parity.md.
- Migrations in this branch use timestamps 2026MMDD*, and no other band. <pick a free band>

## Deliverables

- <the API change, if any>
- <the web change>
- <the tests, named: which spec files, which vitest files>
- Conventional commits on feat/<slug>. No AI attribution trailers, ever.
- Do not merge, do not push, do not open a PR.

## Verification

Run .claude/skills/verify-feature/SKILL.md end to end and report the real numbers.
Look at it in a browser at 390px and 1280px per .claude/skills/browser-check/SKILL.md.

## Working rules

- If a decision is a product decision (what a thing is called, whether a rule should exist),
  make the smallest reasonable choice, do it, and flag it in the report. Do not stop and wait.
- If something is blocked, finish everything else and say exactly what is blocked and why.
- Keep scratch files out of the repo. Nothing uncommitted at the end except what you meant to leave.

## Final report

  Branch:    feat/<slug>, <n> commits
  Built:     <what a person can now do>
  Suites:    rspec <n>/<failures> | vitest <n>/<failures> | tsc | build | lint
  Parity:    <rule, both sides, tests> or n/a
  Browser:   390px <observation> | 1280px <observation>
  Decisions: <product calls you made>
  Left out:  <what you did not do, and why>
  Files:     <absolute paths worth reading>
```

## After it reports

Verify, do not trust. See the delegation section of `.claude/rules/workflow.md`: rerun the suites
yourself in that worktree, read the diff, and check `git status --porcelain` for leftovers.
