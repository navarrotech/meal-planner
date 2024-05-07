// Copyright © 2023 Navarrotech
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'

// UI
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'

// Redux
import { logout } from './reducer'
import { dispatch, useSelector } from '@/store'

import PasswordStrengthBar from '@/common/PasswordStrengthBar'

// Authentication
import {
    auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    sendPasswordResetEmail,
    GoogleAuth,
    signInWithPopup,
    GoogleAuthProvider,
} from '@/firebase'
import Button from '@/common/Button'

type Mode = "login" | "signup"
type Props = {
    initialMode?: Mode
    showModeSwitcher?: boolean
}

export function Authenticator({ initialMode = 'login', showModeSwitcher }: Props){
    const [ mode, setMode ] = useState<Mode>(initialMode)
    const [ email, setEmail ] = useState('')
    const [ password, setPassword ] = useState('')
    const [ error, setError ] = useState('')
    const [ loading, setLoading ] = useState(false)

    useEffect(() => {
        setError('')
        setLoading(false)
    }, [ mode ])

    const navigate = useNavigate()

    function login(){
        if (loading){
            return;
        }
        setLoading(true)

        if (mode === 'signup'){
            createUserWithEmailAndPassword(auth, email, password)
                .then(() => {
                    if(auth.currentUser){
                        sendEmailVerification(auth.currentUser)
                        navigate('/dashboard')
                    }
                })
                .catch(error => {
                    if (error.code === 'auth/email-already-in-use'){
                        setError('Email already exists, did you mean to login?')
                        return;
                    }
                    if (error.code === 'auth/invalid-email'){
                        setError('Invalid email address')
                        return;
                    }
                    if (error.code === 'auth/weak-password'){
                        setError('Password is too weak')
                        return;
                    }
                    console.error(error)
                    setError(error.message)
                })
                .finally(() => {
                    setLoading(false)
                })
            return
        }

        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                navigate('/')
            })
            .catch(error => {
                if (error.code === 'auth/invalid-credential'){
                    setError('Invalid login credentials')
                } else {
                    setError(error.code)
                }
                setLoading(false)
            })
    }

    let valid = false;
    if (mode === 'signup'){
        valid = !!email.length && password.length > 7
    } else {
        valid = !!email.length && password.length > 0
    }

    return <div className="subcontainer is-mini is-centered">
        <div className="block box">
            <div className="block has-text-centered">
                <h1 className="is-size-3 has-text-weight-bold is-capitalized">{ mode }</h1>
                <h2 className="is-size-6 mt-2">
                    <span>{
                        mode === 'login'
                            ? "Welcome back!"
                            : "Create an account."
                    }</span>{' '}
                    { showModeSwitcher
                        ? <a 
                            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{
                            mode === 'login'
                                ? "Sign up"
                                : "Login"
                        }</a>
                        : <></>
                    }
                </h2>
            </div>
            {/* Google sign in button */}
            <div className="block buttons is-centered">
                <button
                    className="button is-fullwidth is-google"
                    type="button"
                    onClick={() => signInWithPopup(auth, GoogleAuth)
                        .then((result) => {
                            // This gives you a Google Access Token. You can use it to access the Google API.
                            const credential = GoogleAuthProvider.credentialFromResult(result);
                            if (credential === null){
                                console.log({
                                    result,
                                    credential
                                })
                                setError('Google sign in failed')
                                return;
                            }
                            const token = credential.accessToken;
                            const user = result.user;
                            console.log({
                                token, user
                            })
                          }).catch((error) => {
                            const errorCode = error.code;
                            const errorMessage = error.message;
                            const email = error.customData.email;
                            const credential = GoogleAuthProvider.credentialFromError(error);
                            console.log({
                                errorCode, errorMessage, email, credential
                            })
                            if (errorCode !== 'auth/popup-closed-by-user'){
                                setError(errorMessage)
                            }
                          })
                    }
                >
                    <span className="icon">
                        <img src="/google.svg" alt="Google" />
                    </span>
                    <span>Sign in with Google</span>
                </button>
            </div>
            <div className="is-divider" data-content="OR" />
            {/* Email and password input */}
            <div className="block">
                <div className="field">
                    <label className="label">Email</label>
                    <div className="control">
                        <input
                            autoFocus
                            autoComplete="email"
                            className="input"
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && login()}
                            maxLength={128}
                        />
                    </div>
                </div>
                <div className="field">
                    <label className="label">{
                        mode === 'login'
                            ? "Password"
                            : "Create a password"
                    }</label>
                    <div className="control">
                        <input
                            type="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            className="input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && login()}
                            maxLength={128}
                        />
                    </div>
                </div>
                { mode === 'signup'
                    ? <div className="field">
                        <PasswordStrengthBar password={password} />
                        { password.length < 8
                            ? <p className="help" style={{ marginTop: '-1.65em' }}>Password must be at least 8 characters long</p>
                            : <></>
                        }
                    </div>
                    : <></>
                }
            </div>
            {/* Error field */}
            <div className="block">{
                error
                    ? <div className='message is-danger'>
                        <div className="message-body">{ error }</div>
                    </div>
                    : <></>
            }</div>
            {/* Login button */}
            <div className="block buttons is-centered">
                <Button
                    fullwidth
                    type="button"
                    color="primary"
                    disabled={!valid}
                    loading={loading}
                    onClick={login}
                >
                    <span className="icon">
                        <FontAwesomeIcon icon={faArrowRight} />
                    </span>
                    <span>{ mode === 'login' ? "Login" : "Sign up" }</span>
                </Button>
            </div>
            {/* Forgot password prompt: */}
            { mode === 'login'
                ? <div className="block has-text-centered">
                    <a onClick={() => sendPasswordResetEmail(auth, email)}>Forgot Password?</a>
                </div>
                : <></>
            }
        </div>
    </div>
}

export function Layout({ mode }:{ mode: Mode }){
    const isAuthorized = useSelector(state => state.user.authorized)
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthorized) {
            navigate('/dashboard')
        }
    }, [ isAuthorized ])

    return <div className="hero is-fullheight">
        <div className="hero-body">
            <div className="container pb-6 mb-6">
                <Authenticator initialMode={mode} showModeSwitcher />
            </div>
        </div>
    </div>
}

export function Logout(){
    const navigate = useNavigate()

    useEffect(() => {
        signOut(auth)
            .then(() => {
                dispatch(
                    logout()
                )
                navigate('/')
            })
    }, [])
    
    return <></>
}