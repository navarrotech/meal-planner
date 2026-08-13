// Copyright © 2024 Navarrotech

// React.js
import { useState } from "react";

// Redux
import { dispatch, useSelector, getState } from "@/store";
import { setDraggingRecipe, setDraggingMeal, selectMeal, setSelectedDropzone } from "@/modules/recipes/reducer";

// Utility
import moment from "moment";

// Typescript
import type { MealType, PlannedMeal } from '@/types'

// Iconography & styles
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import styles from '../calendar.module.sass'
import { createMealPlanFromRecipe, deleteMealPlan } from "../actions";

/**
 * Only the kinds of meal that are worth spotting at a glance carry a colour. Everything else is
 * something cooked at home and stays neutral, which is what makes the exceptions readable.
 */
const styleByRecipeType: Partial<Record<MealType, string>> = {
    restaurants: styles.restaurant
}

type Props = {
    date: typeof moment
    type: MealType
    // The day's meals are subscribed once by the calendar and handed down, so every slot on
    // screen and the shopping list are reading the same records.
    plannedMeals: PlannedMeal[]
}

export default function Dropzone({ date, type, plannedMeals }: Props) {
    const [ isBeingReDragged, setReDragged ] = useState<string>()
    const [ hoveredOver, setHoveredOver ] = useState<boolean>(false)

    const recipesById = useSelector(state => state.recipes.byId)
    const peopleByName = useSelector(state => state.people.byName)

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

                const classes = [ styles.plannedMeal ]
                const recipeStyle = recipe && styleByRecipeType[recipe.type]
                if (recipeStyle){
                    classes.push(recipeStyle)
                }
                if (isBeingReDragged === meal.id){
                    classes.push(styles.reDragged)
                }
                if (meal.needsIngredients){
                    classes.push(styles.needsIngredients)
                }

                // Whose meal it is, shown as a stripe down its edge. The colour has to come
                // from a border rather than the background, which already says whether the
                // meal needs shopping or is being eaten out.
                const person = peopleByName[meal.forWho.toLowerCase()]

                return <div
                    id={key}
                    key={key}
                    draggable
                    style={person ? { borderLeft: `4px solid ${person.color}` } : undefined}
                    title={
                        meal.needsIngredients
                            ? "Still to buy: " + (meal.missingIngredients.join(", ") || "not listed yet")
                            : undefined
                    }
                    className={classes.join(" ")}
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
                    { meal.needsIngredients
                        ? <span className={"icon is-small " + styles.needsIngredientsIcon}>
                            <FontAwesomeIcon icon={faCartShopping} size="xs" />
                        </span>
                        : <></>
                    }
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
