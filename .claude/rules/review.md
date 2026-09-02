# Adversarial self-review

Run this before handing work back, on your own diff, trying to break it. A finding is only real if you
can name the file, the line and the input that triggers it. Confidence beats volume: three proven bugs
are worth more than twelve suspicions.

Start from the diff, not from memory:

```bash
git diff main...HEAD --stat
git diff main...HEAD
```

## 1. Colmeia isolation

- [ ] Every new query starts from `current_household` on the API, or from the scoped state in the
      local store. No `Model.find` or `Model.where` without a household.
- [ ] Every new association to a scoped model uses `belongs_to_in_household`.
- [ ] A new endpoint has a case in `spec/requests/api/v1/household_scoping_spec.rb`: 401 with no
      header, 404 for an id from another colmeia.
- [ ] The local store keeps one state per invite code. Nothing new leaks across colmeias in
      `localStorage`, and nothing new is stored under a global key.
- [ ] New query keys go through `useScopedQuery`, so switching colmeia does not serve stale data.

## 2. Parity

- [ ] Every rule changed in Ruby changed in TypeScript, and both have a test with the same number.
- [ ] Any new points arithmetic rounds the same way on both sides. See `parity.md`.
- [ ] Every new validation exists on both sides with the same limit and the same message shape.
- [ ] New serializer fields exist in the local store too, spelled the same after case conversion.

## 3. Dates and time

- [ ] Nothing reads the clock without a seam. Services take `now:`, hooks use `useNow`.
- [ ] Specs freeze time with `travel_to`. No assertion compares against `Time.current`.
- [ ] Dates that mean a day are ISO date strings, not timestamps. `toIsoDate` and `fromIsoDate`.
- [ ] A date picker or an "is it overdue" comparison uses the start of the day, not the current
      instant, or today counts as overdue after the first second.
- [ ] `APP_TIME_ZONE` defaults to `America/Sao_Paulo`. A "today" computed in UTC is wrong for three
      hours every night. Check anything that buckets by day.
- [ ] Month arithmetic tested on the 31st.

## 4. Dialogs, forms and toasts

- [ ] The dialog unmounts its children when closed, so reopening starts clean. Do not cache form
      state outside it.
- [ ] Submitting twice does not create two records. The button disables while pending, and the
      handler guards. A test that clicks a disabled button proves nothing, assert the call count.
- [ ] Escape and the backdrop close it, and closing does not save.
- [ ] Every failure path shows something. A mutation that can fail without a toast is a silent failure.
- [ ] Success toast is short and past tense. Error toast says the way out. See `copy.md`.
- [ ] Errors are not swallowed: no empty `catch`, no `.catch(() => {})`, no `rescue` that returns nil.

## 5. Limits and bad input

- [ ] Every new text field has a maximum in `limits.ts` and the matching Rails validation.
- [ ] Empty string, whitespace only, the maximum, one past the maximum, and a very long paste.
- [ ] Numbers: zero, negative, non-integer, above the ceiling.
- [ ] Long strings do not break the layout at 390px. `overflow-wrap: anywhere` is global, but a
      `min-w-max` or a `whitespace-nowrap` in the diff defeats it.
- [ ] A member deleted mid-flow, a task already done, a completion already reviewed. The API answers
      404 or 409 and the UI says something a person understands.

## 6. Migrations and schema

- [ ] No existing migration edited.
- [ ] Timestamps inside this branch's band, and `schema.rb` has exactly the expected diff. A version
      number older than `main`'s is a red flag, not a detail.
- [ ] Indexes and foreign keys on every new reference, `household_id` on every scoped table.
- [ ] Defaults set in the migration are also set in the local store.

## 7. Dead ends

- [ ] Nothing added that nothing calls. Grep each new export.
- [ ] No commented-out code, no `console.log`, no `binding.pry`, no `TODO` without a name and a reason.
- [ ] No new dependency unless it removes more code than it adds.
- [ ] A fix has a surface: if the bug was that a value could not be edited, adding the field to the
      model is not enough, there has to be a control that edits it.

## Output format

Report as a work order, not an essay. For each finding:

```
[BLOCKER|MAJOR|MINOR] path/to/file.ts:42
What breaks: one sentence, with the input that triggers it.
Why: the mechanism, one or two sentences.
Fix: the concrete change.
```

Then a verdict line: `GO` or `NO-GO`, and if `NO-GO`, the blockers by number. A `GO` covers only the
code you actually read, so say which commit or diff it covers.
