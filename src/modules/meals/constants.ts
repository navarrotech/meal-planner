// Copyright © 2024 Navarrotech

import type { Recipe, PlannedMeal, MealType } from "@/types";

import { v4 as uuid } from "uuid";
import moment from "moment";

/**
 * How far past the days on screen the shopping list looks. Ingredients are bought days or weeks
 * before the meal that needs them, so a list that stopped at the visible week would stay silent
 * about the meal that needed shopping doing now. Two months is the same span the CLI's
 * `plan list` caps at, and costs two or three month-level subscriptions.
 */
export const SHOPPING_HORIZON_DAYS = 62

export function makeNewMealPlan(recipe: Recipe, type: MealType, date: typeof moment, forWho: string = "", notes: string = ""): PlannedMeal {
    return {
        id: uuid(),

        forWho,
    
        recipeId: recipe.id,
        notes,

        needsIngredients: false,
        missingIngredients: [],

        type,
        date: date.toISOString(),
    };
}
