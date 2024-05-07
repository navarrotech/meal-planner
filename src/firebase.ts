// Copyright © 2023 Navarrotech

import firebaseJson from "../firebase.json";

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage, ref } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

export const firebaseConfig = firebaseJson;

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAnalytics = getAnalytics(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);
export const storageRef = (path?: string) => ref(firebaseStorage, path);

// Authentication
export const auth = getAuth();

export const GoogleAuth = new GoogleAuthProvider();
// GoogleAuth.addScope('https://www.googleapis.com/auth/email.readonly');


export * from "firebase/auth";
export * from "firebase/storage";
