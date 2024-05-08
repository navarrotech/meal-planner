// Copyright © 2024 Navarrotech

import { database, firebaseStorage } from '@/firebase'
import { ref as databaseRef } from 'firebase/database'
import { ref as StorageRef } from 'firebase/storage'

export const recipesListRef = () => databaseRef(database, 'recipes/')
export const recipeRef = (id: string) => databaseRef(database, `recipes/${id}`)
export const recipeCoverRef = (filename: string) => StorageRef(firebaseStorage, `recipes/images/${filename}`)
