// Copyright © 2024 Navarrotech

// Typescript
import { startRecipes, stopRecipes } from "@/modules/recipes/actions"
import type { Dispatch } from "redux"

export function initialize() {
    // Thunk
    return async (dispatch: Dispatch) => {
        startRecipes()
    }
}

export function reset() {
    // Thunk
    return async (dispatch: Dispatch) => {
        stopRecipes()
    }
}
