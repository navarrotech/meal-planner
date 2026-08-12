// Copyright © 2026 Navarrotech

import type { PlannedMeal } from '@/types'

// Core
import { describe, expect, it } from 'vitest'

// Utility
import { buildShoppingList } from './shoppingList'

function plannedMeal(overrides: Partial<PlannedMeal>): PlannedMeal {
    return {
        id: 'plan-1',
        forWho: '',
        recipeId: 'recipe-curry',
        notes: '',
        needsIngredients: false,
        missingIngredients: [],
        type: 'dinner',
        date: '2026-08-11T00:00:00.000Z',
        ...overrides
    }
}

describe('buildShoppingList', () => {
    it('ignores meals that are not waiting on anything', () => {
        const list = buildShoppingList([
            plannedMeal({ missingIngredients: [ 'chicken' ] })
        ])

        expect(list.entries).toEqual([])
        expect(list.mealsWithNothingListed).toEqual([])
    })

    it('collects one entry per ingredient, with the meals waiting on it', () => {
        const monday = plannedMeal({ id: 'plan-1', needsIngredients: true, missingIngredients: [ 'rice' ] })
        const thursday = plannedMeal({ id: 'plan-2', needsIngredients: true, missingIngredients: [ 'rice', 'chicken' ] })

        const list = buildShoppingList([ monday, thursday ])

        expect(list.entries.map((entry) => entry.ingredient)).toEqual([ 'chicken', 'rice' ])
        expect(list.entries[1].meals.map((meal) => meal.id)).toEqual([ 'plan-1', 'plan-2' ])
    })

    it('treats differently cased spellings as one trip down one aisle', () => {
        const list = buildShoppingList([
            plannedMeal({ id: 'plan-1', needsIngredients: true, missingIngredients: [ 'Rice' ] }),
            plannedMeal({ id: 'plan-2', needsIngredients: true, missingIngredients: [ '  rice  ' ] })
        ])

        expect(list.entries).toHaveLength(1)
        // The first spelling seen is the one shown, rather than a lowercased key.
        expect(list.entries[0].ingredient).toBe('Rice')
        expect(list.entries[0].meals).toHaveLength(2)
    })

    it('reports a marked meal that never said what it needs', () => {
        const list = buildShoppingList([
            plannedMeal({ id: 'plan-1', needsIngredients: true }),
            plannedMeal({ id: 'plan-2', needsIngredients: true, missingIngredients: [ '   ' ] })
        ])

        expect(list.entries).toEqual([])
        expect(list.mealsWithNothingListed.map((meal) => meal.id)).toEqual([ 'plan-1', 'plan-2' ])
    })

    it('carries the caller\'s own meal shape through, so resolved titles survive', () => {
        const list = buildShoppingList([
            {
                ...plannedMeal({ needsIngredients: true, missingIngredients: [ 'rice' ] }),
                recipeTitle: 'Chicken Curry'
            }
        ])

        expect(list.entries[0].meals[0].recipeTitle).toBe('Chicken Curry')
    })
})
