// Copyright © 2026 Navarrotech

import type { MealType } from '@/types'
import type { Moment } from 'moment'

// Utility
import moment from 'moment'
import { MealTypesArray } from '@/modules/meals/validators'

export const DATE_FORMAT = 'YYYY-MM-DD'

/**
 * Dates are parsed strictly. Loose parsing would happily accept "next tuesday" or "8/11" and
 * silently resolve it to the wrong day, which is unrecoverable once a meal has been written
 * to that day's path.
 */
export function parseDate(value: string, flag: string): Moment {
    const parsed = moment(value, DATE_FORMAT, true)

    if (!parsed.isValid()) {
        throw new Error(`${flag} must be a date in ${DATE_FORMAT} format, received "${value}".`)
    }

    return parsed
}

export function parseMealType(value: string, flag: string): MealType {
    const normalized = value.trim().toLowerCase()
    const match = MealTypesArray.find((mealType) => mealType === normalized)

    if (!match) {
        throw new Error(`${flag} must be one of: ${MealTypesArray.join(', ')}. Received "${value}".`)
    }

    return match
}

export function parseCommaSeparated(value: string): string[] {
    return value
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean)
}
