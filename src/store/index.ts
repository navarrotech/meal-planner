// Copyright © 2024 Navarrotech

import {
    type TypedUseSelectorHook,
    useDispatch as useDefaultDispatch,
    useSelector as useDefaultSelector
} from 'react-redux'
import type { RootState, AppDispatch } from './store'

type DispatchFunc = () => AppDispatch

export const useDispatch: DispatchFunc = useDefaultDispatch
export const useSelector: TypedUseSelectorHook<RootState> = useDefaultSelector

export { dispatch, getState } from './store'
