// Copyright © 2024 Navarrotech

// React.js
import { type ReactNode, useState } from "react";

// Typescript
import type { MealType, Recipe } from "@/types";

// Redux
import { useSelector } from "@/store";

// Components
import AddRecipe from "./components/AddRecipe";
import EditRecipe from "./components/EditRecipe";

// Styles
import styles from './recipe.module.sass'

export default function RecipeLayout() {
    const [ selectedRecipe, setSelectedRecipe ] = useState<Recipe | null>(null)

    const keys = useSelector(state => state.recipes.keys)
    const byType = useSelector(state => state.recipes.byType)

    function Mapper(title: String, key: MealType){
        if (!byType[key].length){
            return <></>
        }
        return <div className="block">
            <Title>{ title }</Title>
            <div className={styles.recipeLayout}>{
                byType[key].map(recipe => <RecipeCard key={recipe.id} recipe={recipe} onClick={setSelectedRecipe} />)
            }</div>
        </div>
    }

    return <section className="section">
        <div className="container is-max-fullhd">
            <div className="level">
                <h1 className="title is-size-3 mb-0">Recipes</h1>
                <div className="block buttons is-right">
                    <AddRecipe />
                </div>
            </div>{ 
            keys.length
                ? <div className="block box">
                    { Mapper("Breakfasts", "breakfast") }
                    { Mapper("Lunches", "lunch") }
                    { Mapper("Dinners", "dinner") }
                    { Mapper("Sides", "sides") }
                    { Mapper("Snacks", "snack") }
                    { Mapper("Drinks", "drinks") }
                    { Mapper("Restaurants", "restaurants") }
                </div>
                : <div className="block box">
                    <p className="has-text-centered p-6 m-6 is-fullwidth is-size-4">No recipes have been created yet!</p>
                </div>
        }</div>
        { selectedRecipe
            ? <EditRecipe
                recipe={selectedRecipe}
                onClose={() => setSelectedRecipe(null)}
            />
            : <></>
        }
    </section>
}

type RecipeCardProps = {
    recipe: Recipe
    onClick?: (recipe: Recipe) => void
}

function RecipeCard({ recipe, onClick }: RecipeCardProps) {
    return <div key={recipe.id} className={styles.recipeCard} onClick={() => onClick?.(recipe)}>
        <div
            className={styles.media}
            style={{
                backgroundImage: `url(${recipe.image || "/placeholder.jpg"})`
            }}
        />
        <div className={styles.titles}>
            <p className="title is-size-6">{ recipe.title }</p>
            <p className="subtitle is-size-7">{ recipe.details }</p>
        </div>
    </div>
}

type TitleProps = {
    children: ReactNode
}

function Title({ children }: TitleProps) {
    return <div>
        <h1 className="is-size-4">{ children }</h1>
        <hr className="mt-3" />
    </div>
}
