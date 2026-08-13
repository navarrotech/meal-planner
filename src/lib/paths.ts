// Copyright © 2026 Navarrotech

import type { MealType } from '@/types'

/**
 * Only the ability to format a date is needed here, so that is all this module asks for.
 * Typing the parameter structurally also keeps it usable from the browser app, where
 * global.d.ts declares an empty `module 'moment'` that shadows moment's real typings.
 */
type FormattableDate = {
    format: (pattern: string) => string
}

// Recipes are a flat collection keyed by uuid.
export const recipesPath = 'recipes'

export function recipePath(recipeId: string) {
    return `${recipesPath}/${recipeId}`
}

// The household, also flat and keyed by uuid.
export const peoplePath = 'people'

export function personPath(personId: string) {
    return `${peoplePath}/${personId}`
}

/**
 * Planned meals are stored under a date-derived path rather than a flat collection, so the
 * calendar can subscribe to a single day or slot instead of the whole tree. The trade-off is
 * that a planned meal's date and type live in its path: changing either one relocates the
 * record, which is why moving a meal is a remove plus a set rather than an update in place.
 *
 * The month segment is the full English name ("August"), never a number, and the day is
 * zero-padded. Every reader and writer must agree on that exact format, or writes land at a
 * path the application never looks at. This module is the only place that format is defined.
 */
export function mealPlanPathParts(date: FormattableDate) {
    return {
        year: date.format('YYYY'),
        month: date.format('MMMM'),
        day: date.format('DD')
    } as const
}

export const mealsPath = 'meals'

export function mealMonthPath(year: string, month: string) {
    return `${mealsPath}/${year}/${month}`
}

export function mealDayPath(year: string, month: string, day: string) {
    return `${mealMonthPath(year, month)}/${day}`
}

export function mealSlotPath(year: string, month: string, day: string, type: MealType) {
    return `${mealDayPath(year, month, day)}/${type}`
}

export function mealPlanPath(year: string, month: string, day: string, type: MealType, planId: string) {
    return `${mealSlotPath(year, month, day, type)}/${planId}`
}
