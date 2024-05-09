// Copyright © 2024 Navarrotech

// Data
import { useSelector } from "@/store"
import { useTodaysMeals } from "../meals/hooks"

// Styling
import styles from "./today.module.sass"

export default function Layout(){
    const recipesById = useSelector((state) => state.recipes.byId)
    const todaysMeals = useTodaysMeals()

    function MealSet(key: "breakfast" | "lunch" | "dinner"){
        if (!todaysMeals[key].length){
            return <></>
        }

        return <>
            <h1 className="title is-capitalized mb-0">{ key }</h1>
            <hr className="mt-3 mb-2" />
            <div className={styles.mealGroup}>{
                todaysMeals[key].map((meal) => {
                    const recipe = recipesById[meal.recipeId]
                    return <div key={meal.id} className={"block " + styles.meal}>
                        {/* Cover */}
                        <div
                            className={styles.cover}
                            style={{
                                backgroundImage: `url(${recipe.image || "/placeholder.jpg"})`,
                            }}
                        />
                        {/* Title */}
                        <div className={"block " + styles.titles}>
                            <h3 className="is-size-4">{ recipe.title }</h3>
                            <p>{ recipe.details }</p>
                            <p>{ meal.notes }</p>
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

    return <section className="section">
        <div className={"container is-max-fullhd " + styles.today}>
            { MealSet('breakfast') }
            { MealSet('lunch') }
            { MealSet('dinner') }
        </div>
    </section>
}
