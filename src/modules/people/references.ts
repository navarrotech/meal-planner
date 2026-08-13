// Copyright © 2026 Navarrotech

// Utility
import { peoplePath, personPath } from '@/lib/paths'

// Firebase
import { database } from '@/firebase'
import { ref } from 'firebase/database'

export const peopleListRef = () => ref(database, peoplePath)
export const personRef = (id: string) => ref(database, personPath(id))
