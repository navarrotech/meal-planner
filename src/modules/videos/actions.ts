// Copyright © 2023 Navarrotech

import { dispatch } from "@/store";
import { initVideos } from "./reducer";

import { axiosAPI } from "@/lib/axios";

export async function init(){
    const response = await axiosAPI.get(`/videos/list`)
    if (response.status !== 200){
        console.error("Failed to fetch videos", response.data)
        return;
    }
    dispatch(
        initVideos(
            response.data.result.items
        )
    )
}

export async function deleteVideo(videoId: string){
    const response = await axiosAPI.delete(`/videos/delete`, { data: { videoId } })
    if (response.status !== 200){
        console.error("Failed to delete video", response.data)
        return;
    }
}
