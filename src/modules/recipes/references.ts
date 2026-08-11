// Copyright © 2024 Navarrotech

// Utility
import { recipesPath, recipePath } from '@/lib/paths'

// Firebase
import { database, firebaseStorage } from '@/firebase'
import { ref as databaseRef } from 'firebase/database'
import { ref as StorageRef } from 'firebase/storage'

export const recipesListRef = () => databaseRef(database, recipesPath)
export const recipeRef = (id: string) => databaseRef(database, recipePath(id))
export const recipeCoverRef = (filename: string) => StorageRef(firebaseStorage, `recipes/images/${filename}`)
