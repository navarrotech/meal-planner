// Copyright © 2023 Navarrotech
import { useEffect, useState } from "react"

// API
import * as tus from "tus-js-client";
import { axiosAPI } from "@/lib/axios";

// Utility
import makeEta from 'simple-eta'
import prettyBytes from 'pretty-bytes';
import moment from 'moment'
import { finishUpload, uploadErrored } from "../reducer";
import { dispatch } from "@/store";
import { deleteVideo } from "../actions";

type Props = {
    file: File
}

export default function VideoCardUploading({ file }: Props){
    const [ progress, setProgress ] = useState<number>(0);
    const [ bytesTransferred, setBytesTransferred ] = useState<number>(0);
    const [ totalBytes, setTotalBytes ] = useState<number>(0);
    const [ estimate, setEstimate ] = useState<number>(0);
    const [ abort, setAbort ] = useState<null | (() => void)>(null);

    useEffect(() => {
        let cleanup: () => void;
        let shouldContinue = true;

        async function upload(){
            const keyRequest = await axiosAPI.post('/videos/generateKey', { fileName: file.name })

            const { status, data } = keyRequest;
            if (status !== 200){
                console.error("Failed to generate key", keyRequest)
                return;
            }
            if (!shouldContinue){
                return;
            }

            let eta: ReturnType<typeof makeEta>;

            // Create a new tus upload
            const upload = new tus.Upload(file, {
                endpoint: "https://video.bunnycdn.com/tusupload",
                retryDelays: [0, 3000, 5000, 10000, 20000, 60000, 60000],
                headers: data,
                metadata: {
                    filename: file.name,
                    filetype: file.type,
                    collection: "collectionID"
                },
                onError: function (error) {
                    console.log('Upload failed,' + error)
                    dispatch(
                        uploadErrored({
                            file,
                            message: error?.message || "Upload error occurred"
                        })
                    )
                },
                onProgress: function (bytesTransferred, totalBytes) {
                    const progress = Math.round((bytesTransferred / totalBytes) * 10000) / 100;

                    setBytesTransferred(bytesTransferred);
                    setTotalBytes(totalBytes);
                    setProgress(progress);

                    if (!eta){
                        eta = makeEta({ min: bytesTransferred, max: totalBytes });
                        eta.start();
                    }

                    eta.report(bytesTransferred)
                    setEstimate(
                        Math.round(eta.estimate())
                    )
                },
                onSuccess: function () {
                    dispatch(
                        finishUpload(file)
                    )
                },
            })

            const previousUploads = await upload.findPreviousUploads()
            if (previousUploads.length) {
                upload.resumeFromPreviousUpload(previousUploads[0])
            }

            upload.start()

            setAbort(() => () => {
                shouldContinue = false;
                upload.abort();
                dispatch(
                    finishUpload(file)
                )
                deleteVideo(
                    data.VideoId
                )
            })

            cleanup = () => {
                upload.abort();
            }
        }

        upload();

        return () => {
            shouldContinue = false;
            cleanup?.();

            setProgress(0);
            setBytesTransferred(0);
            setTotalBytes(0);
            setEstimate(0);
        }
    }, [ file ])

    return <div>
        <p>Upload Task</p>
        <p>{ progress }%</p>
        <p>{ prettyBytes(bytesTransferred) } of { prettyBytes(totalBytes) }</p>
        { !!estimate && estimate != Infinity
            ? <p>
                <span className="is-capitalized">{ moment.duration(estimate, 'seconds').humanize() }</span>
                <span> remaining</span>
            </p>
            : <p>--</p>
        }
    </div>
}
