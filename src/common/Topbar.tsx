// Copyright © 2024 Navarrotech

// React.js
import { useState } from "react"
import { NavLink } from "react-router-dom"

// Iconography
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser } from "@fortawesome/free-solid-svg-icons"

// Redux
import { useSelector } from "@/store"

// Components
import Dropdown from "./Dropdown"

export default function Topbar() {
    const [ showMobileMenu, setShowMobileMenu ] = useState<boolean>(false)
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
                    className={"navbar-burger" + (showMobileMenu ? " is-active" : "")}
                    aria-label="menu"
                    aria-expanded="false"
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </div>
            </div>

            <div className={"navbar-menu" + (showMobileMenu ? " is-active" : "")}>
                <div className="navbar-start">
                    <NavLink
                        className={({ isActive }) => `navbar-item ${isActive ? 'is-selected' : ''}`}
                        to="/dashboard/today"
                        onClick={() => setShowMobileMenu(false)}
                    >
                        Today
                    </NavLink>
                    <NavLink
                        className={({ isActive }) => `navbar-item ${isActive ? 'is-selected' : ''}`}
                        to="/dashboard/meals"
                        onClick={() => setShowMobileMenu(false)}
                    >
                        Meal Planner
                    </NavLink>
                    <NavLink
                        className={({ isActive }) => `navbar-item ${isActive ? 'is-selected' : ''}`}
                        to="/dashboard/recipes"
                        onClick={() => setShowMobileMenu(false)}
                    >
                        Recipes
                    </NavLink>
                    <hr className="navbar-divider" />
                    <NavLink
                        to="/account"
                        className="navbar-item"
                        onClick={() => setShowMobileMenu(false)}
                    >Account (Coming soon)</NavLink>
                    <NavLink
                        to="/logout"
                        className="navbar-item"
                        onClick={() => setShowMobileMenu(false)}
                    >Logout</NavLink>
                </div>

                <div className="navbar-end is-hidden-touch">
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
