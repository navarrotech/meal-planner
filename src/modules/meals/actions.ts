// Copyright © 2024 Navarrotech

// Typescript
import type { Recipe, MealType, PlannedMeal } from "@/types"

// Utility
import moment from "moment"
import { makeNewMealPlan } from "./constants"
import { mealPlanPathParts } from "@/lib/paths"

// Firebase
import { mealsSetRef } from "./references"
import { remove, set } from "firebase/database"

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
}

export async function deleteMealPlan(plan: PlannedMeal){
    const { year, month, day } = mealPlanPathParts(moment(plan.date))

    await remove(
        mealsSetRef(year, month, day, plan.type, plan.id)
    )
}

export async function updateMealPlan(plan: PlannedMeal){
    const { year, month, day } = mealPlanPathParts(moment(plan.date))

    await set(
        mealsSetRef(year, month, day, plan.type, plan.id),
        plan
    )
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
