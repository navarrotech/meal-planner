// Copyright © 2024 Navarrotech

// Typescript
import type { MealType } from '@/types'

// Utility
import moment from 'moment'
import { mealDayPath, mealSlotPath, mealPlanPath, mealPlanPathParts } from '@/lib/paths'

// Firebase
import { database } from '@/firebase'
import { ref } from 'firebase/database'

export const mealsListRef = (year: string, month: string, startDay: string, type: MealType) =>
    ref(database, mealSlotPath(year, month, startDay, type))

export const mealsSetRef = (year: string, month: string, startDay: string, type: MealType, id: string) =>
    ref(database, mealPlanPath(year, month, startDay, type, id))

export const todaysMealsRef = () => {
    const { year, month, day } = mealPlanPathParts(moment())
    return ref(database, mealDayPath(year, month, day))
}
