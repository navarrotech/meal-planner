// Copyright © 2026 Navarrotech

// React.js
import { useState } from "react";

// Redux
import { useSelector } from "@/store";

// Utility
import { deletePerson, savePerson } from "@/modules/people/actions";
import { makeNewPerson } from "@/modules/people/constants";

// Iconography
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";

// Components
import Button from "@/common/Button";

/**
 * Editing writes straight through: a colour when it is picked, a name when the field is left.
 * A settings page for one household does not need a dirty state and a save button between the
 * user and a two-field record.
 */
export default function ManagePeople(){
    const people = useSelector(state => state.people.list)
    const [ newName, setNewName ] = useState<string>("")

    function addPerson(){
        const name = newName.trim()
        if (!name){
            return
        }

        savePerson(
            makeNewPerson(name, people.map((person) => person.color))
        )
        setNewName("")
    }

    return <>
        <p className="block">
            Who meals get planned for. The meal planner offers this list instead of a free text box,
            so the same person is spelled the same way every time, and each one colours their own
            meals on the calendar.
        </p>

        <div className="block box">{
            people.length
                ? people.map((person) => <div className="field is-grouped mb-3" key={person.id}>
                    <div className="control">
                        <input
                            type="color"
                            className="input"
                            style={{ width: "3rem", padding: "0.2rem" }}
                            aria-label={`Colour for ${person.name}`}
                            value={person.color}
                            onChange={({ target: { value } }) => savePerson({ ...person, color: value })}
                        />
                    </div>
                    <div className="control is-expanded">
                        <input
                            className="input"
                            type="text"
                            maxLength={32}
                            defaultValue={person.name}
                            aria-label={`Name for ${person.name}`}
                            onBlur={({ target: { value } }) => {
                                const name = value.trim()
                                if (!name || name === person.name){
                                    return
                                }
                                savePerson({ ...person, name })
                            }}
                        />
                    </div>
                    <div className="control">
                        <Button
                            color="danger"
                            className="has-tooltip-arrow"
                            aria-label={`Remove ${person.name}`}
                            data-tooltip={`Remove ${person.name}`}
                            onClick={() => deletePerson(person)}
                        >
                            <span className="icon">
                                <FontAwesomeIcon icon={faTrash} />
                            </span>
                        </Button>
                    </div>
                </div>)
                : <p className="has-text-centered">Nobody here yet.</p>
        }</div>

        <div className="field has-addons">
            <div className="control is-expanded">
                <input
                    className="input"
                    type="text"
                    maxLength={32}
                    placeholder="Add someone, or a group like Family"
                    value={newName}
                    onChange={({ target: { value } }) => setNewName(value)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter"){
                            event.preventDefault()
                            addPerson()
                        }
                    }}
                />
            </div>
            <div className="control">
                <Button
                    color="primary"
                    disabled={!newName.trim()}
                    onClick={addPerson}
                >
                    <span className="icon">
                        <FontAwesomeIcon icon={faPlus} />
                    </span>
                    <span>Add</span>
                </Button>
            </div>
        </div>

        <p className="is-size-7">
            Renaming someone leaves the meals already planned for them under the old name, where they
            keep their place but lose their colour. Removing someone does the same. Neither rewrites
            history, which is the part that cannot be undone.
        </p>
    </>
}
