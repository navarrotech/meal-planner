// Copyright © 2026 Navarrotech

// Redux
import { createSlice } from "@reduxjs/toolkit"

// Typescript
import type { PayloadAction } from "@reduxjs/toolkit"
import type { Person } from "@/types"

export type State = {
    // Sorted by name, which is the order every list of people is shown in.
    list: Person[]

    /**
     * Keyed by lowercased name, because a planned meal refers to a person by the name it was
     * written with. Matching loosely here is what lets "Family" and "family" be one person.
     */
    byName: Record<string, Person>
}

const initialState: State = {
    list: [],
    byName: {}
}

const slice = createSlice({
    name: 'people',
    initialState,
    reducers: {
        setPeople(state, action: PayloadAction<Record<string, Person>>){
            const list = Object.values(action.payload)
                .sort((left, right) => left.name.localeCompare(right.name))

            const byName: Record<string, Person> = {}
            for (const person of list){
                byName[person.name.toLowerCase()] = person
            }

            state.list = list
            state.byName = byName

            return state
        },
        resetPeople: () => initialState,
    }
})

export const {
    setPeople,
    resetPeople,
} = slice.actions

export default slice;
