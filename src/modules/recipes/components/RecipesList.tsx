// Copyright © 2024 Navarrotech

// React.js
import { useState, type ReactNode } from "react";
import { useRecipes } from "../hooks";

// Typescript
import type { Recipe } from "@/types";

// Redux
import { dispatch } from "@/store";
import { setDraggingRecipe } from "../reducer";

// Iconography & styling
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSearch } from "@fortawesome/free-solid-svg-icons";
import styles from "../recipe.module.sass";

// Components
import EditRecipe from "./EditRecipe";
import Button from "@/common/Button";

type Props = {
    onClick?: (recipe: Recipe) => void
}

/**
 * Most used first by default. A household cooks the same handful of things most weeks, and
 * alphabetical order buries them under everything tried once and never repeated.
 */
const sorters = {
    used: (left: Recipe, right: Recipe) =>
        (right.timesPlanned || 0) - (left.timesPlanned || 0) || left.title.localeCompare(right.title),
    title: (left: Recipe, right: Recipe) =>
        left.title.localeCompare(right.title)
} as const

type SortKey = keyof typeof sorters

type State = {
    search: string
    sort: SortKey
    selectedRecipe: Recipe | null
}

const initialState: State = {
    search: "",
    sort: "used",
    selectedRecipe: null
}

export default function RecipesList(props: Props){
    const [ state, setState ] = useState<State>(initialState)

    const { byType, keys } = useRecipes(
        state.search
    );

    let content: ReactNode | undefined;

    // If there's no recipes created yet
    if (!keys.length && !state.search){
        content = <div>
            <p className="has-text-centered">No recipes created yet</p>
        </div>
    }

    // If there's no recipes found from the search
    else if (!keys.length && state.search){
        content = <div>
            <p className="has-text-centered">No recipes found in the search</p>
        </div>
    }

    else {
        function generateRecipeContent(title: String, recipes: Recipe[]) {
            if (!recipes.length){
                return <></>
            }

            return <>
                <p>{ title }</p>
                {
                [ ...recipes ].sort(sorters[state.sort]).map(recipe => <div
                    draggable={!props.onClick}
                    id={recipe.id}
                    key={recipe.id}
                    className={styles.recipeListItem}
                    onClick={() => props.onClick?.(recipe)}
                    onDragStart={() => {
                        dispatch(
                            setDraggingRecipe(recipe)
                        )
                    }}
                    onDragEnd={() => {
                        dispatch(
                            setDraggingRecipe(null)
                        )
                    }}
                    onDoubleClick={() => {
                        if (props.onClick){
                            return;
                        }
                        setState({
                            ...state,
                            selectedRecipe: recipe
                        })
                    }}
                >
                    <h2>{ recipe.title }</h2>
                    { !props.onClick
                        ? <Button
                            className="is-small is-dark"
                            onClick={() => {
                                setState({
                                    ...state,
                                    selectedRecipe: recipe
                                })
                            }}
                        >
                            <span className="icon">
                                <FontAwesomeIcon icon={faEdit} />
                            </span>
                        </Button>
                        : <></>
                    }
                </div>)
            }</>
        }
    
        content = <>
            { generateRecipeContent("Breakfast", byType.breakfast) }
            { generateRecipeContent("Lunch", byType.lunch) }
            { generateRecipeContent("Dinner", byType.dinner) }
            { generateRecipeContent("Snack", byType.snack) }
            { generateRecipeContent("Sides", byType.sides) }
            { generateRecipeContent("Drinks", byType.drinks) }
            { generateRecipeContent("Restaurants", byType.restaurants) }
        </>
    }

    const searchInput = <div className="field">
        <div className="control has-icons-left">
            <input
                autoFocus={!!props.onClick}
                className="input"
                type="text"
                value={state.search}
                placeholder="Search for recipes..."
                onChange={({ target:{ value } }) => { setState({ ...state, search: value }) }}
                onKeyDown={({ key, target }) => {
                    if(['Enter', 'Escape', 'Esc'].includes(key)){
                        // @ts-ignore
                        target.blur()
                    }
                }}
            />
            <span className="icon is-left">
                <FontAwesomeIcon icon={faSearch} />
            </span>
        </div>
        <div className="select is-small is-fullwidth mt-2">
            <select
                aria-label="Order the recipes"
                value={state.sort}
                onChange={({ target: { value } }) => setState({ ...state, sort: value as SortKey })}
            >
                <option value="used">Most used first</option>
                <option value="title">A to Z</option>
            </select>
        </div>
    </div>

    return (
        <>
            { (keys.length || state.search) ? searchInput : <></> }
            <div className={styles.recipeList}>
                { content }
            </div>
            { state.selectedRecipe
                ? <EditRecipe
                    recipe={state.selectedRecipe}
                    onClose={() => setState({ ...state, selectedRecipe: null })}
                />
                : <></>
            }
        </>
    )
}
