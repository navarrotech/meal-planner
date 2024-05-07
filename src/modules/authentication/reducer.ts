// Copyright © 2023 Navarrotech

import { createSlice } from "@reduxjs/toolkit"
import { RESET_STATE } from "@/constants"

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
      console.log('SET_USER', action.payload)
      state.loading = false
      state.authorized = true
      // const { sid, authorized, user } = action.payload || {};
      // if(!authorized){
      //   return {
      //     ...initialState,
      //     loading: false
      //   };
      // }
      // if(user.id !== undefined){
      //   if (sid) {
      //     state.sid = sid;
      //   }
      //   state.authorized = true;
      //   state.current = {
      //     ...user,
      //     name: user.first_name + ' ' + user.last_name
      //   };
      //   state.loading = false;
      // }
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
    [RESET_STATE]: () => initialState
  }
})

export const {
  setUser,
  finishInit,
  logout,
} = slice.actions

export default slice;