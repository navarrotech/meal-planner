// Copyright © 2023 Navarrotech
import { useEffect } from "react";

// UI
import { Outlet, useNavigate } from "react-router";
import { RESET_STATE } from "@/constants";

// Actions
import { dispatch, useSelector } from "@/store";
import { init as initVideo } from "../videos/actions";

export function AuthorizedOutlet(){
    const authorized = useSelector(state => state.user.authorized);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authorized){
            dispatch({
                type: RESET_STATE,
                payload: null
            })
            console.log('Unauthorized, redirecting to login');
            navigate('/login');
            return;
        }
        
        initVideo();
    }, [ authorized ])

    if (!authorized){
        return <></>
    }

    return <div>
        <Outlet />
    </div>
}

export function UnauthorizedOutlet(){
    return <section className="section">
        <Outlet />
    </section>
}
