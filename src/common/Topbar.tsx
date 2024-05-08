// Copyright © 2024 Navarrotech

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser } from "@fortawesome/free-solid-svg-icons"

import Dropdown from "./Dropdown"
import { useSelector } from "@/store"
import { NavLink } from "react-router-dom"

export default function Topbar() {
    const user = useSelector(state => state.user.current)

    if (!user) {
        return <></>
    }

    return (
        <nav className="navbar" role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
                <div className="navbar-item">
                    <img src="/logo512.png" width="28" height="28" alt="Navarrotech" />
                    <h1 className="title is-5 ml-3">Navarrotech</h1>
                </div>
                <div
                    role="button"
                    className="navbar-burger"
                    aria-label="menu"
                    aria-expanded="false"
                >
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </div>
            </div>

            <div className="navbar-menu">
                <div className="navbar-start" />

                <div className="navbar-end">
                    <div className="navbar-item">
                        <Dropdown
                            isTriggerRounded
                            className="is-right"
                            trigger={<div className="icon">
                                <FontAwesomeIcon icon={faUser} />
                            </div>}
                        >
                            <NavLink to="/account" className="dropdown-item">Account (Coming soon)</NavLink>
                            <hr className="dropdown-divider" />
                            <NavLink to="/logout" className="dropdown-item">Logout</NavLink>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </nav>
    )
}
