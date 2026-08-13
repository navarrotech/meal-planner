// Copyright © 2024 Navarrotech

export type BulmaColors = "default" | "primary" | "danger" | "success" | "warning" | "info" | "link" | "dark" | "light"

export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "sides" | "restaurants" | "drinks"

export type PlannedMeal = {
    id: string

    // Sometimes different people eat different things for meals
    // Example: A toddler might be eating chicken nuggets while the parents are eating steak
    // In which case there'd be two planned meal objects for the same date
    forWho: string
    
    recipeId: string
    notes: string

    // Marked when the kitchen is missing something this meal needs, so the calendar can warn
    // before the day arrives. The list lives on the planned meal rather than on the recipe,
    // because what is missing depends on what is in the cupboard, not on the recipe itself.
    needsIngredients: boolean
    missingIngredients: string[]

    // When the meal is planned to be eaten:
    type: MealType
    date: string
}

export type PlannedDayGroup = {
    all: PlannedMeal[],
    breakfast: PlannedMeal[],
    lunch: PlannedMeal[],
    dinner: PlannedMeal[]
}

/**
 * Someone a meal can be planned for. A managed list rather than free text, so the same person is
 * spelled one way everywhere, and so the calendar can colour their meals.
 *
 * A planned meal stores the person's `name`, not their id: the names were already written by hand
 * across months of history, and matching on them keeps that history readable. The cost is that
 * renaming a person leaves their past meals under the old name.
 */
export type Person = {
    id: string
    name: string

    // Hex, as an <input type="color"> gives it.
    color: string
}

export type Recipe = {
    id: string

    image: string
    title: string
    details: string
    instructions: string

    type: MealType

    ingredients: string[]
    tags: string[]

    /**
     * How many planned meals point at this recipe. Kept as a running total rather than counted
     * from the calendar, so ordering the list by what the household actually cooks costs one
     * field instead of a walk of every meal ever planned. Planning a meal adds one and removing
     * one takes it away, which the app and the CLI both maintain.
     */
    timesPlanned: number
}
