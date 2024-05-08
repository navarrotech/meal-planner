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

type State = {
    search: string
    selectedRecipe: Recipe | null
}

const initialState: State = {
    search: "",
    selectedRecipe: null
}

export default function RecipesList(){
    const [ state, setState ] = useState<State>(initialState)

    const { byId, keys } = useRecipes(
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
        content = keys.map(recipeId => {
            const recipe = byId[recipeId];
            return (
                <div
                    draggable
                    id={recipe.id}
                    key={recipe.id}
                    className={styles.recipeListItem}
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
                >
                    <h2>{ recipe.title }</h2>
                    <Button
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
                </div>
            )
        })
    }

    const searchInput = <div className="field">
        <div className="control has-icons-left">
            <input
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
    </div>

    return (
        <div className={styles.recipeList}>
            { (keys.length || state.search) ? searchInput : <></> }
            { content }
            { state.selectedRecipe
                ? <EditRecipe
                    recipe={state.selectedRecipe}
                    onClose={() => setState({ ...state, selectedRecipe: null })}
                />
                : <></>
            }
        </div>
    )
}
