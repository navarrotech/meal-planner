// Copyright © 2024 Navarrotech

import { createSlice } from "@reduxjs/toolkit"

// Typescript
import type { PayloadAction } from "@reduxjs/toolkit"
import type { Recipe } from "@/types"

export type State = {
    byId: Record<string, Recipe>
    keys: string[]
}

const initialState: State = {
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
    resetRecipes: () => initialState,
  }
})

export const {
    setRecipes,
    resetRecipes,
} = slice.actions

export default slice;
