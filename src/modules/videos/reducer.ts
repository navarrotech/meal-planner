// Copyright © 2023 Navarrotech

import { createSlice } from "@reduxjs/toolkit"
import { RESET_STATE } from "@/constants"

// Types
import type { Upload } from 'tus-js-client'
import type { PayloadAction } from "@reduxjs/toolkit"
import type { Video } from "@/types"

export type VideoError = {
    file: File
    message: string
}

export type State = {
    initialized: boolean
    videos: Video[],
    fileUploadQueue: File[],
    filesFailed: VideoError[]
    currentUploadJob: null | Upload,
}

const initialState: State = {
    initialized: false,
    videos: [],
    fileUploadQueue: [],
    filesFailed: [],
    currentUploadJob: null,
}

const slice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    initVideos: (state, action: PayloadAction<Video[]>) => {
        state.initialized = true
        state.videos = action.payload
    },
    addFileToQueue: (state, action: PayloadAction<File>) => {
        state.fileUploadQueue.push(action.payload)
    },
    uploadErrored: (state, action: PayloadAction<VideoError>) => {
        const { file } = action.payload
        state.fileUploadQueue = state.fileUploadQueue.filter(f => f !== file)
        state.filesFailed.push(action.payload)
    },
    finishUpload: (state, action: PayloadAction<File>) => {
        state.fileUploadQueue = state.fileUploadQueue.filter(file => file !== action.payload)
    },
    [RESET_STATE]: () => initialState
  },
})

export const {
    initVideos,
    addFileToQueue,
    uploadErrored,
    finishUpload,
} = slice.actions

export default slice;

