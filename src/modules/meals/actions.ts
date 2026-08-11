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
