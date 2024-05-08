// Copyright © 2024 Navarrotech

// React.js
import { useState, useEffect } from "react";

// Typescript
import type { PlannedMeal } from "@/types";

// Firebase data
import { onValue } from "firebase/database";
import { mealsRef } from "./references";

export function useMealPlans(year: string, month: string, startDay: string) {
    const [ meals, setMeals ] = useState<PlannedMeal[] | null>(null);

    useEffect(() => {
        const unsubscribe = onValue(
            mealsRef( year, month, startDay ),
            (snapshot) => {
                const data = snapshot.val();
                setMeals(
                    data ? Object.values(data) : []
                );
            }
        );

        return () => {
            unsubscribe();
        }
    }, [ startDay, month, year ]);

    return meals
}
