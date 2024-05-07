// Copyright © 2023 Navarrotech
import { useEffect, type ReactNode } from "react";

// Framework
import { auth } from "@/firebase";

// Redux
import { dispatch, useSelector } from "@/store";
import { finishInit, setUser } from "@/modules/authentication/reducer";

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
            } else {
                dispatch(
                    finishInit()
                )
            }
        })
    }, [])

    if (isLoading){
        return <></>
    }

    return children
}
