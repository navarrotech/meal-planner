// Copyright © 2023 Navarrotech

import type { VideoError } from "@/modules/videos/reducer";

type Props = {
    data: VideoError
}

export default function VideoFailed({ data }: Props){
    return <div>Failed</div>
}
