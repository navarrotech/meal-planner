// Copyright © 2024 Navarrotech

// Typescript
import type { Recipe } from "@/types";

// Firebase
import { type Unsubscribe } from '@/firebase';
import { getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { recipesListRef, recipeRef, recipeCoverRef } from './references';
import { onValue, remove, set } from 'firebase/database';

// Utility
import { v4 as uuid } from "uuid";

// Redux
import { dispatch } from "@/store";
import { setRecipes, resetRecipes } from "./reducer";

// Constants
import { maxImageFileSize } from './constants';

let unsubscribe: Unsubscribe | undefined;
export function startRecipes(){
    unsubscribe?.()
    unsubscribe = onValue(
        recipesListRef(),
        (snapshot) => {
            const data = snapshot.val();
            dispatch(
                setRecipes(data || {})
            )
        }
    )
}

export function stopRecipes(){
    unsubscribe?.()
    dispatch(
        resetRecipes()
    )
}

export async function uploadImageToCloud(file: File, progressCallback?: (progress: number) => void): Promise<string> {

    if (!file){
        return '';
    }

    // Max file size check
    if (file.size > maxImageFileSize){
        console.error('File is too large', {
            file,
            fileSize: file.size,
            maxImageFileSize,
            oversize: (file.size / maxImageFileSize) * 100
        });
        return '';
    }

    const storageRef = recipeCoverRef(`${uuid()}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((accept, reject) => {
        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                progressCallback?.(progress);

                switch (snapshot.state) {
                    case 'paused':
                        console.log('Upload is paused');
                        break;
                    case 'running':
                        console.log('Upload is running');
                        break;
                }
            }, 
            (error) => reject(error), 
            () => getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => accept(downloadURL))
        );
    })
}

export function saveRecipe(recipe: Recipe): Promise<void> {
    return set(
        recipeRef(recipe.id),
        recipe
    )
}

export function deleteRecipe(recipe: Recipe): Promise<void> {
    return remove(
        recipeRef(recipe.id)
    )
}
