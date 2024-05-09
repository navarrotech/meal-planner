// Copyright © 2024 Navarrotech

// Typescript
import type { Recipe, MealType, PlannedMeal } from "@/types"

// Utility
import moment from "moment"
import { makeNewMealPlan } from "./constants"

// Firebase
import { mealsSetRef } from "./references"
import { remove, set } from "firebase/database"

export async function createMealPlanFromRecipe(date: typeof moment, type: MealType, recipe: Recipe, forWho?: string, notes?: string){
    const [ year, month, day ] = date.format("YYYY-MMMM-DD").split("-")

    const newMealPlan = makeNewMealPlan(
        recipe,
        type,
        date,
        forWho,
        notes
    )

    set(
        mealsSetRef(year, month, day, type, newMealPlan.id),
        newMealPlan
    )
}

export async function deleteMealPlan(plan: PlannedMeal){
    const [ year, month, day ] = moment(plan.date).format("YYYY-MMMM-DD").split("-")

    remove(
        mealsSetRef(year, month, day, plan.type, plan.id)
    )
}

export async function updateMealPlan(plan: PlannedMeal){
    const [ year, month, day ] = moment(plan.date).format("YYYY-MMMM-DD").split("-")

    set(
        mealsSetRef(year, month, day, plan.type, plan.id),
        plan
    )
}
