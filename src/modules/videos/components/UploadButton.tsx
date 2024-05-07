// Copyright © 2023 Navarrotech

// Redux
import { dispatch } from "@/store"
import { addFileToQueue } from "../reducer"

// UI
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUpload } from "@fortawesome/free-solid-svg-icons"

export default function UploadButton(){
    return <div className="file is-primary">
        <label className="file-label">
        <input
            multiple
            type="file"
            // accept="video/*"
            name="Upload Videos"
            className="file-input"
            onChange={(event) => {
                const { files } = event.target;

                if (!files || !files.length){
                    return;
                }

                [ ...files ].forEach(file => {
                    dispatch(
                        addFileToQueue(file)
                    )
                })
            }}
        />
        <span className="file-cta">
            <span className="file-icon">
                <FontAwesomeIcon icon={faUpload} />
            </span>
            <span className="file-label">
                Upload videos
            </span>
        </span>
        </label>
    </div>
}
