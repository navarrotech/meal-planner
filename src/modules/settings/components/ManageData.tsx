// Copyright © 2026 Navarrotech

// React.js
import { useState } from "react";

// Utility
import moment from "moment";
import { exportBackup, recountRecipeUsage } from "../actions";

// Iconography
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faRotate } from "@fortawesome/free-solid-svg-icons";

// Components
import Button from "@/common/Button";

export default function ManageData(){
    const [ isExporting, setExporting ] = useState<boolean>(false)
    const [ isRecounting, setRecounting ] = useState<boolean>(false)
    const [ status, setStatus ] = useState<string>("")

    async function onExport(){
        setExporting(true)
        setStatus("")

        try {
            const backup = await exportBackup()

            // Handing the file over through an object URL keeps the whole thing in the browser:
            // there is no server here to ask for a copy, and there does not need to be.
            const url = URL.createObjectURL(
                new Blob([ JSON.stringify(backup, null, 2) ], { type: "application/json" })
            )
            const link = document.createElement("a")
            link.href = url
            link.download = `meal-planner-backup-${moment().format("YYYY-MM-DD")}.json`
            link.click()
            URL.revokeObjectURL(url)

            setStatus(`Exported ${backup.counts.recipes} recipes, ${backup.counts.meals} planned meals and ${backup.counts.people} people.`)
        }
        catch (error) {
            console.error("Could not export a backup", error)
            setStatus("Could not export a backup. The console has the details.")
        }

        setExporting(false)
    }

    async function onRecount(){
        setRecounting(true)
        setStatus("")

        try {
            const corrected = await recountRecipeUsage()

            // The titles can run to hundreds on a first run, which is a paragraph nobody reads.
            // The count is the answer; the console has the list for when it is not.
            console.debug("Recipes whose usage count was corrected", corrected)

            setStatus(corrected.length
                ? `Corrected ${corrected.length} recipe${corrected.length === 1 ? "" : "s"}. The console lists them.`
                : "Every count already matched the calendar."
            )
        }
        catch (error) {
            console.error("Could not recount recipe usage", error)
            setStatus("Could not recount. The console has the details.")
        }

        setRecounting(false)
    }

    return <>
        <h2 className="title is-size-5">Backup</h2>
        <p className="block">
            Downloads every recipe, planned meal and person as one JSON file. Nothing here is stored
            anywhere else, so this file is the only copy that survives a mistake.
        </p>
        <div className="block">
            <Button
                color="primary"
                loading={isExporting}
                onClick={onExport}
            >
                <span className="icon">
                    <FontAwesomeIcon icon={faDownload} />
                </span>
                <span>Export a backup</span>
            </Button>
        </div>

        <h2 className="title is-size-5">Usage counts</h2>
        <p className="block">
            Each recipe counts how often it has been planned, which is what orders the recipe list.
            Planning and unplanning keep it current; this recounts from the calendar itself, for
            meals that were made before the count existed.
        </p>
        <div className="block">
            <Button
                loading={isRecounting}
                onClick={onRecount}
            >
                <span className="icon">
                    <FontAwesomeIcon icon={faRotate} />
                </span>
                <span>Recount from the calendar</span>
            </Button>
        </div>

        { status
            // Explicitly dark: this theme remaps Bulma's neutral background to near-white while
            // the text stays white, so a plain notification cannot be read.
            ? <div className="notification is-dark">{ status }</div>
            : <></>
        }
    </>
}
