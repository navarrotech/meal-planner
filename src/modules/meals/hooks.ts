// Copyright © 2024 Navarrotech

// React.js
import { useState, useEffect } from "react";

// Typescript
import type { MealType, PlannedMeal } from "@/types";

// Firebase data
import { onValue } from "firebase/database";
import { mealsListRef } from "./references";

export function useMealPlans(year: string, month: string, startDay: string, type: MealType) {
    const [ meals, setMeals ] = useState<PlannedMeal[]>([]);

    useEffect(() => {
        const unsubscribe = onValue(
            mealsListRef( year, month, startDay, type ),
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
    }, [ startDay, month, year, type ]);

    return meals
}
