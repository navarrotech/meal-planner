// Copyright © 2024 Navarrotech

export type BulmaColors = "default" | "primary" | "danger" | "success" | "warning" | "info" | "link" | "dark" | "light"

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type PlannedMeal = {
    id: string,

    // Sometimes different people eat different things for meals
    // Example: A toddler might be eating chicken nuggets while the parents are eating steak
    // In which case, there'd be two planned meal objects for the same date
    forWho: string,
    
    recipeId: string,
    notes: string,

    // When the meal is planned to be eaten:
    type: MealType,
    date: string,
}

export type Recipe = {
    id: string,

    image: string,
    title: string,
    details: string,
    instructions: string,

    type: MealType,

    ingredients: string[],
    tags: string[],
}
