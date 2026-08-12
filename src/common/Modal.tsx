// Copyright © 2024 Navarrotech

// React.js
import { createPortal } from 'react-dom';

// Typescript
import type { ReactNode } from "react";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import type { BulmaColors } from "@/types";

// Components
import Button from './Button';

// Iconography
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type ModalButton = {
    text: string
    color: BulmaColors
    loading?: boolean
    disabled?: boolean
    closeAfterOnClick?: boolean
    onClick?: () => void

    // An action that leaves the app is a real link, so it opens in a new tab the way any other
    // link does. Given one, the action renders as an anchor rather than a button.
    href?: string

    // Given an icon, the action shows only that. Its `text` stays the label, as the tooltip and
    // as the accessible name, because an icon on its own is a guess.
    icon?: IconDefinition
}

type ModalProps = {
    key?: string,
    show: boolean
    title: string
    large?: boolean,
    className?: string
    onClose: () => void
    children: ReactNode // Body content
    actions: ModalButton[]
}

const modalsElement = document.getElementById("modals") as HTMLDivElement

export default function Modal(props: ModalProps) {
    if (!props.show) {
        return <></>
    }

    const { key, title, onClose, children, actions, large = false } = props
    let { className = "" } = props

    if (large){
        className += " is-large"
    }

    return createPortal(
        <div className={`modal is-active ${className}`}>
            <div className="modal-background" onClick={onClose}></div>
            <div className="modal-card">
                <header className="modal-card-head">
                    <p className="modal-card-title">{ title }</p>
                    <button className="delete is-large" onClick={onClose}></button>
                </header>
                <section className="modal-card-body">{
                    children
                }</section>
                <footer className="modal-card-foot buttons is-right">{
                    actions.map((action, index) => {
                        const label = action.icon
                            ? <span className="icon">
                                <FontAwesomeIcon icon={action.icon} />
                            </span>
                            : <span>{ action.text }</span>

                        if (action.href){
                            return <a
                                key={index}
                                className={`button is-${action.color} has-tooltip-arrow`}
                                href={action.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={action.text}
                                data-tooltip={action.icon ? action.text : undefined}
                                onClick={() => {
                                    action.onClick?.()
                                    if (action.closeAfterOnClick) {
                                        onClose()
                                    }
                                }}
                            >{ label }</a>
                        }

                        return <Button
                            key={index}
                            color={action.color}
                            loading={action.loading}
                            disabled={action.disabled}
                            className={action.icon ? "has-tooltip-arrow" : undefined}
                            aria-label={action.text}
                            data-tooltip={action.icon ? action.text : undefined}
                            onClick={function modalButtonClicked(){
                                if (action.disabled || action.loading){
                                    return;
                                }
                                action.onClick?.()
                                if (action.closeAfterOnClick) {
                                    onClose()
                                }
                            }}
                        >{ label }</Button>
                    })
                }</footer>
            </div>
        </div>,
        modalsElement,
        key
    );
}
