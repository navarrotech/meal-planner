// Copyright © 2026 Navarrotech

import type { MealType, Recipe } from '@/types'

// Core
import { getMealPlannerDatabase } from '../firebase'

// Utility
import { recipePath, recipesPath } from '@/lib/paths'
import { recipeSchema } from '@/modules/recipes/validators'
import { v4 as uuid } from 'uuid'

export type RecipeInput = {
    title: string
    type: MealType
    details?: string
    instructions?: string
    image?: string
    ingredients?: string[]
    tags?: string[]
}

export type RecipeChanges = Partial<RecipeInput>

export type RecipeFilters = {
    type?: MealType
    search?: string
    tag?: string
}

/**
 * The Realtime Database omits empty strings and empty arrays rather than storing them, so a
 * record read back is a subset of Recipe. Everything downstream expects the full shape.
 */
function toRecipe(stored: Partial<Recipe>, recipeId: string): Recipe {
    return {
        id: stored.id || recipeId,
        image: stored.image || '',
        title: stored.title || '',
        details: stored.details || '',
        instructions: stored.instructions || '',
        type: stored.type || 'dinner',
        ingredients: stored.ingredients || [],
        tags: stored.tags || []
    }
}

export async function listRecipes(filters: RecipeFilters = {}): Promise<Recipe[]> {
    const snapshot = await getMealPlannerDatabase().ref(recipesPath).get()
    const storedById = snapshot.val() as Record<string, Partial<Recipe>> | null

    if (!storedById) {
        return []
    }

    const search = filters.search?.trim().toLowerCase()
    const tag = filters.tag?.trim().toLowerCase()

    return Object.entries(storedById)
        .map(([ recipeId, stored ]) => toRecipe(stored, recipeId))
        .filter((recipe) => !filters.type || recipe.type === filters.type)
        .filter((recipe) => !tag || recipe.tags.some((entry) => entry.toLowerCase() === tag))
        .filter((recipe) => {
            if (!search) {
                return true
            }
            const haystack = [ recipe.title, recipe.details, ...recipe.ingredients, ...recipe.tags ]
            return haystack.join(' ').toLowerCase().includes(search)
        })
        .sort((left, right) => left.title.localeCompare(right.title))
}

export async function getRecipe(recipeId: string): Promise<Recipe | null> {
    const snapshot = await getMealPlannerDatabase().ref(recipePath(recipeId)).get()
    const stored = snapshot.val() as Partial<Recipe> | null

    if (!stored) {
        return null
    }

    return toRecipe(stored, recipeId)
}

export async function createRecipe(input: RecipeInput): Promise<Recipe> {
    const recipe: Recipe = {
        id: uuid(),
        image: input.image || '',
        title: input.title,
        details: input.details || '',
        instructions: input.instructions || '',
        type: input.type,
        ingredients: input.ingredients || [],
        tags: input.tags || []
    }

    // The web app only validates to enable its save button, never on write, so this is the
    // one place a recipe is actually checked against the schema before it is stored.
    await recipeSchema.validate(recipe, { abortEarly: false })
    await getMealPlannerDatabase().ref(recipePath(recipe.id)).set(recipe)

    return recipe
}

export async function updateRecipe(recipeId: string, changes: RecipeChanges): Promise<Recipe> {
    // A Realtime Database `set` replaces the whole node, so the current record has to be
    // merged onto rather than overwritten, or unspecified fields would be dropped.
    const existing = await getRecipe(recipeId)
    if (!existing) {
        throw new Error(`No recipe found with id "${recipeId}". Run "recipe list" to see the available recipes.`)
    }

    const updated: Recipe = {
        ...existing,
        ...changes
    }

    await recipeSchema.validate(updated, { abortEarly: false })
    await getMealPlannerDatabase().ref(recipePath(recipeId)).set(updated)

    return updated
}

export async function deleteRecipe(recipeId: string): Promise<Recipe> {
    const existing = await getRecipe(recipeId)
    if (!existing) {
        throw new Error(`No recipe found with id "${recipeId}". Run "recipe list" to see the available recipes.`)
    }

    await getMealPlannerDatabase().ref(recipePath(recipeId)).remove()

    return existing
}
