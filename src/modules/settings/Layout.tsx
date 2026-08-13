// Copyright © 2026 Navarrotech

// React.js & Router
import { Link, Outlet, useLocation } from "react-router-dom";

// Bulma marks the tab's list item rather than its link, which a NavLink cannot reach.
const tabs = [
    { path: "/dashboard/settings/people", label: "People" },
    { path: "/dashboard/settings/data", label: "Data" }
] as const

/**
 * The shell every settings screen sits in. Its tabs mirror the navbar's dropdown, so the same
 * places are reachable whether the user aimed at them from the top or landed here first.
 */
export default function SettingsLayout(){
    const { pathname } = useLocation()

    return <section className="section">
        <div className="container is-max-desktop">
            <h1 className="title is-size-3">Settings</h1>

            <div className="tabs">
                <ul>{
                    tabs.map((tab) => <li
                        key={tab.path}
                        className={pathname.startsWith(tab.path) ? "is-active" : ""}
                    >
                        <Link to={tab.path}>{ tab.label }</Link>
                    </li>)
                }</ul>
            </div>

            <Outlet />
        </div>
    </section>
}
