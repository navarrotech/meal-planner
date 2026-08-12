// Copyright © 2026 Navarrotech

import type { Database } from 'firebase-admin/database'

// Core
import { cert, initializeApp } from 'firebase-admin/app'
import { getDatabase } from 'firebase-admin/database'

// Utility
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

/**
 * The CLI runs on Node, so it cannot reuse src/firebase.ts: that module calls getAnalytics()
 * at import time, which only exists in a browser. It authenticates with a service account
 * instead of a signed-in user, which means it bypasses database.rules.json entirely. Those
 * rules remain the authorization boundary for the browser app.
 */

const SERVICE_ACCOUNT_SETUP_HELP = [
    'Generate one in the Firebase console under Project settings > Service accounts >',
    'Generate new private key, save it as firebase-service-account.json in the repository root,',
    'or point MEAL_PLANNER_SERVICE_ACCOUNT at its location.'
].join(' ')

const DATABASE_URL_SETUP_HELP = [
    'Set FIREBASE_DATABASE_URL, or add a "databaseURL" key to firebase-credentials.json',
    '(the same file the web app already requires).'
].join(' ')

function readServiceAccount() {
    const candidatePaths = [
        process.env.MEAL_PLANNER_SERVICE_ACCOUNT,
        process.env.GOOGLE_APPLICATION_CREDENTIALS,
        'firebase-service-account.json'
    ]

    for (const candidatePath of candidatePaths) {
        if (!candidatePath) {
            continue
        }

        const absolutePath = resolve(candidatePath)
        if (!existsSync(absolutePath)) {
            continue
        }

        return JSON.parse(readFileSync(absolutePath, 'utf8'))
    }

    throw new Error(`No Firebase service account found. ${SERVICE_ACCOUNT_SETUP_HELP}`)
}

function readDatabaseUrl(): string {
    if (process.env.FIREBASE_DATABASE_URL) {
        return process.env.FIREBASE_DATABASE_URL
    }

    const credentialsPath = resolve('firebase-credentials.json')
    if (existsSync(credentialsPath)) {
        const { databaseURL } = JSON.parse(readFileSync(credentialsPath, 'utf8'))
        if (databaseURL) {
            return databaseURL
        }
    }

    throw new Error(`Could not determine the Realtime Database URL. ${DATABASE_URL_SETUP_HELP}`)
}

let connectedDatabase: Database | undefined

/**
 * Connects lazily so that `--help` and argument errors never demand credentials.
 */
export function getMealPlannerDatabase(): Database {
    if (connectedDatabase) {
        return connectedDatabase
    }

    const firebaseApp = initializeApp({
        credential: cert(readServiceAccount()),
        databaseURL: readDatabaseUrl()
    })

    connectedDatabase = getDatabase(firebaseApp)
    return connectedDatabase
}
