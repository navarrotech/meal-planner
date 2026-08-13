// Copyright © 2024 Navarrotech

// Typescript
import { startRecipes, stopRecipes } from "@/modules/recipes/actions"
import { startPeople, stopPeople } from "@/modules/people/actions"

export function initialize() {
    // Thunk
    return async () => {
        startRecipes()
        startPeople()
    }
}

export function reset() {
    // Thunk
    return async () => {
        stopRecipes()
        stopPeople()
    }
}
