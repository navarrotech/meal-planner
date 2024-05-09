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
                            height: `calc(82vh / ${todaysMeals.all.length})`
                        }}
                    >
                        {/* Cover */}
                        <div
                            className={styles.cover}
                            style={{
                                backgroundImage: `url(${recipe.image || "/placeholder.jpg"})`,
                            }}
                        />
                        {/* Title */}
                        <div className={"block " + styles.titles}>
                            <h3 className="is-size-4 is-capitalized">
                                <strong>{ meal.forWho ? `${meal.forWho}: ` : '' }</strong>
                                <span className="has-font-weight-normal">{ recipe.title }</span>
                            </h3>
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
