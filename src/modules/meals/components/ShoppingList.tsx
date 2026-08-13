// Copyright © 2026 Navarrotech

// React.js
import { useState } from "react";

// Typescript
import type { PlannedMeal, Recipe } from "@/types";

// Redux
import { useSelector } from "@/store";

// Utility
import moment from "moment";
import { buildShoppingList } from "@/lib/shoppingList";
import { markIngredientBought, markIngredientNeeded, updateMealPlan } from "../actions";

// Components
import Modal from "@/common/Modal";

/**
 * What was ticked off during this trip. Ticking writes the change away immediately, so the item
 * would otherwise vanish from the list mid-shop; remembering it here keeps it on screen, struck
 * through, where it can be put back if it was ticked by mistake.
 *
 * Meals are remembered by id rather than by value, because the record moves on the moment the
 * write lands and a stale copy put back later would undo whatever happened in between.
 */
type BoughtItem = {
    ingredient: string
    mealIds: string[]
}

type Props = {
    // Every meal in the span, marked or not. Filtering is the shopping list's own job.
    meals: PlannedMeal[]

    // The span those meals came from, which reaches well past the week on screen.
    from: typeof moment
    through: typeof moment

    onClose: () => void
}

export default function ShoppingList(props: Props) {
    const recipesById = useSelector(state => state.recipes.byId)
    const [ bought, setBought ] = useState<BoughtItem[]>([])
    const [ settledMealIds, setSettledMealIds ] = useState<string[]>([])

    const { entries, mealsWithNothingListed } = buildShoppingList(props.meals)

    function describeMeal(meal: PlannedMeal){
        const recipe: Recipe | undefined = recipesById[meal.recipeId]
        const forWho = meal.forWho ? ` for ${meal.forWho}` : ""

        return `${moment(meal.date).format("ddd MMM Do")}, ${meal.type}: ${recipe ? recipe.title : "Recipe not found"}${forWho}`
    }

    // One row per thing to buy, ticked and unticked together, in one alphabetical run so an item
    // does not jump to the bottom of the list the moment it goes in the trolley.
    const rows = [
        ...entries.map((entry) => ({
            ingredient: entry.ingredient,
            meals: entry.meals,
            isBought: false
        })),
        ...bought.map((item) => ({
            ingredient: item.ingredient,
            meals: props.meals.filter((meal) => item.mealIds.includes(meal.id)),
            isBought: true
        }))
    ].sort((left, right) => left.ingredient.localeCompare(right.ingredient))

    const unnamedMeals = [
        ...mealsWithNothingListed,
        ...props.meals.filter((meal) => settledMealIds.includes(meal.id))
    ]

    return <Modal
        show
        title="Shopping list"
        onClose={props.onClose}
        actions={[
            {
                text: "Done",
                color: "primary",
                closeAfterOnClick: true
            }
        ]}
    >
        <p className="is-size-7 mb-4">
            Everything planned from { props.from.format("MMM Do") } to { props.through.format("MMM Do") }, not
            just the week on screen. Ticking an item takes it off the meals waiting for it.
        </p>

        { rows.length || unnamedMeals.length
            ? <div className="content">
                <ul className="ml-0">{
                    rows.map((row) => <li key={row.ingredient.toLowerCase()}>
                        <label className="checkbox">
                            <input
                                type="checkbox"
                                checked={row.isBought}
                                onChange={({ target: { checked } }) => {
                                    if (checked){
                                        markIngredientBought(row.meals, row.ingredient)
                                        setBought((current) => [
                                            ...current,
                                            {
                                                ingredient: row.ingredient,
                                                mealIds: row.meals.map((meal) => meal.id)
                                            }
                                        ])
                                        return
                                    }

                                    markIngredientNeeded(row.meals, row.ingredient)
                                    setBought((current) => current.filter(
                                        (item) => item.ingredient !== row.ingredient
                                    ))
                                }}
                            />
                            <strong className={"ml-2 " + (row.isBought ? "has-text-weight-normal is-line-through" : "")}>{
                                row.ingredient
                            }</strong>
                        </label>
                        { row.isBought
                            ? <></>
                            : <ul>{
                                row.meals.map((meal) => <li key={meal.id} className="is-size-7">{
                                    describeMeal(meal)
                                }</li>)
                            }</ul>
                        }
                    </li>)
                }</ul>

                { unnamedMeals.length
                    ? <>
                        <p className="mb-2">Marked, but nothing named yet:</p>
                        <ul className="ml-0">{
                            unnamedMeals.map((meal) => <li key={meal.id}>
                                <label className="checkbox is-size-7">
                                    <input
                                        type="checkbox"
                                        checked={settledMealIds.includes(meal.id)}
                                        onChange={({ target: { checked } }) => {
                                            // Nothing was named, so there is nothing to cross
                                            // off: ticking says the meal is sorted.
                                            updateMealPlan({
                                                ...meal,
                                                needsIngredients: !checked
                                            })
                                            setSettledMealIds((current) => checked
                                                ? [ ...current, meal.id ]
                                                : current.filter((id) => id !== meal.id)
                                            )
                                        }}
                                    />
                                    <span className={"ml-2 " + (settledMealIds.includes(meal.id) ? "is-line-through" : "")}>{
                                        describeMeal(meal)
                                    }</span>
                                </label>
                            </li>)
                        }</ul>
                    </>
                    : <></>
                }
            </div>
            : <p>
                Nothing to buy for these days. Open a meal and tick "Needs ingredients" to add to this list.
            </p>
        }
    </Modal>
}
