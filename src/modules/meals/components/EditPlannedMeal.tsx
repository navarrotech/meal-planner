// Copyright © 2024 Navarrotech

// React.js
import { useState, useEffect } from "react";

// Typescript
import type { PlannedMeal } from "@/types";

// Redux
import { useSelector, dispatch } from "@/store";
import { selectMeal } from "@/modules/recipes/reducer";

// Utility
import { deleteMealPlan, updateMealPlan } from "../actions";
import { googleCalendarEventUrl } from "../googleCalendar";
import { mealPlanSchema } from '../validators'

// Iconography
import { faCalendarPlus } from "@fortawesome/free-solid-svg-icons";

// Components
import Modal from "@/common/Modal";
import NeedsIngredients from "./NeedsIngredients";
import RecipeChooser from "@/modules/recipes/components/RecipeChooser";

export default function EditPlannedMeal() {
    const selectedMeal = useSelector(state => state.recipes.selectedMeal)
    const recipesById = useSelector(state => state.recipes.byId)
    const [ isLoading, setLoading ] = useState<boolean>(false)
    const [ isValid, setValid ] = useState<boolean>(false)

    function onChange(newKeys: Partial<PlannedMeal>){
        dispatch(
            selectMeal({
                ...selectedMeal,
                ...newKeys
            } as PlannedMeal)
        )
    }

    useEffect(() => {
        mealPlanSchema.isValid(selectedMeal).then(setValid)
    }, [ selectedMeal ])

    if (!selectedMeal){
        return <></>;
    }

    async function save(){
        setLoading(true)
        try {
            await updateMealPlan(selectedMeal!)
            dispatch(selectMeal(null))
        } catch (e){
            console.error(e)
        }
        setLoading(false)
    }

    function onKeyDown(e: React.KeyboardEvent){
        if (e.key === "Enter" && isValid){
            return save()
        }
        if (e.key === "Escape"){
            dispatch(selectMeal(null))
        }
    }

    return <Modal
        show
        title="Edit Planned Meal"
        onClose={() => dispatch(selectMeal(null))}
        actions={[
            {
                // Exports what is on screen, unsaved edits included, since Google Calendar
                // opens its own editor and nothing is created until the user saves it there.
                text: "Add to Google Calendar",
                color: "info",
                icon: faCalendarPlus,
                href: googleCalendarEventUrl(
                    selectedMeal,
                    recipesById[selectedMeal.recipeId]
                )
            },
            {
                text: "Cancel",
                color: "default",
                closeAfterOnClick: true
            },
            {
                text: "Remove",
                color: "danger",
                closeAfterOnClick: true,
                onClick: async () => {
                    try {
                        deleteMealPlan(selectedMeal)
                        selectMeal(null)
                    } catch (e){
                        console.error(e)
                    }
                }
            },
            {
                text: "Update",
                color: "success",
                disabled: !isValid,
                loading: isLoading,
                closeAfterOnClick: true,
                onClick: save
            }
        ]}
    >
        <div className="field fancy-label">
            <label className="label">This meal is for:</label>
            <div className="control">
                <input
                    autoFocus
                    className="input"
                    type="text"
                    value={selectedMeal.forWho}
                    placeholder="Anakin Skywalker"
                    onChange={(e) => onChange({ forWho: e.target.value })}
                    onKeyDown={onKeyDown}
                />
            </div>
        </div>

        <RecipeChooser
            isFullwidth
            label="Recipe"
            className="fancy-label"
            value={selectedMeal.recipeId}
            onChange={(recipeId) => onChange({ recipeId })}
        />
        
        <div className="field fancy-label">
            <label className="label">Notes</label>
            <div className="control">
                <textarea
                    className="textarea"
                    placeholder="(Optional) notes"
                    value={selectedMeal.notes}
                    onChange={(e) => onChange({ notes: e.target.value })}
                    onKeyDown={onKeyDown}
                />
            </div>
        </div>

        <NeedsIngredients
            needsIngredients={selectedMeal.needsIngredients}
            missingIngredients={selectedMeal.missingIngredients}
            suggestions={recipesById[selectedMeal.recipeId]?.ingredients || []}
            onChange={onChange}
        />
    </Modal>
}
