// Copyright © 2024 Navarrotech

// Typescript
import type { BulmaColors } from '@/types'
import type { ReactNode, ButtonHTMLAttributes } from 'react'

type Props = {
    fullwidth?: boolean
    className?: string
    children: ReactNode
    disabled?: boolean
    loading?: boolean
    color?: BulmaColors
} & ButtonHTMLAttributes<HTMLButtonElement>

export default function Button(props: Props){
    const {
        className,
        children,
        disabled,
        loading,
        color,
        fullwidth,
        ...rest
    } = props

    let classes = 'button ' + className
    if (disabled){
        classes += ' is-disabled'
    }
    if (loading){
        classes += ' is-loading'
    }
    if (color){
        classes += ' is-' + color
    }
    if (fullwidth){
        classes += ' is-fullwidth'
    }

    return <button
        className={classes}
        disabled={disabled || loading}
        { ...rest }
    >{
        children
    }</button>
}
