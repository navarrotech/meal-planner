// Copyright © 2026 Navarrotech

import type { MealType, PlannedMeal } from '@/types'

// Utility
import { MealTypesArray } from '@/modules/meals/validators'

/**
 * The Realtime Database omits a key rather than storing an empty string, an empty array or a
 * false-y default, so every record read back is a subset of its type. Both the browser app and
 * the CLI normalize through this module, so a field added to PlannedMeal gains its default in
 * one place instead of drifting between the two readers.
 */
export type StoredPlannedMeal = Partial<PlannedMeal>

export type StoredDay = Partial<Record<MealType, Record<string, StoredPlannedMeal>>>

/**
 * The id and type are passed separately because a record's own copy of them can be missing:
 * its position in the tree is the authority, and the stored fields are the convenience.
 */
export function toPlannedMeal(stored: StoredPlannedMeal, planId: string, type: MealType): PlannedMeal {
    return {
        id: stored.id || planId,
        forWho: stored.forWho || '',
        recipeId: stored.recipeId || '',
        notes: stored.notes || '',
        needsIngredients: stored.needsIngredients || false,
        missingIngredients: stored.missingIngredients || [],
        type: stored.type || type,
        date: stored.date || ''
    }
}

/**
 * A day node holds one child per meal type, each keyed by plan id. Every slot comes back, empty
 * ones included, so a caller can render a slot without first asking whether the day exists.
 */
export function readStoredDay(day: StoredDay | null): Record<MealType, PlannedMeal[]> {
    const mealsByType = {} as Record<MealType, PlannedMeal[]>

    for (const type of MealTypesArray) {
        mealsByType[type] = Object
            .entries(day?.[type] || {})
            .map(([ planId, stored ]) => toPlannedMeal(stored, planId, type))
    }

    return mealsByType
}
