// Copyright © 2023 Navarrotech
import { lazy, Suspense } from 'react'

const PasswordStrengthBar = lazy(() => import('react-password-strength-bar'));

type Props = {
    password: string
}

export default function PasswordStrengthBarComponent({ password }: Props){
    return <Suspense fallback={<div />}>
        <PasswordStrengthBar password={password} />
    </Suspense>
}
