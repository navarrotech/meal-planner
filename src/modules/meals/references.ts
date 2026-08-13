// Copyright © 2024 Navarrotech

// Typescript
import type { MealType } from '@/types'

// Utility
import { mealDayPath, mealMonthPath, mealPlanPath } from '@/lib/paths'

// Firebase
import { database } from '@/firebase'
import { ref } from 'firebase/database'

// The calendar subscribes a whole month at a time. Watching two months ahead for the shopping
// list costs two listeners this way, where a day at a time would cost sixty.
export const mealMonthRef = (year: string, month: string) =>
    ref(database, mealMonthPath(year, month))

// The calendar subscribes a whole day at a time rather than a slot at a time, so every slot of
// a day arrives on one listener and the day's meals can never be half loaded.
export const mealDayRef = (year: string, month: string, day: string) =>
    ref(database, mealDayPath(year, month, day))

export const mealsSetRef = (year: string, month: string, startDay: string, type: MealType, id: string) =>
    ref(database, mealPlanPath(year, month, startDay, type, id))
