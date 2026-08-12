# Meal Planner

A family meal planner: a browser-only Vite + React app talking directly to Firebase Realtime
Database, plus a Node CLI for reading and writing the same data without a browser.

One Firebase project holds one family's data. There is no per-user scoping and no backend server.

## Managing meals from the command line

Use `yarn meals` to read and write the planner. It is the supported way to change data outside
the web app: it validates every write against the same schemas the UI uses, and it knows the
stored path layout, which is easy to get wrong by hand.

```bash
yarn meals --help              # every command
yarn meals plan move --help    # options for one command
```

Every command prints `{"ok": true, "data": ...}` or `{"ok": false, "error": ...}` on stdout and
exits non-zero on failure. Errors say what to do next, so read them rather than guessing.

### Recipes: the meals the household knows how to make

```bash
yarn meals recipe list   [--type dinner] [--search chicken] [--tag quick]
yarn meals recipe get    <id>
yarn meals recipe create --title "Chicken Curry" --type dinner \
                         [--details ...] [--instructions ...] \
                         [--ingredients "chicken,rice"] [--tags "weeknight"] [--image <url>]
yarn meals recipe update <id> [--title ...] [--type ...] [--ingredients ...] [...]
yarn meals recipe delete <id>
```

`recipe update` changes only the fields you pass. `--ingredients` and `--tags` replace the whole
list rather than appending.

### Plans: a recipe scheduled into one slot on one day

```bash
yarn meals plan list   --from 2026-08-11 --to 2026-08-17 [--type dinner] [--for-who Alex]
yarn meals plan get    <id> --date 2026-08-11 [--type dinner]
yarn meals plan create --recipe <recipeId> --date 2026-08-11 --type dinner \
                       [--for-who Anakin] [--notes "extra spicy"]
yarn meals plan update <id> --date 2026-08-11 [--type dinner] \
                       [--recipe <recipeId>] [--for-who ...] [--notes ...]
yarn meals plan move   <id> --date 2026-08-11 [--type dinner] \
                       [--to-date 2026-08-14] [--to-type lunch]
yarn meals plan delete <id> --date 2026-08-11 [--type dinner]
```

Notes that matter:

- **Dates are strictly `YYYY-MM-DD`.** Nothing else parses. There is no "today" shorthand.
- **Feed `plannedOn` back into `--date`, never `date`.** Every plan comes back with both. `date`
  is the ISO timestamp the web app stores, and east of UTC its first ten characters spell the
  day *before* the one the meal is filed under. `plannedOn` is derived from the storage path and
  is always the right value to pass back.
- **`--date` locates the record**, so it is required for everything except `list` and `create`.
  `--type` only narrows the lookup and can be omitted; the day's slots are scanned instead.
- **Use `plan move` to change a day or a slot, never `plan update`.** A meal's date and type are
  part of its storage path, so changing them relocates the record. `plan update` rejects
  `--to-date` and `--to-type` for this reason.
- **`plan list` is capped at 62 days** and resolves recipe titles, so one call is usually enough.
- Meal types: `breakfast`, `lunch`, `dinner`, `snack`, `sides`, `restaurants`, `drinks`. The
  calendar only renders breakfast, lunch and dinner.
- Start from `recipe list` to get a real recipe id. `plan create` rejects an unknown one.

### Credentials

The CLI needs a Firebase service account, resolved in this order:

1. `MEAL_PLANNER_SERVICE_ACCOUNT`
2. `GOOGLE_APPLICATION_CREDENTIALS`
3. `firebase-service-account.json` in the repository root

The database URL comes from `FIREBASE_DATABASE_URL`, falling back to the `databaseURL` key in
`firebase-credentials.json`. Both files are gitignored. Run commands from the repository root,
since those paths resolve against the working directory.

## Data model

Defined in `src/types.ts`. A `Recipe` is a meal that can be cooked. A `PlannedMeal` points at a
recipe by id and pins it to a day and a slot. Ingredients and tags are plain strings, not
entities. Nothing enforces referential integrity: deleting a recipe leaves its planned meals
orphaned, which the calendar renders as "Recipe not found".

Storage layout, and the single most important detail in this repo:

```
recipes/<uuid>
meals/<YYYY>/<MonthName>/<DD>/<mealType>/<uuid>     e.g. meals/2026/August/11/dinner/<uuid>
```

The month is the **full English month name**, never a number, and the day is zero-padded. Every
reader and writer must agree, or writes land where the app never looks. `src/lib/paths.ts` is the
only place that format is defined; build paths with it rather than by hand, from both the browser
and the CLI. See `docs/database.md`.

## Layout

```
src/            Browser app. src/lib/ is shared with the CLI; everything else is React-only.
cli/            Node CLI. commands/ parses arguments, repository/ reads and writes Firebase.
docs/           Per-topic documentation. Keep it current.
```

`src/firebase.ts` cannot be imported from Node: it calls `getAnalytics()` at module load. The CLI
connects separately in `cli/firebase.ts` using the Admin SDK, which bypasses `database.rules.json`.
Those rules remain the authorization boundary for the browser app only.

## Conventions

- Yup for validation, in `src/modules/*/validators.ts`, shared by the app and the CLI.
- Four-space indent, no semicolons, named exports, grouped imports.
- `yarn typecheck` covers the CLI, `yarn test` runs vitest, `yarn dev` serves the app.
- `yarn typecheck:app` covers the browser app and currently reports pre-existing errors.
