// Copyright © 2026 Navarrotech

// React.js
import { useState } from "react";

// Typescript
import type { PlannedMeal } from "@/types";

// Components
import Button from "@/common/Button";

// Iconography
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

type Changes = Pick<PlannedMeal, "needsIngredients" | "missingIngredients">

type Props = Changes & {
    // The recipe's own ingredients, offered as one-click additions. Plenty of recipes carry
    // none, since only the CLI can fill them in today, so typing is the primary path here.
    suggestions: string[]
    onChange: (changes: Changes) => void
}

export default function NeedsIngredients(props: Props) {
    const { needsIngredients, missingIngredients, suggestions, onChange } = props
    const [ draft, setDraft ] = useState<string>("")

    // Matching is case-insensitive: "Rice" and "rice" are one trip down one aisle.
    const listedNames = new Set(
        missingIngredients.map((ingredient) => ingredient.toLowerCase())
    )
    const unlistedSuggestions = suggestions.filter(
        (ingredient) => !listedNames.has(ingredient.toLowerCase())
    )

    function addIngredient(ingredient: string){
        const trimmed = ingredient.trim()
        setDraft("")

        if (!trimmed || listedNames.has(trimmed.toLowerCase())){
            return
        }

        // Naming something to buy is the same statement as "this meal needs shopping", so it
        // marks the meal rather than filling a list nobody would ever be shown.
        onChange({
            needsIngredients: true,
            missingIngredients: [ ...missingIngredients, trimmed ]
        })
    }

    return <div className="field fancy-label">
        <label className="checkbox">
            <input
                type="checkbox"
                checked={needsIngredients}
                onChange={({ target: { checked } }) => onChange({
                    needsIngredients: checked,
                    // Starting from the recipe's own ingredients beats retyping them, and
                    // crossing off what is already in the cupboard is the shorter job.
                    // An existing list is left alone, so unticking and reticking loses nothing.
                    missingIngredients: checked && !missingIngredients.length
                        ? suggestions
                        : missingIngredients
                })}
            />
            <span className="ml-2">Needs ingredients before I can make this</span>
        </label>

        { needsIngredients
            ? <div className="mt-3">
                { missingIngredients.length
                    ? <div className="tags">{
                        missingIngredients.map((ingredient) => <span className="tag is-warning" key={ingredient}>
                            <span>{ ingredient }</span>
                            <button
                                type="button"
                                aria-label={`Remove ${ingredient}`}
                                className="delete is-small"
                                onClick={() => onChange({
                                    needsIngredients,
                                    missingIngredients: missingIngredients.filter(
                                        (listed) => listed !== ingredient
                                    )
                                })}
                            />
                        </span>)
                    }</div>
                    : <p className="is-size-7 mb-2">Nothing listed yet. The calendar will still warn you.</p>
                }

                <div className="field has-addons">
                    <div className="control is-expanded">
                        <input
                            className="input"
                            type="text"
                            placeholder="Chicken thighs"
                            maxLength={128}
                            value={draft}
                            onChange={({ target: { value } }) => setDraft(value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter"){
                                    e.preventDefault()
                                    addIngredient(draft)
                                }
                            }}
                        />
                    </div>
                    <div className="control">
                        <Button
                            color="primary"
                            disabled={!draft.trim()}
                            onClick={() => addIngredient(draft)}
                        >
                            <span className="icon">
                                <FontAwesomeIcon icon={faPlus} />
                            </span>
                        </Button>
                    </div>
                </div>

                { unlistedSuggestions.length
                    ? <>
                        <p className="is-size-7 mb-2">From the recipe:</p>
                        {/* Outlined rather than filled, so a suggestion reads as something to
                            add rather than as something already on the list. A plain Bulma tag
                            is unreadable here: this theme leaves it near-white on white. */}
                        <div className="buttons are-small">{
                            unlistedSuggestions.map((ingredient) => <button
                                type="button"
                                key={ingredient}
                                className="button is-small is-rounded is-warning is-outlined"
                                onClick={() => addIngredient(ingredient)}
                            >
                                <span className="icon is-small">
                                    <FontAwesomeIcon icon={faPlus} />
                                </span>
                                <span>{ ingredient }</span>
                            </button>)
                        }</div>
                    </>
                    : <></>
                }
            </div>
            : <></>
        }
    </div>
}
