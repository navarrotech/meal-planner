# Shopping list

A planned meal can be marked as waiting on a trip to the store, along with what still has to be
bought for it. The calendar warns about those meals on sight, and the marked meals across the days
on screen add up to one shopping list.

## The mark lives on the planned meal, not the recipe

`PlannedMeal` carries two fields:

```
needsIngredients: boolean
missingIngredients: string[]
```

A recipe's `ingredients` is what the dish is made of, which never changes. What is *missing* depends
on what is in the cupboard on a given week, so it belongs to the scheduled meal. The same recipe can
be ready to cook on Tuesday and short two items on Friday.

The two fields are separate on purpose. The boolean is the warning, and the list is the detail: a
meal can be marked before anyone has worked out what it needs, and unticking the mark leaves the
list intact so re-ticking it does not mean retyping.

Ticking the mark on a meal whose list is empty seeds it from the recipe's own ingredients, because
crossing off what is already in the kitchen is shorter work than typing what is not. Naming an
ingredient sets the mark, so a list can never exist that nothing ever warns about.

## On the calendar

`/dashboard/meals` renders a marked meal in the warning colour with a slow glow and a cart icon,
and its `title` names what is still to buy. The glow stops for anyone whose system asks for reduced
motion; the colour and the icon carry the same information without it.

The header holds a **Shopping list** button, badged with how many meals on screen are waiting. It
opens one alphabetical list of ingredients, each with the meals that need it, followed by any meal
that is marked without saying what it needs. Reporting those separately is the difference between a
short list and a wrong one.

The list covers every slot stored for those days, including `snack`, `sides`, `restaurants` and
`drinks`, which the calendar itself cannot draw. A snack scheduled from the CLI still needs buying.

## Where the data comes from

`src/modules/meals/Layout.tsx` subscribes to the whole range on screen through
`useMealPlansInRange`, one listener per day, and hands each dropzone its slot. Before this the
dropzones each subscribed to their own slot, which would have left the shopping list reading the
tree a second time. One subscription means the calendar and the list can never disagree about which
meals exist.

Navigating to another week drops the previous range's days from state rather than merging over
them, so the list never quietly includes a week the user has left.

## From the command line

```bash
yarn meals plan create --recipe <id> --date 2026-08-14 --type dinner --missing "chicken,rice"
yarn meals plan update <id> --date 2026-08-14 --missing "chicken"
yarn meals plan update <id> --date 2026-08-14 --no-needs-ingredients
yarn meals plan shopping-list --from 2026-08-10 --to 2026-08-16
```

`--missing` replaces the whole list, the way `recipe --ingredients` does, and implies
`--needs-ingredients` unless `--no-needs-ingredients` is passed in the same command.

`plan shopping-list` returns the same structure the modal renders, meals included, so a caller can
say which meal an ingredient is for without a second lookup.

## Shared code

`src/lib/shoppingList.ts` builds the list and `src/lib/meals.ts` normalizes stored records, both
shared by the app and the CLI. Ingredients are grouped case-insensitively, so "Rice" on Monday and
"rice" on Thursday are one line, displayed with the first spelling seen. Both modules are covered by
unit tests next to them.
