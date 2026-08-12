# CLI

`yarn meals` reads and writes the planner from a terminal, so the data can be managed without a
browser. It exists so an agent working in a clone of this repository, or anyone scripting against
it, has a supported entry point that validates writes and knows the stored path layout.

```bash
yarn meals --help
yarn meals plan move --help
```

## Setup

The CLI authenticates with a Firebase service account rather than a signed-in user. Generate one
in the Firebase console under **Project settings > Service accounts > Generate new private key**,
then make it findable:

1. `MEAL_PLANNER_SERVICE_ACCOUNT` pointing at the JSON file
2. `GOOGLE_APPLICATION_CREDENTIALS` pointing at the JSON file
3. `firebase-service-account.json` in the repository root

The database URL comes from `FIREBASE_DATABASE_URL`, falling back to the `databaseURL` key in the
`firebase-credentials.json` the web app already requires. Both JSON files are gitignored.

Paths resolve against the working directory, so run commands from the repository root.

A service account bypasses `database.rules.json` entirely. Those rules stay in place as the
authorization boundary for the browser app; the CLI's boundary is possession of the key.

## Output contract

Every command prints one JSON object on stdout:

```json
{ "ok": true, "data": ... }
{ "ok": false, "error": "..." }
```

Failures exit non-zero. Diagnostics from Firebase and elsewhere go to stderr, so stdout stays
parseable. Error messages name the next step, for example which command to run to find an id.

## Commands

### Recipes

| Command | Purpose |
| --- | --- |
| `recipe list [--type] [--search] [--tag]` | List recipes. `--search` matches title, details, ingredients and tags. |
| `recipe get <id>` | One recipe, including full instructions. |
| `recipe create --title --type [...]` | Add a recipe. Returns it with its generated id. |
| `recipe update <id> [...]` | Change the fields passed, leaving the rest alone. |
| `recipe delete <id>` | Remove a recipe and report the upcoming plans it orphaned. |

`--ingredients` and `--tags` take comma-separated values and replace the whole list.

### Plans

| Command | Purpose |
| --- | --- |
| `plan list --from --to [--type] [--for-who]` | Planned meals across a range, with recipe titles resolved. |
| `plan shopping-list --from --to [--for-who]` | What still has to be bought across a range. |
| `plan get <id> --date [--type]` | One planned meal. |
| `plan create --recipe --date --type [...]` | Schedule a recipe on a day. |
| `plan update <id> --date [--type] [...]` | Change recipe, `--for-who`, `--notes` or the shopping mark in place. |
| `plan move <id> --date [--type] [--to-date] [--to-type]` | Move it to another day or slot, keeping its id. |
| `plan delete <id> --date [--type]` | Remove it from the schedule. |

Rules worth knowing:

- Dates are strictly `YYYY-MM-DD`. Loose parsing would accept `8/11` or `next tuesday` and
  silently resolve the wrong day, which is unrecoverable once a meal is written to that path.
- `--date` is how a record is located, so it is required for every single-plan command.
- `--type` is optional everywhere it appears: without it the day's slots are scanned.
- `plan update` refuses `--to-date` and `--to-type`. Changing a day or a slot relocates the
  record, which is `plan move`'s job. See `docs/database.md`.
- `plan list` is capped at 62 days. It reads a whole month at a time, so a range costs a handful
  of round trips rather than one per day. `plan shopping-list` reads through it, so the cap and the
  round trips are the same.
- `--missing` replaces the whole list rather than appending, and implies `--needs-ingredients`
  unless `--no-needs-ingredients` is passed alongside it. See `docs/shopping-list.md`.

### Example

```bash
yarn meals recipe create --title "Chicken Curry" --type dinner \
  --ingredients "chicken,rice,curry paste" --tags "weeknight"

yarn meals recipe list --search curry

yarn meals plan create --recipe <recipeId> --date 2026-08-11 --type dinner \
  --for-who Anakin --notes "extra spicy"

yarn meals plan list --from 2026-08-10 --to 2026-08-16

yarn meals plan move <planId> --date 2026-08-11 --to-date 2026-08-14 --to-type lunch

yarn meals plan update <planId> --date 2026-08-11 --missing "curry paste,rice"

yarn meals plan shopping-list --from 2026-08-10 --to 2026-08-16
```

## Layout

```
cli/index.ts        Entry point: builds the commander program.
cli/commands/       Argument parsing and the JSON envelope, one file per noun.
cli/repository/     Firebase reads and writes, returning domain objects.
cli/firebase.ts     Admin SDK connection, resolved lazily so --help needs no credentials.
cli/options.ts      Shared parsing for dates, meal types and comma-separated lists.
```

The repository layer holds no argument parsing and the command layer holds no Firebase calls, so
the same operations can be exposed through another front end without rewriting them.

Writes validate against the yup schemas in `src/modules/*/validators.ts`, the same ones the web
app uses, so the two cannot disagree about what a valid record looks like.

## Development

```bash
yarn typecheck   # the CLI
yarn test        # vitest, covering the path layout and plan moves
```

Tests fake the Realtime Database in memory rather than stubbing calls, so they assert where
records actually land. That is what catches a move leaving a duplicate behind.
