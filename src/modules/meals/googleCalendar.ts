// Copyright © 2026 Navarrotech

// Typescript
import type { MealType, PlannedMeal, Recipe } from "@/types";

// Utility
import moment from "moment";

/**
 * A planned meal knows its day but not its hour, and a calendar event needs one. These are the
 * hours a household actually sits down at, rather than a single default that would be wrong for
 * two slots out of three. Google Calendar opens its own editor with these prefilled, so a night
 * that runs late is corrected there rather than configured here.
 */
const SLOT_TIMES = {
    breakfast: { hour: 8, durationMinutes: 45 },
    lunch: { hour: 12, durationMinutes: 45 },
    dinner: { hour: 18, durationMinutes: 90 },
    snack: { hour: 15, durationMinutes: 30 },
    sides: { hour: 18, durationMinutes: 90 },
    restaurants: { hour: 18, durationMinutes: 120 },
    drinks: { hour: 20, durationMinutes: 60 }
} as const satisfies Record<MealType, { hour: number, durationMinutes: number }>

// Google reads a stamp without a trailing Z in the calendar's own timezone, which is what a
// dinner at six means: six where the family is, not six in UTC.
const GOOGLE_STAMP_FORMAT = "YYYYMMDD[T]HHmmss"

/**
 * Builds the link that opens Google Calendar's event editor with this meal filled in. Nothing is
 * created by following it: the user still presses save over there, which is why an unsaved edit
 * in the modal can be exported without the planner having to agree to it first.
 */
export function googleCalendarEventUrl(meal: PlannedMeal, recipe?: Recipe): string {
    const slot = SLOT_TIMES[meal.type]
    const start = moment(meal.date).startOf("day").hour(slot.hour)
    const end = start.clone().add(slot.durationMinutes, "minutes")

    const dish = recipe?.title?.trim()
    const slotName = meal.type.slice(0, 1).toUpperCase() + meal.type.slice(1)

    const details = [
        meal.forWho && `For ${meal.forWho}`,
        meal.notes,
        recipe?.details,
        meal.needsIngredients && (
            meal.missingIngredients.length
                ? `Still to buy: ${meal.missingIngredients.join(", ")}`
                : "Still needs ingredients"
        )
    ]
        .filter(Boolean)
        .join("\n\n")

    const parameters = new URLSearchParams({
        action: "TEMPLATE",
        text: dish ? `${slotName}: ${dish}` : slotName,
        dates: `${start.format(GOOGLE_STAMP_FORMAT)}/${end.format(GOOGLE_STAMP_FORMAT)}`
    })

    if (details) {
        parameters.set("details", details)
    }

    return `https://calendar.google.com/calendar/render?${parameters.toString()}`
}
