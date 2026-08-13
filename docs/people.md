# People

A household does not eat the same thing, so a planned meal records who it is for. That used to be
a free text box. It is now a managed list, kept under **Settings, People**.

## Why a list

Free text meant "Jaime" and "jaime" were two different people, silently, and nothing could be
grouped, coloured or counted by person. A list makes the meal planner offer names instead of asking
for them, so the same person is spelled one way everywhere.

Groups are entries in the same list. `Family` and `Alex & Jaime` are people as far as the planner is
concerned: one meal is for one entry, and a combination that happens often enough to plan is worth
naming. Modelling groups as sets of people would mean rewriting every meal already planned to point
at ids, for a distinction the calendar never draws.

## A meal refers to a person by name

`PlannedMeal.forWho` holds the person's `name`, not their id.

Months of meals were written by hand before this list existed, and their names are the only record
of who they were for. Matching on the name keeps that history intact and readable. The cost is that
renaming a person leaves their past meals under the old name, where they keep their place but lose
their colour, and the same is true of removing someone. The settings page says so plainly.

The meal editor still offers a name that is no longer on the list, when the meal it is editing uses
one, so opening an old meal cannot silently reassign it.

## Colour

Every person gets a colour, handed out from `PERSON_COLORS` in order as people are added, so nobody
has to pick one and no two start alike. It shows as a stripe down the left edge of their meals.

A stripe rather than a background, because the background already says two other things: amber for
a meal waiting on the shopping, purple for eating out. Those are states of the meal; whose meal it
is sits beside them rather than competing.

## Storage

```
people/<uuid>    Person { id, name, color }
```

Guarded by the same rule as every other tree: any authenticated user, full read and write. Access
control is who is allowed to sign up.

Editing writes straight through, a colour when it is picked and a name when the field is left. A
settings page for one household does not need a dirty state and a save button between the user and
a two-field record.
