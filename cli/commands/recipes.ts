// Copyright © 2026 Navarrotech

import type { RecipeChanges } from '../repository/recipes'
import type { Command } from 'commander'

// Core
import {
    createRecipe,
    deleteRecipe,
    getRecipe,
    listRecipes,
    updateRecipe
} from '../repository/recipes'
import { findUpcomingPlansForRecipe } from '../repository/plans'

// Utility
import { parseCommaSeparated, parseMealType } from '../options'
import { succeed } from '../output'

export function registerRecipeCommands(program: Command) {
    const recipe = program
        .command('recipe')
        .description('Manage the recipe library: the meals that can be planned')

    recipe
        .command('list')
        .description('List recipes, optionally filtered')
        .option('--type <type>', 'Only recipes of this meal type')
        .option('--search <text>', 'Match against title, details, ingredients and tags')
        .option('--tag <tag>', 'Only recipes carrying this exact tag')
        .action(async (options) => {
            const recipes = await listRecipes({
                type: options.type
                    ? parseMealType(options.type, '--type')
                    : undefined,
                search: options.search,
                tag: options.tag
            })

            succeed(recipes)
        })

    recipe
        .command('get')
        .description('Fetch a single recipe, including its full instructions')
        .argument('<id>', 'Recipe id')
        .action(async (recipeId: string) => {
            const found = await getRecipe(recipeId)

            if (!found) {
                throw new Error(`No recipe found with id "${recipeId}". Run "recipe list" to see the available recipes.`)
            }

            succeed(found)
        })

    recipe
        .command('create')
        .description('Add a recipe to the library')
        .requiredOption('--title <title>', 'Recipe name, 3 to 48 characters')
        .requiredOption('--type <type>', 'Meal type this recipe belongs to')
        .option('--details <text>', 'Short description, up to 512 characters')
        .option('--instructions <text>', 'How to make it, up to 4096 characters')
        .option('--image <url>', 'Cover image URL')
        .option('--ingredients <list>', 'Comma separated, up to 32 entries of 32 characters')
        .option('--tags <list>', 'Comma separated, up to 32 entries of 32 characters')
        .action(async (options) => {
            const created = await createRecipe({
                title: options.title,
                type: parseMealType(options.type, '--type'),
                details: options.details,
                instructions: options.instructions,
                image: options.image,
                ingredients: options.ingredients
                    ? parseCommaSeparated(options.ingredients)
                    : undefined,
                tags: options.tags
                    ? parseCommaSeparated(options.tags)
                    : undefined
            })

            succeed(created)
        })

    recipe
        .command('update')
        .description('Change fields on an existing recipe, leaving the rest untouched')
        .argument('<id>', 'Recipe id')
        .option('--title <title>', 'Recipe name, 3 to 48 characters')
        .option('--type <type>', 'Meal type this recipe belongs to')
        .option('--details <text>', 'Short description, up to 512 characters')
        .option('--instructions <text>', 'How to make it, up to 4096 characters')
        .option('--image <url>', 'Cover image URL, pass an empty string to clear it')
        .option('--ingredients <list>', 'Comma separated, replaces the existing list')
        .option('--tags <list>', 'Comma separated, replaces the existing list')
        .action(async (recipeId: string, options) => {
            // Only fields that were actually passed may appear, because an undefined value
            // spread over the stored recipe would erase it rather than leave it alone.
            const changes: RecipeChanges = {}

            if (options.title !== undefined) {
                changes.title = options.title
            }
            if (options.type !== undefined) {
                changes.type = parseMealType(options.type, '--type')
            }
            if (options.details !== undefined) {
                changes.details = options.details
            }
            if (options.instructions !== undefined) {
                changes.instructions = options.instructions
            }
            if (options.image !== undefined) {
                changes.image = options.image
            }
            if (options.ingredients !== undefined) {
                changes.ingredients = parseCommaSeparated(options.ingredients)
            }
            if (options.tags !== undefined) {
                changes.tags = parseCommaSeparated(options.tags)
            }

            if (!Object.keys(changes).length) {
                throw new Error('Nothing to update. Pass at least one field, for example --title or --tags.')
            }

            succeed(
                await updateRecipe(recipeId, changes)
            )
        })

    recipe
        .command('delete')
        .description('Remove a recipe, reporting any upcoming meals that pointed at it')
        .argument('<id>', 'Recipe id')
        .action(async (recipeId: string) => {
            const deleted = await deleteRecipe(recipeId)

            // Planned meals keep only a recipeId, so deleting a recipe leaves them orphaned.
            // The calendar already renders those as "Recipe not found"; surface them instead
            // of cascading, so the caller decides what should happen to each one.
            const orphanedUpcomingPlans = await findUpcomingPlansForRecipe(recipeId)

            succeed({
                deleted,
                orphanedUpcomingPlans
            })
        })
}
