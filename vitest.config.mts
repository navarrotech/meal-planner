// Copyright © 2026 Navarrotech

import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    test: {
        environment: 'node',
        include: [ 'src/**/*.test.ts', 'cli/**/*.test.ts' ]
    }
})
