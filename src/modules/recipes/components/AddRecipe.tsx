// Copyright © 2024 Navarrotech

// React.js
import { useEffect, useState } from "react";

// Typescript
import type { Recipe } from "@/types";

// Iconography
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPlus } from "@fortawesome/free-solid-svg-icons";

// Utility
import { recipeSchema } from "../validators";
import { saveRecipe } from "../actions";

// Components
import RecipeModalBody from "./RecipeModalBody";
import Button from "@/common/Button";
import Modal from "@/common/Modal";

// Constants
import { makeNewRecipe } from "../constants";

export default function AddRecipe() {
    const [ loading, setLoading ] = useState<boolean>(false)
    const [ isValid, setIsValid ] = useState<boolean>(false)
    const [ showModal, setShowModal ] = useState<boolean>(false)
    const [ recipe, setRecipe ] = useState<Recipe>(makeNewRecipe())

    useEffect(() => {
        if (!showModal){
            setRecipe(
                makeNewRecipe()
            )
        }
    }, [ showModal ])

    useEffect(() => {
        if (!showModal) {
            setIsValid(false)
            return;
        }

        recipeSchema
            .isValid(recipe)
            .then((result) => {
                setIsValid(result)
            })
            .catch((error) => {
                console.error(error)
                setIsValid(false)
            })

    }, [ showModal, recipe ])

    return <div className="block">
        <Button
            color="primary"
            fullwidth
            onClick={() => setShowModal(true)}
        >
            <span>Add Recipe</span>
            <span className="icon">
                <FontAwesomeIcon icon={faPlus} />
            </span>
        </Button>
        <Modal
            show={showModal}
            title="Add A New Recipe"
            onClose={() => setShowModal(false)}
            actions={[
                {
                    text: "Cancel",
                    color: "default",
                    closeAfterOnClick: true
                },
                {
                    loading,
                    text: "Create Recipe",
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
    </div>
}
