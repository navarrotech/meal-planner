// Copyright © 2024 Navarrotech

// React.js
import { useEffect, useState } from "react";

// Typescript
import type { Recipe } from "@/types";

// Utility
import { recipeSchema } from "../validators";
import { saveRecipe, deleteRecipe } from "../actions";

// Components
import RecipeModalBody from "./RecipeModalBody";
import Modal from "@/common/Modal";

type Props = {
    recipe: Recipe
    onClose: () => void
}

export default function EditRecipe({ recipe: initialRecipe, onClose }: Props) {
    const [ loading, setLoading ] = useState<boolean>(false)
    const [ isValid, setIsValid ] = useState<boolean>(false)
    const [ recipe, setRecipe ] = useState<Recipe>(initialRecipe)

    useEffect(() => {
        recipeSchema
            .isValid(recipe)
            .then((result) => {
                setIsValid(result)
            })
            .catch((error) => {
                console.error(error)
                setIsValid(false)
            })

    }, [ recipe ])

    return <Modal
        show
        title="Add Recipe"
        onClose={onClose}
        actions={[
            {
                text: "Cancel",
                color: "default",
                closeAfterOnClick: true
            },
            {
                loading,
                text: "Delete",
                color: "danger",
                closeAfterOnClick: true,
                onClick: async () => {
                    setLoading(true)
                    await deleteRecipe(recipe)
                    setLoading(false)
                }
            },
            {
                loading,
                text: "Update",
                color: "success",
                disabled: !isValid,
                closeAfterOnClick: true,
                onClick: async () => {
                    setLoading(true)
                    await saveRecipe(recipe)
                    setLoading(false)
                }
            }
        ]}
    >
        <RecipeModalBody
            recipe={recipe}
            onChange={setRecipe}
            disabled={loading}
        />
    </Modal>
}
