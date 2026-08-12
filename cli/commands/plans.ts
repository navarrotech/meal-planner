// Copyright © 2026 Navarrotech

import type { PlanChanges } from '../repository/plans'
import type { Command } from 'commander'

// Core
import {
    createPlan,
    deletePlan,
    getPlan,
    listPlans,
    movePlan,
    updatePlan
} from '../repository/plans'

// Utility
import { DATE_FORMAT, parseCommaSeparated, parseDate, parseMealType } from '../options'
import { buildShoppingList } from '@/lib/shoppingList'
import { succeed } from '../output'

export function registerPlanCommands(program: Command) {
    const plan = program
        .command('plan')
        .description('Manage the schedule: which recipe is eaten on which day, in which slot')

    plan
        .command('list')
        .description('List planned meals across a date range, with recipe titles resolved')
        .requiredOption('--from <date>', `Start of the range, ${DATE_FORMAT}`)
        .requiredOption('--to <date>', `End of the range, inclusive, ${DATE_FORMAT}`)
        .option('--type <type>', 'Only meals in this slot')
        .option('--for-who <name>', 'Only meals planned for this person')
        .action(async (options) => {
            const plans = await listPlans(
                parseDate(options.from, '--from'),
                parseDate(options.to, '--to'),
                {
                    type: options.type
                        ? parseMealType(options.type, '--type')
                        : undefined,
                    forWho: options.forWho
                }
            )

            succeed(plans)
        })

    plan
        .command('shopping-list')
        .description('What still has to be bought for the meals planned across a date range')
        .requiredOption('--from <date>', `Start of the range, ${DATE_FORMAT}`)
        .requiredOption('--to <date>', `End of the range, inclusive, ${DATE_FORMAT}`)
        .option('--for-who <name>', 'Only meals planned for this person')
        .action(async (options) => {
            const plans = await listPlans(
                parseDate(options.from, '--from'),
                parseDate(options.to, '--to'),
                {
                    forWho: options.forWho
                }
            )

            succeed(
                buildShoppingList(plans)
            )
        })

    plan
        .command('get')
        .description('Fetch a single planned meal')
        .argument('<id>', 'Planned meal id')
        .requiredOption('--date <date>', `The day it is planned for, ${DATE_FORMAT}`)
        .option('--type <type>', 'Its slot, which narrows the lookup but is not required')
        .action(async (planId: string, options) => {
            const date = parseDate(options.date, '--date')
            const found = await getPlan(
                planId,
                date,
                options.type
                    ? parseMealType(options.type, '--type')
                    : undefined
            )

            if (!found) {
                throw new Error(
                    `No planned meal with id "${planId}" on ${options.date}. `
                    + 'Run "plan list" over the range to find its date.'
                )
            }

            succeed(found)
        })

    plan
        .command('create')
        .description('Schedule a recipe on a day')
        .requiredOption('--recipe <id>', 'Recipe id, from "recipe list"')
        .requiredOption('--date <date>', `The day to plan it for, ${DATE_FORMAT}`)
        .requiredOption('--type <type>', 'Which slot it fills')
        .option('--for-who <name>', 'Who this one is for, when the household eats differently')
        .option('--notes <text>', 'Notes, up to 1024 characters')
        .option('--needs-ingredients', 'Mark it as waiting on a trip to the store')
        .option('--missing <list>', 'Comma-separated ingredients still to buy, which implies --needs-ingredients')
        .action(async (options) => {
            const missingIngredients = options.missing
                ? parseCommaSeparated(options.missing)
                : undefined

            const created = await createPlan({
                recipeId: options.recipe,
                date: parseDate(options.date, '--date'),
                type: parseMealType(options.type, '--type'),
                forWho: options.forWho,
                notes: options.notes,
                // Naming what to buy is the same statement as marking the meal, so it is not
                // possible to end up with a list that the calendar never warns about.
                needsIngredients: Boolean(options.needsIngredients || missingIngredients?.length),
                missingIngredients
            })

            succeed(created)
        })

    plan
        .command('update')
        .description('Change a planned meal in place, leaving its day and slot alone')
        .argument('<id>', 'Planned meal id')
        .requiredOption('--date <date>', `The day it is currently planned for, ${DATE_FORMAT}`)
        .option('--type <type>', 'Its current slot, which narrows the lookup but is not required')
        .option('--recipe <id>', 'Swap in a different recipe')
        .option('--for-who <name>', 'Who this one is for')
        .option('--notes <text>', 'Notes, up to 1024 characters')
        .option('--needs-ingredients', 'Mark it as waiting on a trip to the store')
        .option('--no-needs-ingredients', 'Clear that mark, once the shopping is done')
        .option('--missing <list>', 'Comma-separated ingredients still to buy, replacing the current list')
        .option('--to-date <date>', 'Not accepted here, see "plan move"')
        .option('--to-type <type>', 'Not accepted here, see "plan move"')
        .action(async (planId: string, options) => {
            if (options.toDate || options.toType) {
                throw new Error(
                    'Changing the day or slot relocates the meal rather than editing it. Use "plan move".'
                )
            }

            // Only fields that were actually passed may appear, because an undefined value
            // spread over the stored meal would erase it rather than leave it alone.
            const changes: PlanChanges = {}

            if (options.recipe !== undefined) {
                changes.recipeId = options.recipe
            }
            if (options.forWho !== undefined) {
                changes.forWho = options.forWho
            }
            if (options.notes !== undefined) {
                changes.notes = options.notes
            }
            if (options.needsIngredients !== undefined) {
                changes.needsIngredients = options.needsIngredients
            }
            if (options.missing !== undefined) {
                changes.missingIngredients = parseCommaSeparated(options.missing)

                // A list without the mark would never reach the calendar or the shopping list,
                // so naming ingredients turns the mark on unless it was explicitly cleared.
                if (changes.missingIngredients.length && options.needsIngredients === undefined) {
                    changes.needsIngredients = true
                }
            }

            if (!Object.keys(changes).length) {
                throw new Error(
                    'Nothing to update. Pass at least one of --recipe, --for-who, --notes, '
                    + '--needs-ingredients or --missing.'
                )
            }

            succeed(
                await updatePlan(
                    planId,
                    parseDate(options.date, '--date'),
                    options.type
                        ? parseMealType(options.type, '--type')
                        : undefined,
                    changes
                )
            )
        })

    plan
        .command('move')
        .description('Move a planned meal to another day or slot, keeping its id and details')
        .argument('<id>', 'Planned meal id')
        .requiredOption('--date <date>', `The day it is currently planned for, ${DATE_FORMAT}`)
        .option('--type <type>', 'Its current slot, which narrows the lookup but is not required')
        .option('--to-date <date>', `The day to move it to, ${DATE_FORMAT}`)
        .option('--to-type <type>', 'The slot to move it into')
        .action(async (planId: string, options) => {
            if (!options.toDate && !options.toType) {
                throw new Error('Nothing to move. Pass --to-date, --to-type, or both.')
            }

            succeed(
                await movePlan(
                    planId,
                    parseDate(options.date, '--date'),
                    options.type
                        ? parseMealType(options.type, '--type')
                        : undefined,
                    options.toDate
                        ? parseDate(options.toDate, '--to-date')
                        : undefined,
                    options.toType
                        ? parseMealType(options.toType, '--to-type')
                        : undefined
                )
            )
        })

    plan
        .command('delete')
        .description('Remove a planned meal from the schedule')
        .argument('<id>', 'Planned meal id')
        .requiredOption('--date <date>', `The day it is planned for, ${DATE_FORMAT}`)
        .option('--type <type>', 'Its slot, which narrows the lookup but is not required')
        .action(async (planId: string, options) => {
            succeed(
                await deletePlan(
                    planId,
                    parseDate(options.date, '--date'),
                    options.type
                        ? parseMealType(options.type, '--type')
                        : undefined
                )
            )
        })
}
