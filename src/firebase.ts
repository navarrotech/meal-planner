// Copyright © 2024 Navarrotech

import firebaseConfig from "../firebase-credentials.json"

import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
import { getStorage, ref } from "firebase/storage"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getDatabase } from "firebase/database"

export const firebaseApp = initializeApp(firebaseConfig)
export const firebaseAnalytics = getAnalytics(firebaseApp)
export const firebaseStorage = getStorage(firebaseApp)
export const storageRef = (path?: string) => ref(firebaseStorage, path)
export const database = getDatabase(firebaseApp)

// Authentication
export const auth = getAuth()

export const GoogleAuth = new GoogleAuthProvider()
// GoogleAuth.addScope('https://www.googleapis.com/auth/email.readonly')

export * from "firebase/auth"
export * from "firebase/storage"
