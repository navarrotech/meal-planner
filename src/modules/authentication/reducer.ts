// Copyright © 2024 Navarrotech

import { createSlice } from "@reduxjs/toolkit"

import type { PayloadAction } from "@reduxjs/toolkit"
import type { User } from "firebase/auth"

export type State = {
  current: User | undefined
  sid?: string
  authorized: boolean
  loading: boolean
}

const initialState: State = {
  authorized: false,
  loading: true,
  sid: undefined,
  current: undefined
}

const slice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.current = action.payload
      state.loading = false
      state.authorized = !!action.payload?.email
      return state;
    },
    logout: (state) => {
      state = {
        ...initialState,
        authorized: false,
        loading: false
      }
      return state;
    },
    finishInit: (state) => {
      state.loading = false
    },
  }
})

export const {
  setUser,
  finishInit,
  logout,
} = slice.actions

export default slice;