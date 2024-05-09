// Copyright © 2024 Navarrotech

// React.js
import { createPortal } from 'react-dom';

// Typescript
import type { ReactNode } from "react";
import type { BulmaColors } from "@/types";

// Components
import Button from './Button';

type ModalButton = {
    text: string
    color: BulmaColors
    loading?: boolean
    disabled?: boolean
    closeAfterOnClick?: boolean
    onClick?: () => void
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
                    actions.map((action, index) => (
                        <Button
                            key={index}
                            color={action.color}
                            loading={action.loading}
                            disabled={action.disabled}
                            onClick={function modalButtonClicked(){
                                if (action.disabled || action.loading){
                                    return;
                                }
                                action.onClick?.()
                                if (action.closeAfterOnClick) {
                                    onClose()
                                }
                            }}
                        >
                            <span>{ action.text }</span>
                        </Button>
                    ))
                }</footer>
            </div>
        </div>,
        modalsElement,
        key
    );
}
