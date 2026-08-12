// Copyright © 2026 Navarrotech

// Core
import { describe, expect, it } from 'vitest'

// Utility
import moment from 'moment'
import {
    mealDayPath,
    mealMonthPath,
    mealPlanPath,
    mealPlanPathParts,
    mealSlotPath,
    recipePath,
    recipesPath
} from './paths'

/**
 * These assertions are deliberately literal. The stored path layout is a contract with data
 * that already exists in Firebase, so a "cleaner" format is a breaking change, not a refactor.
 */

describe('mealPlanPathParts', () => {
    it('spells the month as its full English name, never a number', () => {
        const parts = mealPlanPathParts(moment('2026-08-11', 'YYYY-MM-DD'))

        expect(parts).toEqual({
            year: '2026',
            month: 'August',
            day: '11'
        })
    })

    it('zero-pads single digit days', () => {
        expect(
            mealPlanPathParts(moment('2026-01-05', 'YYYY-MM-DD'))
        ).toEqual({
            year: '2026',
            month: 'January',
            day: '05'
        })
    })

    it('rolls into the following month on the last day of a month', () => {
        expect(
            mealPlanPathParts(moment('2026-12-31', 'YYYY-MM-DD'))
        ).toEqual({
            year: '2026',
            month: 'December',
            day: '31'
        })
    })
})

describe('mealPlanPath', () => {
    it('builds the exact path the calendar reads', () => {
        const { year, month, day } = mealPlanPathParts(moment('2026-08-11', 'YYYY-MM-DD'))

        expect(
            mealPlanPath(year, month, day, 'dinner', 'abc-123')
        ).toBe('meals/2026/August/11/dinner/abc-123')
    })

    it('nests inside its slot, day, and month paths', () => {
        expect(mealMonthPath('2026', 'August')).toBe('meals/2026/August')
        expect(mealDayPath('2026', 'August', '11')).toBe('meals/2026/August/11')
        expect(mealSlotPath('2026', 'August', '11', 'breakfast')).toBe('meals/2026/August/11/breakfast')
        expect(
            mealPlanPath('2026', 'August', '11', 'breakfast', 'abc-123')
        ).toBe('meals/2026/August/11/breakfast/abc-123')
    })
})

describe('recipePath', () => {
    it('keys recipes flatly by id', () => {
        expect(recipesPath).toBe('recipes')
        expect(recipePath('abc-123')).toBe('recipes/abc-123')
    })
})
