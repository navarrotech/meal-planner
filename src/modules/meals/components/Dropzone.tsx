// Copyright © 2024 Navarrotech

// React.js
import { useState } from "react";

// Redux
import { dispatch, useSelector, getState } from "@/store";
import { setDraggingRecipe, setDraggingMeal, selectMeal, setSelectedDropzone } from "@/modules/recipes/reducer";

// Utility
import moment from "moment";

// Typescript
import type { MealType } from '@/types'

// Styling
import styles from '../calendar.module.sass'
import { createMealPlanFromRecipe, deleteMealPlan } from "../actions";
import { useMealPlans } from "../hooks";

type Props = {
    date: typeof moment
    type: MealType
}

export default function Dropzone({ date, type }: Props) {
    const [ isBeingReDragged, setReDragged ] = useState<string>()
    const [ hoveredOver, setHoveredOver ] = useState<boolean>(false)

    const recipesById = useSelector(state => state.recipes.byId)
    
    // Get the planned meals for the day
    const [ year, month, day ] = date.format("YYYY-MMMM-DD").split("-")
    const plannedMeals = useMealPlans(year, month, day, type);

    return <div
        data-key="dropzone"
        className={`${styles.dropZone} ${hoveredOver ? styles.hoveredOver : ''}`}
        onClick={(e) => {
            const target = e.target as HTMLDivElement
            if (target?.getAttribute("data-key") !== "dropzone"){
                return;
            }
            dispatch(
                setSelectedDropzone({
                    date,
                    type
                })
            )
        }}
        onDragOver={(e) => {
            e.preventDefault()
            if (!hoveredOver){
                setHoveredOver(true)
            }
        }}
        onDragLeave={(e) => {
            e.preventDefault()
            setHoveredOver(false)
        }}
        onDrop={(e) => {
            e.preventDefault()
            setHoveredOver(false)

            const state = getState()
            const draggingRecipe = state.recipes.draggingRecipe
            const draggingMeal = state.recipes.draggingMeal

            if (draggingMeal){
                deleteMealPlan(draggingMeal)

                const draggedRecipe = recipesById[draggingMeal.recipeId]
                if (draggedRecipe){
                    createMealPlanFromRecipe(
                        date,
                        type,
                        draggedRecipe,
                        draggingMeal.forWho,
                        draggingMeal.notes
                    )
                }
                return;
            }

            if (draggingRecipe === null) {
                return;
            }
            
            createMealPlanFromRecipe(date, type, draggingRecipe)
            dispatch(
                setDraggingRecipe(null)
            )
        }}
    >
        <p className="has-text-centered is-capitalized">{ type }</p>
        <div>{
            plannedMeals.map((meal, index) => {
                const recipe = recipesById[meal.recipeId]
                const key = meal.id + "-" + index
                return <div
                    id={key}
                    key={key}
                    draggable
                    className={`${styles.plannedMeal} ${isBeingReDragged === meal.id ? styles.reDragged : ''}`}
                    onClick={() => {
                        dispatch(
                            selectMeal(meal)
                        )
                    }}
                    onDragStart={() => {
                        dispatch(
                            setDraggingMeal(meal)
                        )
                        setReDragged(meal.id)
                    }}
                    onDragExit={(e) => {
                        e.preventDefault()
                    }}
                    onDragEnd={() => {
                        dispatch(
                            setDraggingMeal(null)
                        )
                        setReDragged("")
                    }}
                >
                    { meal.forWho
                        ? <>    
                            <strong className="is-hidden-desktop">{ meal.forWho.slice(0, 1) }: </strong>
                            <strong className="is-hidden-touch">{ meal.forWho }: </strong>
                        </>
                        : <></>
                    }
                    <span>{ recipe ? recipe.title : "Recipe not found" }</span>
                </div>
            })
        }</div>
    </div>
}
