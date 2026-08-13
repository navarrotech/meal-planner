# Database

Firebase Realtime Database holds everything. One Firebase project serves one family: there is no
per-user or per-household scoping anywhere in the data, and `database.rules.json` grants any
authenticated user full read and write access to both trees. Access control is who you let sign
up, as described in the README.

## Trees

```
recipes/<recipeId>                                   Recipe
people/<personId>                                    Person
meals/<YYYY>/<MonthName>/<DD>/<mealType>/<planId>    PlannedMeal
```

Ids are client-generated uuid v4. Uniqueness comes from key position in the tree; there are no
indexes, unique constraints, or `.indexOn` rules.

### The meal path format

A planned meal is stored under a path derived from its date:

```
meals/2026/August/11/dinner/3f2c1e8a-...
```

- **Year** is `YYYY`.
- **Month** is the full English month name from `moment().format("MMMM")`, never a number.
- **Day** is zero-padded `DD`.
- **Meal type** is one of `breakfast`, `lunch`, `dinner`, `snack`, `sides`, `restaurants`,
  `drinks`.

This shape exists so the calendar can subscribe to a single day or slot rather than the whole
tree. Two consequences follow, and both are load-bearing:

1. **A meal's date and type live in its path.** Changing either relocates the record, so moving a
   meal is a write to the new path followed by a delete of the old one. A plain update at the new
   path leaves a duplicate behind at the old one. `movePlan` in `cli/repository/plans.ts` does
   this correctly and is covered by tests.
2. **Reads are keyed by date.** Finding a meal requires knowing its day, which is why the CLI
   requires `--date` on every command that targets a single plan.

`src/lib/paths.ts` is the only definition of this layout. Both the browser app and the CLI build
paths through it, so the format cannot drift between them. `src/lib/paths.test.ts` asserts the
exact strings, since a "cleaner" format would be a breaking change against data that already
exists in Firebase.

## Shapes

Both types are declared in `src/types.ts`.

`Recipe` carries `id`, `image` (a Cloud Storage download URL), `title`, `details`,
`instructions`, `type`, `ingredients`, `tags` and `timesPlanned`. Ingredients and tags are arrays
of plain strings, not entities. `timesPlanned` is a running total maintained by both the app and
the CLI; see `docs/data.md`.

`Person` carries `id`, `name` and `color`. A planned meal refers to a person by name rather than by
id, which is load-bearing: see `docs/people.md`.

`PlannedMeal` carries `id`, `recipeId`, `forWho`, `notes`, `needsIngredients`,
`missingIngredients`, `type` and `date` (an ISO string). `forWho` exists because a household does
not always eat the same thing: several planned meals can occupy one slot on one day, one per person.

`needsIngredients` and `missingIngredients` mark a meal as waiting on a trip to the store and name
what it is waiting on. They sit on the planned meal rather than on the recipe because what is
missing depends on the week's cupboard, not on the dish. See `docs/shopping-list.md`.

The link from `PlannedMeal.recipeId` to a recipe is a soft reference. Nothing enforces it, so
deleting a recipe orphans its planned meals, which the calendar renders as "Recipe not found".
`yarn meals recipe delete` reports the upcoming plans it orphaned rather than cascading.

## Reading records back

The Realtime Database does not store empty strings, empty arrays or `false`-y defaults; it omits
the key. A record read back is therefore a subset of its type.

`src/lib/meals.ts` normalizes a stored planned meal back to the full shape, and both the browser
app and the CLI read through it, so a field added to `PlannedMeal` gains its default in one place.
Recipes are normalized in `cli/repository/recipes.ts`.

## Validation

`src/modules/meals/validators.ts` and `src/modules/recipes/validators.ts` hold yup schemas shared
by the app and the CLI. The browser app calls `.isValid()` only to enable a save button and never
validates on write, so the CLI, which validates before every write, is currently the stricter of
the two paths.
