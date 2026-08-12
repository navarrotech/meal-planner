// Copyright © 2026 Navarrotech

import type { PlannedMeal } from '@/types'

/**
 * One line per thing to buy, and the meals waiting on it. The meal type is generic so a caller
 * that already resolved recipe titles keeps them: the browser modal and the CLI both want to
 * say which meal an ingredient is for, and neither should have to look the meal up again.
 */
export type ShoppingListEntry<Meal extends PlannedMeal> = {
    ingredient: string
    meals: Meal[]
}

export type ShoppingList<Meal extends PlannedMeal> = {
    entries: ShoppingListEntry<Meal>[]

    // Marked as needing something, but without saying what. Reporting these rather than dropping
    // them is the difference between a short list and a wrong one.
    mealsWithNothingListed: Meal[]
}

export function buildShoppingList<Meal extends PlannedMeal>(meals: Meal[]): ShoppingList<Meal> {
    const entriesByName = new Map<string, ShoppingListEntry<Meal>>()
    const mealsWithNothingListed: Meal[] = []

    for (const meal of meals) {
        if (!meal.needsIngredients) {
            continue
        }

        const ingredients = meal.missingIngredients.map((ingredient) => ingredient.trim()).filter(Boolean)

        if (!ingredients.length) {
            mealsWithNothingListed.push(meal)
            continue
        }

        for (const ingredient of ingredients) {
            // "Rice" on Monday and "rice" on Thursday are one trip down one aisle, so the entries
            // are keyed case-insensitively while the first spelling seen is the one displayed.
            const existing = entriesByName.get(ingredient.toLowerCase())

            if (existing) {
                existing.meals.push(meal)
                continue
            }

            entriesByName.set(ingredient.toLowerCase(), {
                ingredient,
                meals: [ meal ]
            })
        }
    }

    return {
        // Alphabetical, because a shopping list is read while walking a store, not while
        // reading a calendar. The meals under each entry stay in the order they were given.
        entries: [ ...entriesByName.values() ].sort(
            (left, right) => left.ingredient.localeCompare(right.ingredient)
        ),
        mealsWithNothingListed
    }
}
