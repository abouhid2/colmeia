# Rails: `api/`

Rails 8.1, API only, SQLite, RSpec, rubocop-rails-omakase. The API owns the truth. Anything the web
app computes is a copy that must agree (`parity.md`).

## Layout

```
app/controllers/api/v1/   thin, one action per endpoint, no business logic
app/models/               validations, scopes, small query and predicate methods
app/services/<Domain>/    one class per verb, when an action spans records
app/serializers/          plain modules with .call(record) returning a Hash
config/locales/pt-BR.yml  model and attribute names for error messages
```

## Household scoping is the security model

- Every scoped model includes `HouseholdScoped` and reaches records through
  `current_household.tasks`, never `Task.find`.
- Associations that cross records use `belongs_to_in_household`, which rejects an id from another
  colmeia at validation time. A new association to a scoped model needs it.
- A new scoped controller inherits `Api::V1::BaseController` and gets `require_household!` for free.
  If you write a controller that skips it, say why in a comment and add a spec that proves the hole
  is intentional.
- Every new scoped endpoint gets a case in `spec/requests/api/v1/household_scoping_spec.rb`.

## Controllers

- Thin. Load, delegate, render. If an action grows past ~10 lines, the logic belongs in a service.
- Strong params in a private `*_params` method.
- Never rescue in the action. `BaseController` maps `RecordNotFound`, `RecordInvalid`,
  `ParameterMissing` and `InvalidForeignKey` to the JSON error shape. Add a mapping there instead.
- Error shape is fixed: `{ error: "<code>", details: ["..."] }`. Do not invent a new shape.

## Services

- One class, one verb, namespaced by domain: `Tasks::Complete`, `Completions::Review`,
  `Households::Create`.
- `initialize` takes keyword arguments and stores them. `call` does the work and returns a value or a
  `Result = Struct.new(..., keyword_init: true)`.
- Inject the clock: `now: Time.current` as a keyword, never `Time.current` inline. Specs use
  `travel_to` and need a seam.
- Wrap multi-record writes in `ActiveRecord::Base.transaction`.
- Raise a domain error class defined on the service (`class AlreadyDone < StandardError; end`) and let
  the controller decide the status code.

## Models

- Enum-like columns are strings validated against a frozen constant array. No Rails `enum`.
- Limits are constants (`MAX_POINTS = 1000`) so the number appears once, and they mirror
  `web/src/domain/limits.ts`.
- Comment the *why* of a rule that is not obvious, in English, above the method. See `next_due_on`.

## Migrations

- Never edit a migration already reflected in `db/schema.rb`. Add a new one.
- Keep every migration in a branch inside one timestamp band so parallel branches do not collide.
- Add a foreign key and an index for every new reference, and `household_id` for every scoped table.
- After merging `main`, resolve `schema.rb` by taking `main`'s copy and rerunning `bin/rails db:migrate`.
- A new validated column needs its label in `config/locales/pt-BR.yml`, or errors show the raw column.

## Specs

- Request specs are the main coverage. Use `headers_for(household)` from `spec/support/api_helpers.rb`
  so the invite code travels with the request.
- Every scoped endpoint gets three cases at minimum: works with the right code, `401` without the
  header, `404` for an id belonging to another colmeia.
- Service specs cover the branches the request spec cannot reach cheaply: rounding, boundaries, the
  domain errors.
- Freeze time with `travel_to` for anything that reads the clock. Never assert on `Time.current`.
- No factory gem. Build records with `create_household` and `household.tasks.create!(...)`.
- Assert on parsed JSON through `json_body`, on the specific field, not on the whole body.

## Before handing back

```bash
cd api
bundle exec rubocop        # -a to autocorrect
bundle exec brakeman -q --no-pager
bundle exec rspec
```

CI loads the schema with `bin/rails db:schema:load` rather than `db:prepare`, because seeds would
leave rows behind and the specs expect an empty database. Do not "fix" that step.
