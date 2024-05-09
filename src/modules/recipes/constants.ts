// Copyright © 2024 Navarrotech

import type { MealType, Recipe } from "@/types";
import { v4 as uuid } from "uuid";

const storageEngine = localStorage;
export const getLastCreatedRecipeTypeUsed = () => storageEngine.getItem("lastCreatedRecipeTypeUsed") as MealType || "dinner";
export const saveLastCreatedRecipeTypeUsed = (type: MealType) => storageEngine.setItem("lastCreatedRecipeTypeUsed", type);

export function makeNewRecipe(): Recipe {
    return {
        id: uuid(),

        image: "",
        title: "",
        details: "",
        instructions: "",

        type: getLastCreatedRecipeTypeUsed(),
        
        ingredients: [],
        tags: [],
    };
}

export const maxImageFileSize = 5 * 1024 * 1024; // 5MB
