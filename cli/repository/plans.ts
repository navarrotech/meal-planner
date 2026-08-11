// Copyright © 2026 Navarrotech

import type { MealType, PlannedMeal } from '@/types'
import type { Moment } from 'moment'

// Core
import { getMealPlannerDatabase } from '../firebase'
import { getRecipe, listRecipes } from './recipes'

// Utility
import moment from 'moment'
import { v4 as uuid } from 'uuid'
import { mealDayPath, mealMonthPath, mealPlanPath, mealPlanPathParts } from '@/lib/paths'
import { MealTypesArray, mealPlanSchema } from '@/modules/meals/validators'

export type PlanInput = {
    recipeId: string
    date: Moment
    type: MealType
    forWho?: string
    notes?: string
}

export type PlanChanges = {
    recipeId?: string
    forWho?: string
    notes?: string
}

export type PlanFilters = {
    type?: MealType
    forWho?: string
}

/**
 * A planned meal carries only a recipeId, so a bare listing would force a second lookup for
 * every row. Recipes can be deleted out from under a plan, which the web app renders as
 * "Recipe not found"; a null title mirrors that rather than hiding the orphan.
 */
export type PlannedMealWithRecipe = PlannedMeal & {
    recipeTitle: string | null
}

/**
 * Planned meals are read a whole month at a time, so a range costs a handful of round trips
 * instead of one per day. The cap keeps an accidental multi-year range from pulling the tree.
 */
export const MAX_RANGE_DAYS = 62

type StoredMonth = Record<string, Record<string, Record<string, Partial<PlannedMeal>>>>

// The Realtime Database omits empty strings rather than storing them, so a record read back
// is a subset of PlannedMeal. Everything downstream expects the full shape.
function toPlannedMeal(stored: Partial<PlannedMeal>, planId: string, type: MealType): PlannedMeal {
    return {
        id: stored.id || planId,
        forWho: stored.forWho || '',
        recipeId: stored.recipeId || '',
        notes: stored.notes || '',
        type: stored.type || type,
        date: stored.date || ''
    }
}

export async function listPlans(
    from: Moment,
    to: Moment,
    filters: PlanFilters = {}
): Promise<PlannedMealWithRecipe[]> {
    if (to.isBefore(from, 'day')) {
        throw new Error('The end of the range is before its start. Check --from and --to.')
    }

    // Build the set of days the range covers using the same formatter the paths use, so the
    // range and the stored keys can never disagree about how a day is spelled.
    const includedDays = new Set<string>()
    const monthsToRead = new Map<string, { year: string, month: string }>()

    const cursor = from.clone().startOf('day')
    const lastDay = to.clone().startOf('day')

    while (!cursor.isAfter(lastDay, 'day')) {
        if (includedDays.size >= MAX_RANGE_DAYS) {
            throw new Error(`Date ranges are limited to ${MAX_RANGE_DAYS} days. Narrow --from and --to.`)
        }

        const { year, month, day } = mealPlanPathParts(cursor)
        includedDays.add(`${year}/${month}/${day}`)
        monthsToRead.set(`${year}/${month}`, { year, month })
        cursor.add(1, 'day')
    }

    const database = getMealPlannerDatabase()
    const months = await Promise.all(
        [ ...monthsToRead.values() ].map(async ({ year, month }) => {
            const snapshot = await database.ref(mealMonthPath(year, month)).get()
            return {
                year,
                month,
                days: snapshot.val() as StoredMonth | null
            }
        })
    )

    const plans: PlannedMeal[] = []
    for (const { year, month, days } of months) {
        if (!days) {
            continue
        }

        for (const [ day, slots ] of Object.entries(days)) {
            if (!slots || !includedDays.has(`${year}/${month}/${day}`)) {
                continue
            }

            for (const [ slotType, storedById ] of Object.entries(slots)) {
                if (!storedById) {
                    continue
                }

                for (const [ planId, stored ] of Object.entries(storedById)) {
                    plans.push(
                        toPlannedMeal(stored, planId, slotType as MealType)
                    )
                }
            }
        }
    }

    const forWho = filters.forWho?.trim().toLowerCase()
    const matches = plans
        .filter((plan) => !filters.type || plan.type === filters.type)
        .filter((plan) => !forWho || plan.forWho.toLowerCase() === forWho)
        .sort((left, right) => {
            const byDate = left.date.localeCompare(right.date)
            if (byDate) {
                return byDate
            }
            return MealTypesArray.indexOf(left.type) - MealTypesArray.indexOf(right.type)
        })

    if (!matches.length) {
        return []
    }

    const recipeTitlesById = new Map(
        (await listRecipes()).map((recipe) => [ recipe.id, recipe.title ])
    )

    return matches.map((plan) => ({
        ...plan,
        recipeTitle: recipeTitlesById.get(plan.recipeId) || null
    }))
}

/**
 * The meal type is optional because it is recoverable: without it the day's slots are scanned.
 * The date is not optional, because it is what locates the record in the first place.
 */
export async function getPlan(planId: string, date: Moment, type?: MealType): Promise<PlannedMeal | null> {
    const { year, month, day } = mealPlanPathParts(date)
    const database = getMealPlannerDatabase()

    if (type) {
        const snapshot = await database.ref(mealPlanPath(year, month, day, type, planId)).get()
        const stored = snapshot.val() as Partial<PlannedMeal> | null

        if (!stored) {
            return null
        }

        return toPlannedMeal(stored, planId, type)
    }

    const snapshot = await database.ref(mealDayPath(year, month, day)).get()
    const slots = snapshot.val() as Record<string, Record<string, Partial<PlannedMeal>>> | null

    if (!slots) {
        return null
    }

    for (const slotType of MealTypesArray) {
        const stored = slots[slotType]?.[planId]
        if (stored) {
            return toPlannedMeal(stored, planId, slotType)
        }
    }

    return null
}

function missingPlanError(planId: string, date: Moment) {
    return new Error(
        `No planned meal with id "${planId}" on ${date.format('YYYY-MM-DD')}. `
        + 'Run "plan list" over the range to find its date.'
    )
}

export async function createPlan(input: PlanInput): Promise<PlannedMeal> {
    // Catch a mistyped recipe id here rather than storing a plan that renders as
    // "Recipe not found" in the calendar.
    const recipe = await getRecipe(input.recipeId)
    if (!recipe) {
        throw new Error(
            `No recipe found with id "${input.recipeId}". Run "recipe list" to see the available recipes.`
        )
    }

    const plan: PlannedMeal = {
        id: uuid(),
        forWho: input.forWho || '',
        recipeId: input.recipeId,
        notes: input.notes || '',
        type: input.type,
        date: input.date.toISOString()
    }

    await mealPlanSchema.validate(plan, { abortEarly: false })

    const { year, month, day } = mealPlanPathParts(input.date)
    await getMealPlannerDatabase()
        .ref(mealPlanPath(year, month, day, plan.type, plan.id))
        .set(plan)

    return plan
}

export async function updatePlan(
    planId: string,
    date: Moment,
    type: MealType | undefined,
    changes: PlanChanges
): Promise<PlannedMeal> {
    const existing = await getPlan(planId, date, type)
    if (!existing) {
        throw missingPlanError(planId, date)
    }

    if (changes.recipeId) {
        const recipe = await getRecipe(changes.recipeId)
        if (!recipe) {
            throw new Error(
                `No recipe found with id "${changes.recipeId}". Run "recipe list" to see the available recipes.`
            )
        }
    }

    // A Realtime Database `set` replaces the whole node, so the current record has to be
    // merged onto rather than overwritten, or unspecified fields would be dropped.
    const updated: PlannedMeal = {
        ...existing,
        ...changes
    }

    await mealPlanSchema.validate(updated, { abortEarly: false })

    // The record was just found under the requested date, so those parts locate it exactly.
    const { year, month, day } = mealPlanPathParts(date)
    await getMealPlannerDatabase()
        .ref(mealPlanPath(year, month, day, existing.type, planId))
        .set(updated)

    return updated
}

/**
 * A planned meal's date and type are part of its path, so moving it is a write to the new
 * slot followed by a delete of the old one, never an update in place. The id is carried over
 * so the meal keeps its identity across the move.
 */
export async function movePlan(
    planId: string,
    date: Moment,
    type: MealType | undefined,
    toDate?: Moment,
    toType?: MealType
): Promise<PlannedMeal> {
    const existing = await getPlan(planId, date, type)
    if (!existing) {
        throw missingPlanError(planId, date)
    }

    const destinationDate = toDate || date
    const destinationType = toType || existing.type

    const source = mealPlanPathParts(date)
    const destination = mealPlanPathParts(destinationDate)

    const sourcePath = mealPlanPath(source.year, source.month, source.day, existing.type, planId)
    const destinationPath = mealPlanPath(
        destination.year,
        destination.month,
        destination.day,
        destinationType,
        planId
    )

    if (sourcePath === destinationPath) {
        throw new Error('That is the slot the meal already occupies. Pass a different --to-date or --to-type.')
    }

    const moved: PlannedMeal = {
        ...existing,
        type: destinationType,
        date: destinationDate.toISOString()
    }

    await mealPlanSchema.validate(moved, { abortEarly: false })

    const database = getMealPlannerDatabase()

    // Write the destination first: a failure between the two steps leaves a duplicate, which
    // is visible in the calendar and easy to clean up, rather than losing the meal entirely.
    await database.ref(destinationPath).set(moved)
    await database.ref(sourcePath).remove()

    return moved
}

export async function deletePlan(planId: string, date: Moment, type?: MealType): Promise<PlannedMeal> {
    const existing = await getPlan(planId, date, type)
    if (!existing) {
        throw missingPlanError(planId, date)
    }

    const { year, month, day } = mealPlanPathParts(date)
    await getMealPlannerDatabase()
        .ref(mealPlanPath(year, month, day, existing.type, planId))
        .remove()

    return existing
}

/**
 * Deleting a recipe leaves any planned meal pointing at it orphaned, exactly as the web app
 * already allows. Reporting the upcoming ones lets the caller decide, without the cost of
 * walking the entire history.
 */
export async function findUpcomingPlansForRecipe(recipeId: string): Promise<PlannedMealWithRecipe[]> {
    const from = moment().startOf('day')
    const to = from.clone().add(MAX_RANGE_DAYS - 1, 'days')

    const plans = await listPlans(from, to)
    return plans.filter((plan) => plan.recipeId === recipeId)
}
