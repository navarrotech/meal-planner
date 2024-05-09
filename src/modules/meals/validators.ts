// Copyright © 2024 Navarrotech

import * as yup from 'yup'

export const MealTypesArray = ["breakfast", "lunch", "dinner", "snack", "sides", "restaurants", "drinks"] as const

export const mealPlanSchema = yup
    .object({
        id: yup
            .string()
            .required(),

        forWho: yup
            .string()
            .typeError("For who must be a string")
            .max(64, "For who must be at most 64 characters")
            .notRequired()
            .default(""),

        recipeId: yup
            .string()
            .typeError("Recipe ID must be a string")
            .max(64, "Recipe ID must be at most 64 characters")
            .required(),

        notes: yup
            .string()
            .typeError("Notes must be a string")
            .max(1024, "Notes must be at most 1024 characters")
            .notRequired()
            .default(""),

        date: yup
            .string()
            .typeError("Date must be a string")
            .max(32, "Date must be at most 32 characters")
            .required(),

        type: yup
            .string()
            .oneOf(MealTypesArray, "Invalid meal type")
            .required(),
    })
    .noUnknown("Invalid keys provided")

