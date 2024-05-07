// Copyright © 2023 Navarrotech

// Redux
import { useSelector } from "@/store"

// Components
import UploadButton from "./components/UploadButton";
import VideoCard from "./components/VideoCard";
import VideoCardUploading from "./components/VideoUploading";
import Loader from "@/common/Loader";
import { VideoToBeUploaded } from "./components/VideoToBeUploaded";
import VideoFailed from "./components/VideoFailed";

export default function VideoLayout(){
    return <section className="section">
        <div className="container is-max-fullhd">
            <div className="level">
                <div className="">
                    <h1 className="title">Video Manager</h1>
                    <h2 className="subtitle">Manage your videos here</h2>
                </div>
                <div className="">
                    <UploadButton />
                </div>
            </div>
            <div className="block box">
                <VideoLibrary />
            </div>
        </div>
    </section>
}

function VideoLibrary(){
    const initialized = useSelector(state => state.videos.initialized);
    const videos = useSelector(state => state.videos.videos);
    const fileQueue = useSelector(state => state.videos.fileUploadQueue);
    const failedFiles = useSelector(state => state.videos.filesFailed);

    if (!initialized){
        return <Loader />
    }

    const [ firstInQueue, ...restOfQueue ] = fileQueue;
    
    return <div>
        { firstInQueue && <VideoCardUploading key={firstInQueue.name} file={firstInQueue} /> || <></> }
        { restOfQueue.map(file => <VideoToBeUploaded key={file.name} file={file} />) }
        { failedFiles.map(data => <VideoFailed key={data.file.name} data={data} />) }
        { videos.map(video => <VideoCard key={video.id} video={video} />) }
    </div>
}
