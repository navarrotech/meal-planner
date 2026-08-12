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

        needsIngredients: yup
            .boolean()
            .typeError("Needs ingredients must be true or false")
            .notRequired()
            .default(false),

        missingIngredients: yup
            .array()
            .of(
                yup
                    .string()
                    .typeError("Each ingredient must be a string")
                    .max(128, "An ingredient must be at most 128 characters")
                    .required()
            )
            .max(64, "A meal may list at most 64 ingredients")
            .notRequired()
            .default([]),

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

