// Copyright © 2024 Navarrotech

// React.js
import { useState, useRef } from 'react'

// Utility
import { uploadImageToCloud } from '../actions'

// Iconography & styling
import { faLink, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from '../recipe.module.sass'

// Components
import Button from '@/common/Button'

type Props = {
    image: string
    onChange: (url: string) => void
    disabled?: boolean
}

export default function CoverUploader({ image, onChange, disabled = false }: Props) {

    const [ uploading, setUploading ] = useState<boolean>(false)
    const [ progress, setProgress ] = useState<number>(0)

    const fileInput = useRef<HTMLInputElement>(null);

    return <div
        className={"block " + styles.cover}
        style={{
            backgroundImage: `url(${image || "/placeholder.jpg"})`
        }}
    >
        <input
            multiple={false}
            type="file"
            accept="image/*"
            className="is-hidden"
            disabled={disabled}
            ref={fileInput}
            onChange={async ({ target: { files } }) => {
                if (!files){
                    return;
                }

                setUploading(true)

                try {
                    const imageUrl = await uploadImageToCloud(files[0], setProgress)
                    if (imageUrl){
                        onChange(imageUrl)
                    }
                } catch (e){
                    console.error(e)
                }

                setUploading(false)
                setProgress(0)
            }}
        />
        <div
            className={styles.progress}
            style={{
                width: progress === 0 ? '100%' : `${progress}%`,
                opacity: progress > 0 ? 1 : 0
            }}
        />
        <div className="block buttons is-centered">
            <Button
                color="dark"
                disabled={uploading || disabled}
                onClick={() => {
                    const url = prompt("Enter the URL of the image");
                    if (url){
                        onChange(url);
                    }
                }}
            >
                <span className="icon">
                    <FontAwesomeIcon icon={faLink} />
                </span>
                <span>Link URL</span>
            </Button>
            <Button
                color="primary"
                loading={uploading || disabled}
                onClick={() => {
                    fileInput.current?.click();
                }}
            >
                <span className="icon">
                    <FontAwesomeIcon icon={faUpload} />
                </span>
                <span>Upload Image</span>
            </Button>
        </div>
    </div>
}