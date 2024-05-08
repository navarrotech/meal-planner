// Copyright © 2024 Navarrotech

import { createSlice } from "@reduxjs/toolkit"

// Typescript
import type { PayloadAction } from "@reduxjs/toolkit"
import type { PlannedMeal, Recipe } from "@/types"

export type State = {
    byId: Record<string, Recipe>
    keys: string[]
    draggingRecipe: Recipe | null
    draggingMeal: PlannedMeal | null
}

const initialState: State = {
    draggingRecipe: null,
    draggingMeal: null,
    byId: {},
    keys: [],
}

const slice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setRecipes(state, action: PayloadAction<Record<string, Recipe>>){
        state.keys = Object.keys(action.payload)
        state.byId = action.payload
        return state
    },
    setDraggingRecipe(state, action: PayloadAction<Recipe | null>){
        state.draggingRecipe = action.payload
        return state
    },
    setDraggingMeal(state, action: PayloadAction<PlannedMeal | null>){
        state.draggingMeal = action.payload
        return state
    },
    resetRecipes: () => initialState,
  }
})

export const {
    setRecipes,
    resetRecipes,
    setDraggingRecipe,
    setDraggingMeal,
} = slice.actions

export default slice;
