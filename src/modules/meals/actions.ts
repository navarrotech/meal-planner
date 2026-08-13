// Copyright © 2024 Navarrotech

// Typescript
import type { Recipe, MealType, PlannedMeal } from "@/types"

// Utility
import moment from "moment"
import { makeNewMealPlan } from "./constants"
import { mealPlanPathParts } from "@/lib/paths"

// Redux
import { getState } from "@/store"

// Firebase
import { mealsSetRef } from "./references"
import { recipeRef } from "@/modules/recipes/references"
import { get, increment, remove, set, update } from "firebase/database"

/**
 * A recipe keeps a running total of how many meals point at it, so the recipe list can be
 * ordered by what the household actually cooks without walking the calendar. It moves by atomic
 * increment rather than read-then-write, so two people planning at once cannot lose a count.
 *
 * A recipe that no longer exists is skipped: an increment would otherwise conjure a recipe made
 * of nothing but a number, which the planner would then list.
 */
function countPlannedMeal(recipeId: string, change: 1 | -1){
    if (!recipeId || !getState().recipes.byId[recipeId]){
        console.debug("Not counting a planned meal against an unknown recipe", recipeId)
        return
    }

    update(
        recipeRef(recipeId),
        { timesPlanned: increment(change) }
    )
}

export async function createMealPlanFromRecipe(date: typeof moment, type: MealType, recipe: Recipe, forWho?: string, notes?: string){
    const newMealPlan = makeNewMealPlan(
        recipe,
        type,
        date,
        forWho,
        notes
    )

    // Derive the path from the stored date so the record can only ever land on the day it claims.
    const { year, month, day } = mealPlanPathParts(moment(newMealPlan.date))

    await set(
        mealsSetRef(year, month, day, type, newMealPlan.id),
        newMealPlan
    )

    countPlannedMeal(newMealPlan.recipeId, 1)
}

export async function deleteMealPlan(plan: PlannedMeal){
    const { year, month, day } = mealPlanPathParts(moment(plan.date))

    await remove(
        mealsSetRef(year, month, day, plan.type, plan.id)
    )

    countPlannedMeal(plan.recipeId, -1)
}

export async function updateMealPlan(plan: PlannedMeal){
    const { year, month, day } = mealPlanPathParts(moment(plan.date))
    const planRef = mealsSetRef(year, month, day, plan.type, plan.id)

    // Read first so a swapped recipe moves the count off the old one and onto the new one.
    // Dragging a meal to another day is a delete and a create, which balances on its own.
    const stored = (await get(planRef)).val() as PlannedMeal | null

    await set(planRef, plan)

    if (stored && stored.recipeId !== plan.recipeId){
        countPlannedMeal(stored.recipeId, -1)
        countPlannedMeal(plan.recipeId, 1)
    }
}

/**
 * Buying something is recorded on the meals that were waiting for it rather than in a list of
 * its own: there is one truth about what a meal still needs, and the shopping list is a view of
 * it. A meal waiting on nothing is not waiting, so its mark clears with its last item, and the
 * warning leaves the calendar as the shopping gets done.
 *
 * The two directions are exact opposites, so putting something back is not a different idea of
 * what the record should look like.
 */
export async function markIngredientBought(meals: PlannedMeal[], ingredient: string){
    const bought = ingredient.toLowerCase()

    await Promise.all(
        meals.map((meal) => {
            const missingIngredients = meal.missingIngredients.filter(
                (listed) => listed.toLowerCase() !== bought
            )

            return updateMealPlan({
                ...meal,
                missingIngredients,
                needsIngredients: Boolean(missingIngredients.length)
            })
        })
    )
}

export async function markIngredientNeeded(meals: PlannedMeal[], ingredient: string){
    const needed = ingredient.toLowerCase()

    await Promise.all(
        meals.map((meal) => {
            const isAlreadyListed = meal.missingIngredients.some(
                (listed) => listed.toLowerCase() === needed
            )

            return updateMealPlan({
                ...meal,
                needsIngredients: true,
                missingIngredients: isAlreadyListed
                    ? meal.missingIngredients
                    : [ ...meal.missingIngredients, ingredient ]
            })
        })
    )
}
