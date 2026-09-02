---
name: browser-check
description: Routine for looking at Colmeia in a real browser with Chrome DevTools MCP. Use when verifying a UI change, taking screenshots at mobile and desktop widths, or debugging something the tests cannot see. Never touches the owner's own tabs.
---

# Browser check

Tests prove the numbers. Only the browser proves it looks right and the flow works.

## Never touch the owner's browsing

- Open your own page with `new_page`, work in it, and `close_page` when done.
- Never `select_page` onto a tab you did not open, never navigate an existing tab, never close one.
- If the only page listed is not yours, open a new one instead of reusing it.

## Start the app

The dev server may already be running in this worktree. Check before starting a second one, because
two Vite servers on the same tree collide.

```bash
cd web && pnpm dev      # http://localhost:5173
```

With no `VITE_API_URL` the app uses the in-browser store, which is enough for most UI work and
starts with the demo colmeia. For anything touching the HTTP client, run the API too
(`cd api && bin/rails server`) and set `VITE_API_URL=http://localhost:3000` in `web/.env`.

## The routine

1. `new_page` at `http://localhost:5173/`.
2. `resize_page` to **390 x 844**. This is the phone and the kitchen tablet, and it is the width that
   breaks first.
3. Get into the demo data: open `/entrar/demo`, or the landing page path a new person takes.
4. Walk the actual flow, not the page load. Open the dialog, fill the form, submit, read the toast,
   see the list update. Use `take_snapshot` to find elements by their accessible name; if an element
   has no name in the snapshot, that is an accessibility bug, report it.
5. `take_screenshot`.
6. `resize_page` to **1280 x 900** and repeat the same flow.
7. `list_console_messages`. Any error or React warning is a finding, including key warnings and
   act warnings.
8. `close_page`.

## What to look for at 390px

- Nothing overflows horizontally. Long member names, long task titles, long reward names.
- Dialogs reach the bottom of the screen and scroll inside themselves, not behind the keyboard.
- Touch targets are comfortable. Anything a child taps should be `lg`.
- The honeycomb and the leaderboard still read at that width.
- Text wraps instead of truncating, unless truncation is deliberate and has a title.

## What to look for at 1280px

- Content does not stretch into a single unreadable line. Measure stays comfortable.
- The sidebar and the content column line up on a consistent grid.
- Nothing that was a bottom sheet on mobile is still glued to the bottom.

## Reporting

Say what you saw, at which width, and paste the console errors. A screenshot without a sentence
saying what is right or wrong in it is not a report. If something looks off, name the element and
the token or class that causes it.
