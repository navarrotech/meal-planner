# Google Calendar

A planned meal can be handed to Google Calendar in one click. The edit modal carries a calendar
icon that opens Google's own event editor in a new tab, prefilled from the meal. It is icon-only,
so it names itself through a tooltip and an `aria-label` rather than leaving the icon to be guessed.

## Nothing is created, and nothing is stored

The action is a link to `calendar.google.com/calendar/render?action=TEMPLATE&...`, not an API call.
Google opens its editor with the fields filled in and the user presses save there. That has three
consequences worth keeping:

- **No OAuth, no tokens, no Google API dependency.** The app never asks for calendar access, which
  suits a planner that has no backend to hold a credential.
- **Nothing links the two afterwards.** Editing a meal here does not update an event created over
  there, and deleting one does not delete the other. The export is a copy, not a sync.
- **Unsaved edits export fine.** The link is built from what is on screen, so retyping the notes and
  exporting without pressing Update sends the retyped notes. Google's editor is the confirmation
  step, so there is nothing to guard against.

It renders as a real anchor rather than a button, so it behaves like any other link: middle-click,
open in a background tab, copy the address. `Modal` grows an optional `href` on an action for this.

## What is sent

| Field | Value |
| --- | --- |
| Title | `Dinner: Chicken Curry`, or just `Dinner` if the recipe was deleted out from under the meal |
| Dates | The meal's day at the hour its slot is eaten at, for that slot's length |
| Description | Who it is for, the meal's notes, the recipe's details, and anything still to buy |

The description is left off entirely when there is nothing to say, rather than sent empty.

## Slot times

A planned meal knows its day but not its hour, and an event needs one. `SLOT_TIMES` in
`src/modules/meals/googleCalendar.ts` gives each slot the hour a household actually sits down at:

```
breakfast  08:00, 45m      snack        15:00, 30m
lunch      12:00, 45m      restaurants  18:00, 2h
dinner     18:00, 90m      drinks       20:00, 1h
sides      18:00, 90m
```

These are a starting point, not a configuration surface. Google's editor is already open on the
next screen, so a night that runs late is corrected there in the same motion as saving it.

Timestamps are sent without a trailing `Z`. Google reads a stamp without one in the calendar's own
timezone, which is what "dinner at six" means: six where the family is, not six in UTC.
