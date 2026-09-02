# Colmeia

Household chores turned into points, and points turned into one reward the whole family shares.
The house is the hive: every finished task fills a cell of the honeycomb, and a full honeycomb pays out.

## Stack

| Where  | What                                                                        |
| ------ | --------------------------------------------------------------------------- |
| `api/` | Rails 8.1, API only, SQLite, RSpec, rubocop-rails-omakase, brakeman          |
| `web/` | React 19, TypeScript 6, Vite 8, Tailwind 4, TanStack Query 5, react-router 8 |
| CI     | `.github/workflows/ci.yml` runs both suites; `deploy-pages.yml` ships `web/` |

The web app runs in two modes, picked by `VITE_API_URL`: empty means the in-browser store
(`web/src/api/localApi.ts`, what GitHub Pages serves), set means the Rails API over HTTP.

## Golden rules

**Language.** Code, comments, commit messages and file names in English. Everything a person reads in
the UI is Brazilian Portuguese, warm and human. See `.claude/rules/copy.md`.

**The rules live twice, on purpose.** Points, ratings, recurrence, multipliers and validation limits
exist in Ruby (`api/app/`) and again in TypeScript (`web/src/domain/`, `web/src/api/localApi.ts`).
Change one side, change the other, and cover both with tests. See `.claude/rules/parity.md`.

**Scoping is the security model.** Every scoped request carries `X-Household-Code`. No code means 401,
an id from another colmeia means 404. Never add an endpoint or a query that escapes `current_household`.

**Design tokens only.** Colors, radius and shadows come from the `@theme` block in `web/src/index.css`.
Never write a raw hex, an arbitrary value like `text-[13px]`, or a color outside the palette.

**TypeScript is `erasableSyntaxOnly`.** No enums, no parameter properties, no namespaces. Use `const`
objects with `as const` and union types.

**No setState in effects.** Derive during render or handle it in an event. Effects are for
subscriptions and imperative DOM only.

**Components are presentational.** Business logic goes in a hook (`web/src/hooks/`) or a pure module
(`web/src/domain/`, `web/src/lib/`). Keep components under ~100 lines and files under ~200.

**Never edit an applied migration.** Add a new one. Migrations already in `api/db/schema.rb` are history.

**Conventional commits, no AI attribution.** `<type>(<scope>): <description>`, scope is `api`, `web`,
`ci` or `docs`. Never add `Co-Authored-By`, `Generated with`, or any trailer naming an AI tool.

**Never push, commit or open a PR unless asked.** Same for `db:migrate` on a database you did not create.

## Commands

```bash
# api
cd api && bundle install && bin/rails db:prepare   # first run; db:seed adds the demo colmeia
bin/rails server                                   # http://localhost:3000
bundle exec rspec                                  # full suite
bundle exec rspec spec/services/tasks/complete_spec.rb
bundle exec rubocop -a && bundle exec brakeman -q --no-pager

# web
cd web && pnpm install --frozen-lockfile
pnpm dev                                           # http://localhost:5173
pnpm test                                          # vitest run
pnpm test src/domain/points.test.ts
pnpm typecheck                                     # tsc -b
pnpm build                                         # tsc -b && vite build
pnpm lint                                          # oxlint; see the caveat below
```

`pnpm lint` can run the machine out of memory when several worktrees are busy at once. That is the
machine, not the diff. Retry with nothing else running before you blame your own change, and say so
in the report if it still fails.

## Before you say it is done

1. `cd api && bundle exec rspec` green, and `bundle exec rubocop` clean.
2. `cd web && pnpm test` green.
3. `cd web && pnpm typecheck` clean, then `pnpm build`.
4. If the change touches business rules, the twin rule on the other side changed too and has a test.
5. Look at it in a browser at 390px and 1280px. Screenshots or it did not happen.
6. Re-read the Portuguese strings you added out loud. See `.claude/rules/copy.md`.

Full routine and commands: `.claude/skills/verify-feature/SKILL.md`.

## Worktree workflow

One feature, one worktree, branched from `main`:

```bash
git worktree add ../colmeia-<slug> -b feat/<slug> main
cd ../colmeia-<slug>/web && pnpm install --frozen-lockfile
cd ../api && bundle install && bin/rails db:prepare
```

Each worktree needs its own `node_modules` and its own SQLite database. Symlinking `node_modules`
breaks the install. Before finishing, merge `main` into the branch and rerun both suites.

**Migration timestamps.** Parallel branches collide in `schema.rb`. Pick a date band nobody else is
using (the existing files run `20260901*` to `20260903*`) and keep every migration in the branch
inside it. If `schema.rb` conflicts on merge, take `main`'s version and rerun `bin/rails db:migrate`.

## More detail

`.claude/rules/` holds the long form: `frontend.md`, `rails.md`, `parity.md`, `review.md`,
`workflow.md`, `copy.md`. `.claude/skills/` holds the repeatable routines. Both are local only and not
committed, so nothing here may depend on them existing for someone else.
