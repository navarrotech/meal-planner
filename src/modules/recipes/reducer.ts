// Copyright © 2024 Navarrotech

// Redux
import { createSlice } from "@reduxjs/toolkit"

// Typescript
import type { PayloadAction } from "@reduxjs/toolkit"
import type { MealType, PlannedMeal, Recipe } from "@/types"

// Utility
import moment from "moment"

type SelectedDropzone = {
    date: typeof moment
    type: MealType
}

export type State = {
    byId: Record<string, Recipe>
    byType: Record<MealType, Recipe[]>
    keys: string[]
    draggingRecipe: Recipe | null
    draggingMeal: PlannedMeal | null
    selectedMeal: PlannedMeal | null
    selectedDropzone: null | SelectedDropzone
}

const initialState: State = {
    draggingRecipe: null,
    draggingMeal: null,
    selectedMeal: null,
    selectedDropzone: null,
    byType: {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
        sides: [],
        restaurants: [],
        drinks: [],
    },
    byId: {},
    keys: [],
}

const slice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    setRecipes(state, action: PayloadAction<Record<string, Recipe>>){
        const values = Object.values(action.payload)
        state.keys = Object.keys(action.payload)
        state.byId = action.payload

        const byType = Object.keys(initialState.byType).reduce((acc, type) => {
            acc[type as MealType] = []
            return acc
        }, {} as Record<MealType, Recipe[]>)

        values.forEach(recipe => {
            byType[recipe.type].push(recipe)
        })

        state.byType = byType

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
    selectMeal(state, action: PayloadAction<PlannedMeal | null>){
        state.selectedMeal = action.payload
        return state
    },
    setSelectedDropzone(state, action: PayloadAction<SelectedDropzone | null>){
        state.selectedDropzone = action.payload
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
    selectMeal,
    setSelectedDropzone,
} = slice.actions

export default slice;
