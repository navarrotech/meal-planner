// Copyright © 2024 Navarrotech

import * as yup from 'yup';

export const tagSchema = () => yup.string().typeError("Tag must be a string").max(32, "Tag must be at most 32 characters");

export const recipeSchema = yup.object({
    id: yup
        .string()
        .required(),

    image: yup
        .string()
        .max(1024, "Image URL must be at most 1024 characters")
        .notRequired()
        .default(""),
    title: yup
        .string()
        .typeError("Title must be a string")
        .min(3, "Title is required")
        .max(48, "Title must be at most 48 characters")
        .required(),
    details: yup
        .string()
        .typeError("Details must be a string")
        .min(0)
        .max(512, "Details must be at most 512 characters")
        .notRequired()
        .default(""),
    instructions: yup
        .string()
        .typeError("Instructions must be a string")
        .min(0)
        .max(4096, "Instructions must be at most 4096 characters")
        .notRequired()
        .default(""),

    type: yup
        .string()
        .oneOf(["breakfast", "lunch", "dinner", "snack"], "Invalid meal type")
        .required(),

    ingredients: yup
        .array()
        .of(tagSchema())
        .max(32, "No more than 32 ingredients")
        .default([]),
    tags: yup
        .array()
        .of(tagSchema())
        .max(32, "No more than 32 tags")
        .default([]),
    categories: yup
        .array()
        .of(tagSchema())
        .max(32, "No more than 32 categories")
        .default([]),
});
