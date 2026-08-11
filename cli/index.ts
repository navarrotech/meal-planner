// Copyright © 2026 Navarrotech

// Core
import { Command } from 'commander'
import { registerPlanCommands } from './commands/plans'
import { registerRecipeCommands } from './commands/recipes'

// Utility
import { fail } from './output'

// Written as whole paragraphs so commander can wrap them to the terminal width itself.
const DESCRIPTION = [
    'Read and write the family meal planner directly, without the web app.',
    'Two things are managed here. A recipe is a meal the household knows how to make. A plan is one'
        + ' recipe scheduled into one slot on one day, so the same recipe can be planned many times, and'
        + ' one day can hold several plans when people eat differently.',
    'Every command prints {"ok":true,"data":...} or {"ok":false,"error":...} on stdout, and exits'
        + ' non-zero on failure.'
].join('\n\n')

async function main() {
    const program = new Command()

    program
        .name('meals')
        .description(DESCRIPTION)
        .showHelpAfterError()

    registerRecipeCommands(program)
    registerPlanCommands(program)

    await program.parseAsync(process.argv)
}

main().catch(fail)
