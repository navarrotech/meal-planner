// Copyright © 2024 Navarrotech

// Typescript
import type { Recipe, MealType } from "@/types";

// Components
import CoverUploader from "./CoverUploader";

type Props = {
    recipe: Recipe
    onChange: (recipe: Recipe) => void
    disabled?: boolean
}

// This component is used for the body of both creating recipes and editing recipes.
export default function RecipeModalBody({ recipe, onChange, disabled=false }: Props) {

    const { title, details, instructions } = recipe;

    return <div>
        <CoverUploader
            image={recipe.image}
            onChange={(image) => onChange({ ...recipe, image })}
            disabled={disabled}
        />
        <div className="field fancy-label">
            <label className="label">Title</label>
            <div className="control">
                <input
                    autoFocus
                    className="input"
                    placeholder="French Toast"
                    type="text"
                    value={title}
                    onChange={({ target: { value } }) => onChange({ ...recipe, title: value })}
                    maxLength={48}
                    disabled={disabled}
                />
            </div>
        </div>
        <div className="field fancy-label">
            <label className="label">Details</label>
            <div className="control">
                <textarea
                    className="textarea"
                    placeholder="This is a delicious breakfast recipe."
                    value={details}
                    maxLength={512}
                    onChange={({ target: { value } }) => onChange({ ...recipe, details: value })}
                    disabled={disabled}
                ></textarea>
            </div>
        </div>
        <div className="field fancy-label">
            <label className="label">Meal Type</label>
            <div className="control is-fullwidth">
                <div className="select is-fullwidth">
                    <select
                        value={recipe.type}
                        className="is-fullwidth"
                        onChange={({ target: { value } }) => onChange({ ...recipe, type: value as MealType })}
                        disabled={disabled}
                    >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                    </select>
                </div>
            </div>
        </div>
        <div className="field fancy-label">
            <label className="label">Instructions</label>
            <div className="control">
                <textarea
                    className="textarea"
                    maxLength={1024}
                    placeholder="1. Mix eggs and milk.
2. Dip bread in mixture.
3. Cook on griddle."
                    value={instructions}
                    disabled={disabled}
                    onChange={({ target: { value } }) => onChange({ ...recipe, instructions: value })}
                ></textarea>
            </div>
        </div>
    </div>
}
