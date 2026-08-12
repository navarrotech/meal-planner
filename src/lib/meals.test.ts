// Copyright © 2026 Navarrotech

// Core
import { describe, expect, it } from 'vitest'

// Utility
import { readStoredDay, toPlannedMeal } from './meals'

/**
 * The Realtime Database omits keys rather than storing empty or false-y values, so what comes
 * back is always a subset of the record that was written. These assertions pin the defaults,
 * because a missing one surfaces as `undefined.length` in the calendar rather than as a type error.
 */

describe('toPlannedMeal', () => {
    it('fills in every field the database omitted', () => {
        const meal = toPlannedMeal({ recipeId: 'recipe-curry' }, 'plan-1', 'dinner')

        expect(meal).toEqual({
            id: 'plan-1',
            forWho: '',
            recipeId: 'recipe-curry',
            notes: '',
            needsIngredients: false,
            missingIngredients: [],
            type: 'dinner',
            date: ''
        })
    })

    it('keeps a stored shopping mark and its list', () => {
        const meal = toPlannedMeal(
            {
                needsIngredients: true,
                missingIngredients: [ 'chicken', 'rice' ]
            },
            'plan-1',
            'dinner'
        )

        expect(meal.needsIngredients).toBe(true)
        expect(meal.missingIngredients).toEqual([ 'chicken', 'rice' ])
    })

    it('prefers the position in the tree over a record that disagrees with it', () => {
        // The path is what the calendar subscribed to, so it wins over a stale stored copy.
        const meal = toPlannedMeal({ id: 'plan-1', type: 'dinner' }, 'plan-1', 'dinner')

        expect(meal.id).toBe('plan-1')
        expect(meal.type).toBe('dinner')
    })
})

describe('readStoredDay', () => {
    it('returns every slot, including the ones the day has nothing in', () => {
        const day = readStoredDay({
            dinner: {
                'plan-1': { recipeId: 'recipe-curry' }
            }
        })

        expect(day.dinner).toHaveLength(1)
        expect(day.breakfast).toEqual([])
        expect(day.lunch).toEqual([])
        expect(day.snack).toEqual([])
    })

    it('takes each meal id from its key, so a record without one is still identified', () => {
        const day = readStoredDay({
            lunch: {
                'plan-7': { recipeId: 'recipe-soup' }
            }
        })

        expect(day.lunch[0].id).toBe('plan-7')
        expect(day.lunch[0].type).toBe('lunch')
    })

    it('reads a day that does not exist as an empty day', () => {
        const day = readStoredDay(null)

        expect(day.breakfast).toEqual([])
        expect(day.dinner).toEqual([])
    })
})
