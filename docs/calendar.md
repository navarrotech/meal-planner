# Calendar

`/dashboard/meals` is the planner itself: a week of days, each split into breakfast, lunch and
dinner, with recipes dragged into the slots. On a phone it draws one day rather than seven, decided
by window width at render time.

## Moving through time

The header's arrows step one screenful: a week on a desktop, a day on a phone. **Left and right
arrow keys do the same thing**, so a month of planning does not have to be done with the mouse. The
arrow buttons name their shortcut in a tooltip, since a keyboard shortcut nobody knows about is not
a feature. **Today** returns to the current week from wherever the arrows have wandered.

`goToAdjacentPeriod` in `src/modules/meals/Layout.tsx` is the single definition of that step, shared
by both, so the two can never disagree about how far a press moves.

The key handler stays quiet in two cases, both of which would otherwise steal a keypress that meant
something else:

- **A field has focus.** Inside an input, a textarea, a select or anything `contentEditable`, an
  arrow moves the caret. Typing in the recipe search must not shuffle the weeks behind it.
- **A dialog is open.** Editing a meal, adding to a slot, or reading the shopping list holds the
  keyboard, and the calendar behind the dialog stays where it was left.

Arrows held with ctrl, meta, alt or shift are left alone as well, since those are the browser's.

## How a meal is coloured

A planned meal is grey. Two things change that, and both are meant to be read without reading the
meal:

- **Purple: eating out.** The colour comes from the *recipe's* type, not the slot, so a restaurant
  stands out wherever it was dropped. Burger King in a lunch slot is still eating out.
- **Amber, glowing: waiting on the store.** See `docs/shopping-list.md`.

Whose meal it is shows as a coloured stripe down the left edge instead, so it can be read at the
same time as either of those. See `docs/people.md`.

Amber is declared after purple so it wins when both apply: waiting on the shopping outranks where
the meal is eaten.

`styleByRecipeType` in `src/modules/meals/components/Dropzone.tsx` is the map. Only the kinds worth
spotting at a glance appear in it; everything else is cooked at home and stays neutral, which is
what makes the exceptions readable. Adding a colour for `drinks` or `snack` is one line there and
one rule in `calendar.module.sass`.

## What the days are drawn from

The whole span, not just the week, comes from one subscription in the layout. See
`docs/shopping-list.md`, which covers why it reaches two months past the screen and how a meal
waiting on a trip to the store is drawn.
