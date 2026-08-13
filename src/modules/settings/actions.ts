// Copyright © 2026 Navarrotech

// Typescript
import type { Person, Recipe } from "@/types"
import type { StoredDay } from "@/lib/meals"

// Utility
import { readStoredDay } from "@/lib/meals"
import { mealsPath, peoplePath, recipesPath } from "@/lib/paths"

// Firebase
import { database } from "@/firebase"
import { get, increment, ref, update } from "firebase/database"

// A whole year of a family's meals, keyed year, month name, day.
type StoredMeals = Record<string, Record<string, Record<string, StoredDay>>>

export type Backup = {
    // Stamped so a file found in a folder years from now says what it is and when it was taken.
    exportedAt: string
    counts: {
        recipes: number
        meals: number
        people: number
    }
    recipes: Record<string, Recipe>
    people: Record<string, Person>
    meals: StoredMeals
}

/**
 * Each tree is read separately rather than reading the root: the database rules grant access per
 * tree, so a read at the root is denied outright.
 */
export async function exportBackup(): Promise<Backup> {
    const [ recipes, people, meals ] = await Promise.all([
        get(ref(database, recipesPath)),
        get(ref(database, peoplePath)),
        get(ref(database, mealsPath))
    ])

    const storedMeals = (meals.val() || {}) as StoredMeals
    let mealCount = 0

    for (const months of Object.values(storedMeals)){
        for (const days of Object.values(months || {})){
            for (const slots of Object.values(days || {})){
                for (const meals of Object.values(readStoredDay(slots))){
                    mealCount += meals.length
                }
            }
        }
    }

    const storedRecipes = (recipes.val() || {}) as Record<string, Recipe>
    const storedPeople = (people.val() || {}) as Record<string, Person>

    return {
        exportedAt: new Date().toISOString(),
        counts: {
            recipes: Object.keys(storedRecipes).length,
            meals: mealCount,
            people: Object.keys(storedPeople).length
        },
        recipes: storedRecipes,
        people: storedPeople,
        meals: storedMeals
    }
}

/**
 * Counts every planned meal against its recipe and corrects the totals. Planning and unplanning
 * keep `timesPlanned` current from here on, so this is for the history that predates it, or for
 * a total that has drifted. It reads the whole calendar, which is why it is a button rather than
 * something the app does on its own.
 *
 * Returns the titles it corrected.
 */
export async function recountRecipeUsage(): Promise<string[]> {
    const [ meals, recipes ] = await Promise.all([
        get(ref(database, mealsPath)),
        get(ref(database, recipesPath))
    ])

    const plannedByRecipe = new Map<string, number>()

    for (const months of Object.values((meals.val() || {}) as StoredMeals)){
        for (const days of Object.values(months || {})){
            for (const slots of Object.values(days || {})){
                for (const mealsInSlot of Object.values(readStoredDay(slots))){
                    for (const meal of mealsInSlot){
                        plannedByRecipe.set(
                            meal.recipeId,
                            (plannedByRecipe.get(meal.recipeId) || 0) + 1
                        )
                    }
                }
            }
        }
    }

    const storedRecipes = (recipes.val() || {}) as Record<string, Recipe>
    const corrected: string[] = []
    const writes: Promise<unknown>[] = []

    for (const [ recipeId, recipe ] of Object.entries(storedRecipes)){
        const counted = plannedByRecipe.get(recipeId) || 0
        const stored = recipe.timesPlanned || 0

        if (counted === stored){
            continue
        }

        corrected.push(recipe.title)
        // Written as a difference rather than a total, so a meal planned on another device
        // while this was running is not thrown away.
        writes.push(
            update(ref(database, `${recipesPath}/${recipeId}`), {
                timesPlanned: increment(counted - stored)
            })
        )
    }

    await Promise.all(writes)

    return corrected
}
