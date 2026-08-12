// Copyright © 2026 Navarrotech

import type { PlannedMeal, Recipe } from '@/types'

// Core
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Utility
import moment from 'moment'

/**
 * Firebase is the external boundary, so it is replaced by a small in-memory tree that behaves
 * the way the Realtime Database does: reads return null for a missing path, and a `set`
 * replaces a whole node rather than merging into it. Asserting against the resulting tree
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
    tags: [ 'weeknight' ]
}

const TUESDAY_DINNER: PlannedMeal = {
    id: 'plan-1',
    forWho: 'Anakin',
    recipeId: 'recipe-curry',
    notes: 'extra spicy',
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

describe('plannedOn', () => {
    /**
     * The stored `date` is an ISO instant of local midnight, so east of UTC its first ten
     * characters spell the day before the one the record is filed under. Anything that reads a
     * day off `date` targets the wrong slot, so `plannedOn` must come from the path instead.
     * Seeding a deliberately skewed record proves that without depending on the host timezone.
     */
    const SKEWED_DATE = '2026-08-10T22:00:00.000Z'

    beforeEach<Context>(async (context) => {
        await context.database
            .ref('meals/2026/August/11/dinner/plan-1')
            .set({ ...TUESDAY_DINNER, date: SKEWED_DATE })
    })

    it<Context>('reports the day the record is filed under, not the day its ISO date spells', async () => {
        const { listPlans } = await import('./plans')

        const plans = await listPlans(
            moment('2026-08-11', 'YYYY-MM-DD'),
            moment('2026-08-11', 'YYYY-MM-DD')
        )

        expect(plans[0].date).toBe(SKEWED_DATE)
        expect(plans[0].plannedOn).toBe('2026-08-11')
    })

    it<Context>('round-trips: plannedOn from a listing locates the same record', async (context) => {
        const { listPlans, movePlan } = await import('./plans')

        const [ listed ] = await listPlans(
            moment('2026-08-11', 'YYYY-MM-DD'),
            moment('2026-08-11', 'YYYY-MM-DD')
        )

        // Exactly what a caller does with the listing: feed plannedOn straight back into --date.
        const moved = await movePlan(
            listed.id,
            moment(listed.plannedOn, 'YYYY-MM-DD'),
            undefined,
            moment('2026-08-14', 'YYYY-MM-DD')
        )

        expect(moved.plannedOn).toBe('2026-08-14')
        expect(context.database.tree().meals['2026']['August']['14']['dinner']['plan-1']).toBeDefined()
    })

    it<Context>('never persists the reporting field back into the database', async (context) => {
        const { updatePlan } = await import('./plans')

        await updatePlan('plan-1', moment('2026-08-11', 'YYYY-MM-DD'), 'dinner', { notes: 'changed' })

        const stored = context.database.tree().meals['2026']['August']['11']['dinner']['plan-1']
        expect(stored).not.toHaveProperty('plannedOn')
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
