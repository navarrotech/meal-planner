// Copyright © 2026 Navarrotech

// Utility
import { ValidationError } from 'yup'

/**
 * Every command answers on stdout with the same envelope, so a caller can parse the result
 * without knowing which command produced it. Anything that is not the result, including
 * Firebase's own logging, belongs on stderr.
 */

export function succeed(data: unknown): never {
    process.stdout.write(JSON.stringify({ ok: true, data }, null, 2) + '\n')
    process.exit(0)
}

export function fail(error: unknown): never {
    let message = String(error)

    if (error instanceof ValidationError) {
        message = error.errors.join('; ')
    }
    else if (error instanceof Error) {
        message = error.message
    }

    process.stdout.write(JSON.stringify({ ok: false, error: message }, null, 2) + '\n')
    process.exit(1)
}
