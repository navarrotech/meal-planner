// Copyright © 2026 Navarrotech

// Typescript
import type { Person } from "@/types"

// Firebase
import { type Unsubscribe } from '@/firebase'
import { onValue, remove, set } from 'firebase/database'
import { peopleListRef, personRef } from './references'

// Redux
import { dispatch } from "@/store"
import { setPeople, resetPeople } from "./reducer"

let unsubscribe: Unsubscribe | undefined

export function startPeople(){
    unsubscribe?.()
    unsubscribe = onValue(
        peopleListRef(),
        (snapshot) => {
            dispatch(
                setPeople(snapshot.val() || {})
            )
        }
    )
}

export function stopPeople(){
    unsubscribe?.()
    dispatch(
        resetPeople()
    )
}

export function savePerson(person: Person): Promise<void> {
    return set(
        personRef(person.id),
        person
    )
}

/**
 * Deleting a person leaves the meals planned for them alone, exactly as deleting a recipe leaves
 * its planned meals alone. Those meals keep the name they were written with and simply lose their
 * colour, which is recoverable by adding the person back, where rewriting months of history is not.
 */
export function deletePerson(person: Person): Promise<void> {
    return remove(
        personRef(person.id)
    )
}
