// Copyright © 2026 Navarrotech

// Typescript
import type { PlannedMeal, Recipe } from "@/types";

// Redux
import { useSelector } from "@/store";

// Utility
import moment from "moment";
import { buildShoppingList } from "@/lib/shoppingList";

// Components
import Modal from "@/common/Modal";

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
    const { entries, mealsWithNothingListed } = buildShoppingList(props.meals)

    function describeMeal(meal: PlannedMeal){
        const recipe: Recipe | undefined = recipesById[meal.recipeId]
        const forWho = meal.forWho ? ` for ${meal.forWho}` : ""

        return `${moment(meal.date).format("ddd MMM Do")}, ${meal.type}: ${recipe ? recipe.title : "Recipe not found"}${forWho}`
    }

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
            just the week on screen.
        </p>

        { entries.length || mealsWithNothingListed.length
            ? <div className="content">
                <ul>{
                    entries.map((entry) => <li key={entry.ingredient.toLowerCase()}>
                        <strong>{ entry.ingredient }</strong>
                        <ul>{
                            entry.meals.map((meal) => <li key={meal.id} className="is-size-7">{
                                describeMeal(meal)
                            }</li>)
                        }</ul>
                    </li>)
                }</ul>

                { mealsWithNothingListed.length
                    ? <>
                        <p className="mb-2">Marked, but nothing named yet:</p>
                        <ul>{
                            mealsWithNothingListed.map((meal) => <li key={meal.id} className="is-size-7">{
                                describeMeal(meal)
                            }</li>)
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
