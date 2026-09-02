# Frontend: `web/`

React 19, TypeScript 6, Vite 8, Tailwind 4, TanStack Query 5, react-router 8, vitest. The look is
warm paper and honey, generous radius, soft shadow, no chrome. Aim at the quality bar of Linear or
Stripe: clean hierarchy, calm surfaces, coherent spacing, nothing decorative without a job.

## The design system is `web/src/index.css`

The `@theme` block is the whole palette. Tailwind's default colors are wiped with `--color-*: initial`,
so `bg-blue-500` does not exist. If a class you want is not in the theme, you are inventing a token.

| Token family                                       | Use for                                          |
| -------------------------------------------------- | ------------------------------------------------ |
| `paper`, `surface`, `line`, `line-strong`           | page ground, cards, borders                      |
| `ink`, `ink-soft`, `ink-faint`                      | primary text, secondary text, hints              |
| `honey-100..900`                                    | brand, points, the primary action                |
| `pollen`, `berry`, `leaf`, `lake`, `plum`, `dune`   | member colors and semantic accents, `100/500/700` |
| `rounded-card`, `shadow-card`, `shadow-pop`         | card shape and elevation                         |
| `font-display` (headings), `font-sans` (body)       | type                                             |
| `animate-cell-pop`, `animate-rise`                  | the two sanctioned entrances                     |

Hard rules:

- No raw hex, `rgb()`, or arbitrary values (`text-[13px]`, `bg-[#fff]`, `p-[7px]`) in components.
  Spacing uses the Tailwind scale. If you need a new token, add it to `@theme` and say why.
- Semantic accents carry meaning: `berry` is destructive or overdue, `leaf` is done or positive,
  `honey` is points and the primary action. Do not use them decoratively.
- Member colors come from `src/domain/memberColors.ts`. Never hardcode one.

## Restraint

Before you finish a screen, remove one thing. A badge that repeats what the title says, a border
around something that already has a background, an icon next to a label that needs no icon, a shadow
on a card that already sits on a border. Hierarchy comes from size, weight and space, not from adding
color. If two elements compete for the eye, one of them is wrong.

## Gate for a new pattern

Colmeia has an established grammar: cards on paper, honey for points and the primary action, native
dialogs, `EmptyState` for absence, `Segmented` for a small choice, chips for filters. Before adding a
new layout pattern, component family, overlay style or motion, all four must be true:

1. No existing pattern in `src/components/ui/` solves it.
2. It fits the tokens already in `@theme`, or the token it needs is a real gap.
3. It makes something clearer, not merely different.
4. It will be reused, or it replaces the thing it duplicates.

If the gate says no, the answer is the existing pattern, even if it is less exciting. Say in the
report which precedent you used.

## Component standards

- **Presentational only.** A component renders props and calls handlers. Data fetching, mutations,
  derived state and branching business rules live in a hook (`src/hooks/`) or a pure module
  (`src/domain/`, `src/lib/`).
- **Size caps.** Component under ~100 lines, file under ~200, hook under ~80, function under ~20.
  Past that, split: a form becomes `TaskForm` plus `useTaskForm`, dialogs become `TaskDialogs` plus
  `useTaskDialogs`. That pattern already exists, follow it.
- **Composition over props.** A `variant` union of four is fine. A boolean that changes layout means
  you want two components.
- **Class names through `cn`** from `src/lib/cn.ts` (clsx plus tailwind-merge), so a caller's
  `className` overrides the base. Variant maps are `Record<Variant, string>` constants above the
  component, never inline ternaries in JSX.
- **No `any`.** No enums, no parameter properties, no namespaces: `erasableSyntaxOnly` forbids them.
  Use `as const` objects and union types. `import type` for types, `verbatimModuleSyntax` is on.
- **Double quotes only** in TypeScript, TSX and JSON. Never `'`, not even inside a JSX attribute.
- **Respect `prefers-reduced-motion`.** Every transition or animation goes behind Tailwind's
  `motion-safe:` variant (or a `@media (prefers-reduced-motion: no-preference)` block in CSS), so a
  person who turned motion off lands on the end state at once.
- **No setState in an effect.** Derive during render, or set state in the event handler. Effects are
  for subscriptions, timers and imperative DOM. `Dialog` uses `useLayoutEffect` for `showModal`
  because a paint would flash. That is the exception, and it is commented.
- Reuse `src/components/ui/` primitives: `Button`, `Card`, `Dialog`, `Field`, `Input`, `EmptyState`,
  `Badge`, `Segmented`, `Toggle`, `StarRating`. Build a new one only after checking there is no fit.

## Data

- Reads go through `useScopedQuery`, which appends the invite code to the query key so switching
  colmeia never shows the previous one's cache. Never call `useQuery` directly for scoped data.
- Writes go through `useAppMutation`, which owns cache invalidation and the error toast. Declare the
  keys it invalidates; add the success toast in its `onSuccess`.
- Query keys live in `src/hooks/queryKeys.ts` and `src/api/keys.ts`. Add there, never inline.
- Components import from `src/api/index.ts`, never from `httpApi.ts` or `localApi.ts` directly. Both
  implement `ColmeiaApi` and the mode is picked once by `VITE_API_URL`.

## Mobile first and accessibility

- The kitchen tablet is the real device. Design at 390px, then let it breathe at 1280px.
  Check both before finishing.
- Touch targets at least 44px tall. `Button` size `md` is `h-10`, use `lg` for anything a child taps.
- Every icon-only control needs a label: use `IconButton` with `label`, or `aria-label`.
  Decorative icons get `aria-hidden`.
- Focus is visible everywhere, from the `:focus-visible` rule in `index.css`. Never remove an outline.
- Dialogs use the native `<dialog>` through `src/components/ui/Dialog.tsx`. Focus trap, Escape and
  the backdrop come free. Do not build a custom modal.
- Every animation pairs with `motion-reduce:animate-none`.
- Text wraps: `overflow-wrap: anywhere` is global. Do not add `min-w-max` to a container that holds
  user text, it defeats the wrap and overflows on a phone.

## Tests

- `vitest run`. Domain modules get unit tests, they are pure and cheap. Test the numbers.
- Component tests use `@testing-library/react`. Query by role and accessible name, which also proves
  the labels exist.
- A test that clicks a `disabled` button proves the attribute, not the guard. Assert the effect.
- A collapsed disclosure needs to be opened before you assert something is not in it, otherwise the
  assertion passes for the wrong reason.
