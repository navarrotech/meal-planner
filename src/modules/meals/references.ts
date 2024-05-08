// Copyright © 2024 Navarrotech

// Typescript
import type { MealType } from '@/types'

// Firebase
import { database } from '@/firebase'
import { ref } from 'firebase/database'

export const mealsListRef = (year: string, month: string, startDay: string, type: MealType) => ref(database, `meals/${year}/${month}/${startDay}/${type}`)
export const mealsSetRef = (year: string, month: string, startDay: string, type: MealType, id: string) => ref(database, `meals/${year}/${month}/${startDay}/${type}/${id}`)