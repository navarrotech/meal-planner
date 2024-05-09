// Copyright © 2024 Navarrotech

import Modal from "@/common/Modal"
import RecipesList from "@/modules/recipes/components/RecipesList"
import { setSelectedDropzone } from "@/modules/recipes/reducer"
import { dispatch, useSelector } from "@/store"
import { createMealPlanFromRecipe } from "../actions"

export default function AddToDropzone(){
    const selectedDropzone = useSelector((state) => state.recipes.selectedDropzone)

    if (!selectedDropzone){
        return <></>
    }

    function onClose(){
        dispatch(setSelectedDropzone(null))
    }

    return <Modal
        show
        title={`Add to ${selectedDropzone.type} on ${selectedDropzone.date.format("MMM Do (dddd)")}`}
        actions={[]}
        onClose={onClose}
    >
        <div className="field">
            <div className="control">
                <RecipesList
                    onClick={(recipe) => {
                        createMealPlanFromRecipe(
                            selectedDropzone.date,
                            selectedDropzone.type,
                            recipe
                        )
                        onClose()
                    }}
                />
            </div>
        </div>
    </Modal>
}