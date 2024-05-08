// Copyright © 2024 Navarrotech

import type { Recipe } from "@/types";
import { v4 as uuid } from "uuid";

export function makeNewRecipe(): Recipe {
    return {
        id: uuid(),

        image: "",
        title: "",
        details: "",
        instructions: "",

        type: "dinner",
        
        ingredients: [],
        tags: [],
    };
}

export const maxImageFileSize = 5 * 1024 * 1024; // 5MB
