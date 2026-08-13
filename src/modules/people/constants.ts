// Copyright © 2026 Navarrotech

import type { Person } from "@/types";

import { v4 as uuid } from "uuid";

/**
 * Handed out in order as people are added, so nobody has to pick a colour to get one, and so no
 * two people start out the same. They are picked to stay legible against the calendar's dark
 * meals, and to survive being read next to each other in a narrow column.
 */
export const PERSON_COLORS = [
    "#1AA0BD", // teal
    "#E8734A", // orange
    "#57C785", // green
    "#C062D9", // violet
    "#E4C441", // gold
    "#4A7BE8", // blue
    "#E85A8A", // pink
    "#8C9EA8"  // slate
] as const

export function makeNewPerson(name: string, takenColors: string[]): Person {
    const nextColor = PERSON_COLORS.find(
        (color) => !takenColors.includes(color)
    )

    return {
        id: uuid(),
        name: name.trim(),
        // Everyone gets a colour eventually, so a household larger than the palette starts
        // reusing it rather than being left without one.
        color: nextColor || PERSON_COLORS[takenColors.length % PERSON_COLORS.length]
    }
}
