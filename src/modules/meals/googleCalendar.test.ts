// Copyright © 2026 Navarrotech

import type { PlannedMeal, Recipe } from '@/types'

// Core
import { describe, expect, it } from 'vitest'

// Utility
import moment from 'moment'
import { googleCalendarEventUrl } from './googleCalendar'

const CURRY: Recipe = {
    id: 'recipe-curry',
    image: '',
    title: 'Chicken Curry',
    details: 'Serves four',
    instructions: '',
    type: 'dinner',
    ingredients: [ 'chicken', 'rice' ],
    tags: []
}

function plannedMeal(overrides: Partial<PlannedMeal> = {}): PlannedMeal {
    return {
        id: 'plan-1',
        forWho: '',
        recipeId: 'recipe-curry',
        notes: '',
        needsIngredients: false,
        missingIngredients: [],
        type: 'dinner',
        // Local midnight, which is how the app stores a day.
        date: moment('2026-08-14', 'YYYY-MM-DD').toISOString(),
        ...overrides
    }
}

function parameterOf(url: string, name: string) {
    return new URL(url).searchParams.get(name)
}

describe('googleCalendarEventUrl', () => {
    it('names the event after the slot and the dish', () => {
        const url = googleCalendarEventUrl(plannedMeal(), CURRY)

        expect(parameterOf(url, 'text')).toBe('Dinner: Chicken Curry')
        expect(parameterOf(url, 'action')).toBe('TEMPLATE')
    })

    it('falls back to the slot when the recipe was deleted out from under the meal', () => {
        const url = googleCalendarEventUrl(plannedMeal({ type: 'lunch' }))

        expect(parameterOf(url, 'text')).toBe('Lunch')
    })

    it('puts the meal at the hour that slot is eaten at, on its own day', () => {
        const url = googleCalendarEventUrl(plannedMeal(), CURRY)

        // Six in the evening for an hour and a half, with no trailing Z: Google reads a stamp
        // without one in the calendar's own timezone, which is what "dinner at six" means.
        expect(parameterOf(url, 'dates')).toBe('20260814T180000/20260814T193000')
    })

    it('gives each slot its own hour', () => {
        const breakfast = googleCalendarEventUrl(plannedMeal({ type: 'breakfast' }), CURRY)

        expect(parameterOf(breakfast, 'dates')).toBe('20260814T080000/20260814T084500')
    })

    it('carries who it is for, the notes and the shopping into the description', () => {
        const url = googleCalendarEventUrl(
            plannedMeal({
                forWho: 'Anakin',
                notes: 'extra spicy',
                needsIngredients: true,
                missingIngredients: [ 'chicken', 'rice' ]
            }),
            CURRY
        )

        expect(parameterOf(url, 'details')).toBe(
            'For Anakin\n\nextra spicy\n\nServes four\n\nStill to buy: chicken, rice'
        )
    })

    it('leaves the description out entirely when there is nothing to say', () => {
        const url = googleCalendarEventUrl(
            plannedMeal(),
            { ...CURRY, details: '' }
        )

        expect(parameterOf(url, 'details')).toBeNull()
    })

    it('says a meal is short of something even when nothing has been named', () => {
        const url = googleCalendarEventUrl(
            plannedMeal({ needsIngredients: true }),
            { ...CURRY, details: '' }
        )

        expect(parameterOf(url, 'details')).toBe('Still needs ingredients')
    })
})
