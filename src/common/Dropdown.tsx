// Copyright © 2024 Navarrotech

import { useState, useEffect, useRef } from "react"

type Props = {
    trigger: React.ReactNode
    children: React.ReactNode
    className?: string
    isTriggerRounded?: boolean
}

export default function Dropdown({ children, trigger, className = '', ...props }: Props) {
    const [ isOpen, setIsOpen ] = useState<boolean>(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Listen to clicks outside the dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener("click", handleClickOutside)

        return () => {
            document.removeEventListener("click", handleClickOutside)
        }
    }, [])

    return (
        <div className={`dropdown ${className} ${isOpen ? "is-active" : ""}`} ref={dropdownRef}>
            <div className="dropdown-trigger">
                <button
                    className={`button ${props.isTriggerRounded ? "is-rounded" : ""}`}
                    aria-haspopup="true"
                    aria-controls="dropdown-menu"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    { trigger }
                </button>
            </div>
            <div className="dropdown-menu" role="menu">
                <div className="dropdown-content">
                    { children }
                </div>
            </div>
        </div>
    )
}