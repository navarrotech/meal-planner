// Copyright © 2024 Navarrotech
import { useEffect, type ReactNode } from "react";

// Framework
import { auth } from "@/firebase";

// Redux
import { dispatch, useSelector } from "@/store";
import { finishInit, setUser } from "@/modules/authentication/reducer";
import { initialize, reset } from "@/store/action";

// Components
import Loader from "@/common/Loader";

type Props = {
    children: ReactNode
}

export default function Initialization({ children }: Props){
    const isLoading = useSelector(state => state.user.loading)

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            if(user){
                dispatch(
                    setUser(user)
                )
                dispatch(
                    initialize()
                )
            } else {
                dispatch(
                    finishInit()
                )
                dispatch(
                    reset()
                )
            }
        })
    }, [])

    if (isLoading){
        return <Loader/>
    }

    return children
}
