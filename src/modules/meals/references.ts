// Copyright © 2024 Navarrotech

import { database } from '@/firebase';
import { ref } from 'firebase/database';

export const mealsRef = (year: string, month: string, startDay: string) => ref(database, `meals/${year}/${month}/${startDay}/`);
