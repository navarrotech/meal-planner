// Copyright © 2026 Navarrotech

import type { PlannedMeal, Recipe } from '@/types'

// Core
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Utility
import moment from 'moment'

/**
 * Firebase is the external boundary, so it is replaced by a small in-memory tree that behaves
 * the way the Realtime Database does: reads return null for a missing path, a `set` replaces a
 * whole node rather than merging into it, and an `update` merges the keys it is given, resolving
 * the increment sentinel against what is already stored. Asserting against the resulting tree
 * proves where records actually landed, which a call-counting stub could not.
 */
function createFakeDatabase(initial: Record<string, unknown>) {
    const root: Record<string, any> = structuredClone(initial)

    return {
        ref(path: string) {
            const segments = path.split('/')
            const leaf = segments[segments.length - 1]
            const parentSegments = segments.slice(0, -1)

            return {
                async update(values: Record<string, any>) {
                    let node: any = root
                    for (const segment of segments) {
                        if (!node[segment]) {
                            node[segment] = {}
                        }
                        node = node[segment]
                    }

                    for (const [ key, value ] of Object.entries(values)) {
                        // firebase-admin's ServerValue.increment is a sentinel object the
                        // server resolves. The fake resolves it the same way the server would.
                        const delta = value?.['.sv']?.increment
                        node[key] = delta === undefined
                            ? value
                            : (node[key] || 0) + delta
                    }
                },
                async get() {
                    let node: any = root
                    for (const segment of segments) {
                        node = node?.[segment]
                    }
                    return {
                        val: () => node ?? null
                    }
                },
                async set(value: unknown) {
                    let node: any = root
                    for (const segment of parentSegments) {
                        if (!node[segment]) {
                            node[segment] = {}
                        }
                        node = node[segment]
                    }
                    node[leaf] = structuredClone(value)
                },
                async remove() {
                    let node: any = root
                    for (const segment of parentSegments) {
                        node = node?.[segment]
                        if (!node) {
                            return
                        }
                    }
                    delete node[leaf]
                }
            }
        },
        tree: () => root
    }
}

const { databaseHolder } = vi.hoisted(() => ({
    databaseHolder: { current: null as ReturnType<typeof createFakeDatabase> | null }
}))

vi.mock('../firebase', () => ({
    getMealPlannerDatabase: () => databaseHolder.current
}))

const CURRY: Recipe = {
    id: 'recipe-curry',
    image: '',
    title: 'Chicken Curry',
    details: '',
    instructions: '',
    type: 'dinner',
    ingredients: [ 'chicken', 'rice' ],
    tags: [ 'weeknight' ],
    timesPlanned: 1
}

const TUESDAY_DINNER: PlannedMeal = {
    id: 'plan-1',
    forWho: 'Anakin',
    recipeId: 'recipe-curry',
    notes: 'extra spicy',
    needsIngredients: false,
    missingIngredients: [],
    type: 'dinner',
    date: moment('2026-08-11', 'YYYY-MM-DD').toISOString()
}

type Context = {
    database: ReturnType<typeof createFakeDatabase>
}

beforeEach<Context>((context) => {
    const database = createFakeDatabase({
        recipes: {
            'recipe-curry': CURRY
        },
        meals: {
            2026: {
                August: {
                    11: {
                        dinner: {
                            'plan-1': TUESDAY_DINNER
                        }
                    }
                }
            }
        }
    })

    databaseHolder.current = database
    context.database = database
})

describe('movePlan', () => {
    it<Context>('relocates the record and leaves nothing behind at the old path', async (context) => {
        const { movePlan } = await import('./plans')

        const moved = await movePlan(
            'plan-1',
            moment('2026-08-11', 'YYYY-MM-DD'),
            'dinner',
            moment('2026-08-14', 'YYYY-MM-DD')
        )

        const meals = context.database.tree().meals

        expect(meals['2026']['August']['14']['dinner']['plan-1']).toMatchObject({
            id: 'plan-1',
            type: 'dinner'
        })
        // The old slot must be gone, not merely overwritten elsewhere. This is the exact
        // failure mode a plain `set` at the new path would produce.
        expect(meals['2026']['August']['11']['dinner']['plan-1']).toBeUndefined()
        expect(moved.date).toBe(moment('2026-08-14', 'YYYY-MM-DD').toISOString())
    })

    it<Context>('keeps the id and every unrelated field across the move', async () => {
        const { movePlan } = await import('./plans')

        const moved = await movePlan(
            'plan-1',
            moment('2026-08-11', 'YYYY-MM-DD'),
            'dinner',
            moment('2026-08-14', 'YYYY-MM-DD'),
            'lunch'
        )

        expect(moved).toMatchObject({
            id: 'plan-1',
            forWho: 'Anakin',
            recipeId: 'recipe-curry',
            notes: 'extra spicy',
            type: 'lunch'
        })
    })

    it<Context>('moves between slots on the same day', async (context) => {
        const { movePlan } = await import('./plans')

        await movePlan('plan-1', moment('2026-08-11', 'YYYY-MM-DD'), 'dinner', undefined, 'breakfast')

        const day = context.database.tree().meals['2026']['August']['11']
        expect(day['breakfast']['plan-1']).toBeDefined()
        expect(day['dinner']['plan-1']).toBeUndefined()
    })

    it<Context>('finds the meal without being told its slot', async (context) => {
        const { movePlan } = await import('./plans')

        await movePlan('plan-1', moment('2026-08-11', 'YYYY-MM-DD'), undefined, moment('2026-08-12', 'YYYY-MM-DD'))

        const august = context.database.tree().meals['2026']['August']
        expect(august['12']['dinner']['plan-1']).toBeDefined()
        expect(august['11']['dinner']['plan-1']).toBeUndefined()
    })

    it<Context>('refuses a move that would delete the meal it just wrote', async (context) => {
        const { movePlan } = await import('./plans')

        await expect(
            movePlan('plan-1', moment('2026-08-11', 'YYYY-MM-DD'), 'dinner', moment('2026-08-11', 'YYYY-MM-DD'), 'dinner')
        ).rejects.toThrow(/already occupies/)

        expect(context.database.tree().meals['2026']['August']['11']['dinner']['plan-1']).toBeDefined()
    })

    it<Context>('reports a meal that is not on the given day', async () => {
        const { movePlan } = await import('./plans')

        await expect(
            movePlan('plan-1', moment('2026-08-09', 'YYYY-MM-DD'), 'dinner', moment('2026-08-14', 'YYYY-MM-DD'))
        ).rejects.toThrow(/No planned meal with id "plan-1"/)
    })
})

describe('updatePlan', () => {
    it<Context>('merges changes onto the stored record instead of replacing it', async (context) => {
        const { updatePlan } = await import('./plans')

        const updated = await updatePlan('plan-1', moment('2026-08-11', 'YYYY-MM-DD'), 'dinner', {
            notes: 'mild for the kids'
        })

        expect(updated).toMatchObject({
            forWho: 'Anakin',
            recipeId: 'recipe-curry',
            notes: 'mild for the kids'
        })

        // A whole-node `set` drops anything the caller did not resend, so the stored record
        // is what actually proves the merge happened.
        expect(
            context.database.tree().meals['2026']['August']['11']['dinner']['plan-1']
        ).toMatchObject({
            forWho: 'Anakin',
            notes: 'mild for the kids'
        })
    })

    it<Context>('rejects a recipe id that does not exist', async () => {
        const { updatePlan } = await import('./plans')

        await expect(
            updatePlan('plan-1', moment('2026-08-11', 'YYYY-MM-DD'), 'dinner', { recipeId: 'nope' })
        ).rejects.toThrow(/No recipe found with id "nope"/)
    })

    it<Context>('stores the shopping mark and its list', async (context) => {
        const { updatePlan } = await import('./plans')

        await updatePlan('plan-1', moment('2026-08-11', 'YYYY-MM-DD'), 'dinner', {
            needsIngredients: true,
            missingIngredients: [ 'chicken', 'rice' ]
        })

        expect(
            context.database.tree().meals['2026']['August']['11']['dinner']['plan-1']
        ).toMatchObject({
            needsIngredients: true,
            missingIngredients: [ 'chicken', 'rice' ]
        })
    })

    it<Context>('clears the list once the shopping is done', async () => {
        const { updatePlan } = await import('./plans')

        await updatePlan('plan-1', moment('2026-08-11', 'YYYY-MM-DD'), 'dinner', {
            needsIngredients: true,
            missingIngredients: [ 'chicken' ]
        })

        const cleared = await updatePlan('plan-1', moment('2026-08-11', 'YYYY-MM-DD'), 'dinner', {
            needsIngredients: false,
            missingIngredients: []
        })

        expect(cleared.needsIngredients).toBe(false)
        expect(cleared.missingIngredients).toEqual([])
    })
})

describe('createPlan', () => {
    it<Context>('defaults a new meal to needing nothing', async () => {
        const { createPlan } = await import('./plans')

        const created = await createPlan({
            recipeId: 'recipe-curry',
            date: moment('2026-08-12', 'YYYY-MM-DD'),
            type: 'dinner'
        })

        expect(created.needsIngredients).toBe(false)
        expect(created.missingIngredients).toEqual([])
    })

    it<Context>('schedules a meal that already knows what it is waiting on', async (context) => {
        const { createPlan } = await import('./plans')

        const created = await createPlan({
            recipeId: 'recipe-curry',
            date: moment('2026-08-12', 'YYYY-MM-DD'),
            type: 'dinner',
            needsIngredients: true,
            missingIngredients: [ 'curry paste' ]
        })

        expect(
            context.database.tree().meals['2026']['August']['12']['dinner'][created.id]
        ).toMatchObject({
            needsIngredients: true,
            missingIngredients: [ 'curry paste' ]
        })
    })
})

describe('listPlans', () => {
    it<Context>('resolves recipe titles so a listing is readable on its own', async () => {
        const { listPlans } = await import('./plans')

        const plans = await listPlans(
            moment('2026-08-10', 'YYYY-MM-DD'),
            moment('2026-08-12', 'YYYY-MM-DD')
        )

        expect(plans).toHaveLength(1)
        expect(plans[0]).toMatchObject({
            id: 'plan-1',
            recipeTitle: 'Chicken Curry'
        })
    })

    it<Context>('excludes days outside the range even though a whole month is read', async () => {
        const { listPlans } = await import('./plans')

        const plans = await listPlans(
            moment('2026-08-01', 'YYYY-MM-DD'),
            moment('2026-08-10', 'YYYY-MM-DD')
        )

        expect(plans).toHaveLength(0)
    })

    it<Context>('reports an orphaned plan rather than hiding it', async (context) => {
        const { listPlans } = await import('./plans')

        await context.database.ref('recipes/recipe-curry').remove()

        const plans = await listPlans(
            moment('2026-08-11', 'YYYY-MM-DD'),
            moment('2026-08-11', 'YYYY-MM-DD')
        )

        expect(plans).toHaveLength(1)
        expect(plans[0].recipeTitle).toBeNull()
    })

    it<Context>('refuses a range wider than the cap', async () => {
        const { listPlans, MAX_RANGE_DAYS } = await import('./plans')

        await expect(
            listPlans(
                moment('2026-01-01', 'YYYY-MM-DD'),
                moment('2026-12-31', 'YYYY-MM-DD')
            )
        ).rejects.toThrow(new RegExp(`limited to ${MAX_RANGE_DAYS} days`))
    })
})

describe('deletePlan', () => {
    it<Context>('removes the record and returns what was removed', async (context) => {
        const { deletePlan } = await import('./plans')

        const deleted = await deletePlan('plan-1', moment('2026-08-11', 'YYYY-MM-DD'))

        expect(deleted.id).toBe('plan-1')
        expect(
            context.database.tree().meals['2026']['August']['11']['dinner']['plan-1']
        ).toBeUndefined()
    })
})

/**
 * The count orders the recipe list in the web app, and the CLI plans meals too. If only one of
 * them counted, the list would quietly rank the wrong things first.
 */
describe('recipe usage counts', () => {
    it<Context>('counts a meal against its recipe when it is planned', async (context) => {
        const { createPlan } = await import('./plans')

        await createPlan({
            recipeId: 'recipe-curry',
            date: moment('2026-08-12', 'YYYY-MM-DD'),
            type: 'dinner'
        })

        expect(context.database.tree().recipes['recipe-curry'].timesPlanned).toBe(2)
    })

    it<Context>('takes the count back when the meal is unplanned', async (context) => {
        const { deletePlan } = await import('./plans')

        await deletePlan('plan-1', moment('2026-08-11', 'YYYY-MM-DD'))

        expect(context.database.tree().recipes['recipe-curry'].timesPlanned).toBe(0)
    })

    it<Context>('moves the count when a plan swaps recipes', async (context) => {
        const { updatePlan } = await import('./plans')

        await context.database.ref('recipes/recipe-soup').set({
            ...CURRY,
            id: 'recipe-soup',
            title: 'Soup',
            timesPlanned: 4
        })

        await updatePlan('plan-1', moment('2026-08-11', 'YYYY-MM-DD'), 'dinner', {
            recipeId: 'recipe-soup'
        })

        const recipes = context.database.tree().recipes
        expect(recipes['recipe-curry'].timesPlanned).toBe(0)
        expect(recipes['recipe-soup'].timesPlanned).toBe(5)
    })

    it<Context>('leaves the count alone when a meal only moves day', async (context) => {
        const { movePlan } = await import('./plans')

        await movePlan(
            'plan-1',
            moment('2026-08-11', 'YYYY-MM-DD'),
            'dinner',
            moment('2026-08-14', 'YYYY-MM-DD')
        )

        expect(context.database.tree().recipes['recipe-curry'].timesPlanned).toBe(1)
    })
})
