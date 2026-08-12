// Copyright © 2024 Navarrotech

// Typescript
import type { MealType } from '@/types'

// Utility
import moment from 'moment'
import { mealDayPath, mealPlanPath, mealPlanPathParts } from '@/lib/paths'

// Firebase
import { database } from '@/firebase'
import { ref } from 'firebase/database'

// The calendar subscribes a whole day at a time rather than a slot at a time, so every slot of
// a day arrives on one listener and the day's meals can never be half loaded.
export const mealDayRef = (year: string, month: string, day: string) =>
    ref(database, mealDayPath(year, month, day))

export const mealsSetRef = (year: string, month: string, startDay: string, type: MealType, id: string) =>
    ref(database, mealPlanPath(year, month, startDay, type, id))

export const todaysMealsRef = () => {
    const { year, month, day } = mealPlanPathParts(moment())
    return mealDayRef(year, month, day)
}
