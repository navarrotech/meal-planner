// Copyright © 2024 Navarrotech

import type { Recipe, PlannedMeal, MealType } from "@/types";

import { v4 as uuid } from "uuid";
import moment from "moment";

export function makeNewMealPlan(recipe: Recipe, type: MealType, date: typeof moment, forWho: string = "", notes: string = ""): PlannedMeal {
    return {
        id: uuid(),

        forWho,
    
        recipeId: recipe.id,
        notes,
    
        type,
        date: date.toISOString(),
    };
}
