# Parity: the rules live twice

Colmeia ships two implementations of the same product rules. The Rails API is the real one. The
in-browser store is what GitHub Pages serves, and it has to reject and compute exactly what the API
would. A rule that drifts is a bug the tests will not catch unless you write the twin test.

## The twin map

| Rule                        | Ruby                                          | TypeScript                                     |
| --------------------------- | --------------------------------------------- | ---------------------------------------------- |
| Points from a rating        | `app/services/completions/review.rb`          | `src/domain/points.ts`                         |
| Multiplier per member kind  | `app/models/member.rb` (`award`)              | `src/domain/memberKinds.ts`, `points.ts`       |
| Recurrence, next due date   | `app/models/task.rb` (`next_due_on`)          | `src/domain/recurrence.ts`                     |
| Validation ceilings         | model `validates ... length/numericality`     | `src/domain/limits.ts`                         |
| Allowed enum values         | model constants (`PRIORITIES`, `RECURRENCES`) | `src/domain/types.ts`, `priorities.ts`         |
| Who may review a completion | `app/services/completions/review.rb`          | `src/api/localApi.ts`                          |
| Household scoping           | `app/models/concerns/household_scoped.rb`     | `src/api/localApi.ts` (one state per colmeia)  |
| Error shape                 | `app/controllers/api/v1/base_controller.rb`   | `src/api/errors.ts` (`ApiError`)               |

Serialized field names are the other half of the contract. Ruby serializers emit snake_case, the
HTTP client converts, and the local store must produce the same camelCase objects the components read.

## Checklist for any change to a shared rule

- [ ] Named the rule and found both sides in the map above. If it is not in the map, add the row.
- [ ] Changed the Ruby side and the TypeScript side in the same commit.
- [ ] Rounding matches. Ruby and JavaScript disagree on floats: `10 * 1.15` is `11.5` in Ruby and
      `11.499999999999998` in JavaScript. `points.ts` fixes this with `.toFixed(6)` before rounding.
      Any new multiplication of points needs the same treatment and a test on the value that broke.
- [ ] Validation rejects the same input on both sides, with the same status code. The local store
      throws `ApiError(422, details)` where the API renders `422` with `details`.
- [ ] Test on both sides, with the same case and the same expected number:
      `api/spec/...` plus `web/src/domain/*.test.ts` or `web/src/api/localApi.test.ts`.
- [ ] Boundary values covered: zero, the maximum from `limits.ts`, one past the maximum, and `null`.
- [ ] Ran both suites, not just the one you touched last.

## Traps that have already bitten

- Adding a field to a Rails serializer without adding it to the local store leaves the demo silently
  missing data, and nothing fails. Grep the field name across `web/src/` before you finish.
- Adding a validation only in Rails means the demo accepts input the real app rejects. Users find it.
- A `default` in a migration is not a default in the local store. Set it in both places.
- Date arithmetic: Rails uses `Date` and `>> 1` for months, the web uses `date-fns` `addMonths`.
  They agree on month ends, but only because both clamp. Test the 31st.
