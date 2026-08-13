// Copyright © 2024 Navarrotech

// Data
import moment from "moment"
import { useSelector } from "@/store"
import { useMealsOnDay } from "../meals/hooks"

// Styling
import styles from "./today.module.sass"

type Props = {
    // Which day to show, counted from today. Tomorrow is the same page one day along.
    dayOffset?: number
}

export default function Layout(props: Props){
    const { dayOffset = 0 } = props

    const recipesById = useSelector((state) => state.recipes.byId)
    const day = moment().add(dayOffset, "days")
    const todaysMeals = useMealsOnDay(day)

    function MealSet(key: "breakfast" | "lunch" | "dinner"){
        if (!todaysMeals[key].length){
            return <></>
        }

        return <>
            <div className={"block " + styles.mealGroup}>
                <h1 className={"title is-capitalized " + styles.groupTitle}>
                    <span>{ key }</span>
                </h1>{
                todaysMeals[key].map((meal) => {
                    const recipe = recipesById[meal.recipeId]
                    return <div
                        key={meal.id}
                        className={styles.meal}
                        style={{
                            height: `calc(76vh / ${todaysMeals.all.length})`
                        }}
                    >
                        {/* Cover */}
                        <div
                            className={styles.cover}
                            style={{
                                backgroundImage: `url(${recipe?.image || "/placeholder.jpg"})`,
                            }}
                        />
                        {/* Title */}
                        <div className={"block " + styles.titles}>
                            <h3 className="is-size-4 is-capitalized">
                                <strong>{ meal.forWho ? `${meal.forWho}: ` : '' }</strong>
                                <span className="has-font-weight-normal">{ recipe ? recipe.title : "Recipe not found" }</span>
                            </h3>
                            <p>{ recipe?.details }</p>
                            <p>{ meal.notes }</p>
                            {/* Worth knowing the evening before, which is the point of the
                                tomorrow page: there is still time to do something about it. */}
                            { meal.needsIngredients
                                ? <p className="has-text-warning">{
                                    meal.missingIngredients.length
                                        ? `Still to buy: ${meal.missingIngredients.join(", ")}`
                                        : "Still needs ingredients"
                                }</p>
                                : <></>
                            }
                        </div>
                        {/* Health information */}
                        <div className={"block " + styles.health}>
                            {/* <p>{ recipe.instructions }</p> */}
                            <p></p>
                        </div>
                    </div>
                })
            }</div>
        </>
    }

    return <section className="section pt-4">
        <div className={"container is-max-fullhd " + styles.today}>
            <h1 className="title is-size-4 mb-4">
                <span>{ dayOffset ? "Tomorrow" : "Today" }</span>
                <span className="has-text-weight-normal is-size-6 ml-3">{ day.format("dddd, MMMM Do") }</span>
            </h1>
            { todaysMeals.all.length
                ? <>
                    { MealSet('breakfast') }
                    { MealSet('lunch') }
                    { MealSet('dinner') }
                </>
                : <p>Nothing planned{ dayOffset ? " for tomorrow" : " today" } yet.</p>
            }
        </div>
    </section>
}
