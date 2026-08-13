# Data

Everything under **Settings, Data**: getting a copy out, and keeping the recipe usage counts honest.

## Backup

**Export a backup** downloads every recipe, planned meal and person as one JSON file, named for the
day it was taken and stamped with `exportedAt` and a count of what it holds.

There is nothing else. One Firebase project holds years of recipes, no snapshots are taken, and the
rules let any signed-in user delete the tree. An exported file is the only copy that survives a
mistake, so it is worth taking one before anything unusual and keeping it somewhere else.

The export runs entirely in the browser: three reads, a Blob, an object URL. Each tree is read
separately rather than reading the root, because the rules grant access per tree and a read at the
root is denied outright.

Backups are **not** committed. `/backups` is gitignored, and this repository is public.

Restoring is deliberately not a button. Writing a whole tree back is the one action here that can
destroy more than it fixes, and it should be done deliberately, against a file someone has looked
at, not from a page that also has a delete button on it.

## Usage counts

Every recipe carries `timesPlanned`. Planning a meal adds one, unplanning takes one away, and
swapping a meal's recipe moves the count between them. The web app and the CLI both maintain it,
using an atomic increment so two devices planning at once cannot lose a count. A recipe that no
longer exists is skipped rather than conjured out of an increment.

It exists so the recipe list can lead with what the household actually cooks. Alphabetical order
buries the weekly cereal under everything tried once, and counting the calendar on every render to
fix that would read the whole tree to sort a sidebar.

**Recount from the calendar** walks every planned meal, tallies them by recipe and corrects the
totals, reporting how many it changed. It is for history that predates the count, and for a total
that has drifted. It writes the difference rather than the total, so a meal planned elsewhere while
it runs is not thrown away.

Nothing recounts on its own: it reads the entire calendar, which is a button's job, not a page load's.
