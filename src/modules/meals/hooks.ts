// Copyright © 2024 Navarrotech

// React.js
import { useState, useEffect } from "react";

// Typescript
import type { MealType, PlannedMeal, PlannedDayGroup } from "@/types";

// Utility
import moment from "moment";
import { readStoredDay } from "@/lib/meals";
import { mealPlanPathParts } from "@/lib/paths";

// Firebase data
import { onValue } from "firebase/database";
import { mealDayRef, todaysMealsRef } from "./references";

// The key a day is looked up by. Not the stored path format, which lives in @/lib/paths.
export const DAY_KEY_FORMAT = "YYYY-MM-DD"

export type PlannedMealsByDay = Record<string, Record<MealType, PlannedMeal[]>>

/**
 * The whole range on screen is subscribed here, once, rather than by each dropzone. The calendar
 * and the shopping list then read the same records, so a meal cannot warn in one and be missing
 * from the other.
 */
export function useMealPlansInRange(startDate: typeof moment, dayCount: number) {
    const [ mealsByDay, setMealsByDay ] = useState<PlannedMealsByDay>({});

    // A moment is a new object on every render, so the range is tracked by the day it starts on.
    const startDayKey = startDate.format(DAY_KEY_FORMAT)

    useEffect(() => {
        // Drop the days the previous range covered. Left in place they would keep feeding the
        // shopping list meals from a week the user has already navigated away from.
        setMealsByDay({});

        const unsubscribes = Array.from({ length: dayCount }, (_, offset) => {
            const day = moment(startDayKey, DAY_KEY_FORMAT).add(offset, 'days');
            const { year, month, day: dayOfMonth } = mealPlanPathParts(day);
            const dayKey = day.format(DAY_KEY_FORMAT);

            return onValue(
                mealDayRef(year, month, dayOfMonth),
                (snapshot) => {
                    setMealsByDay((current) => ({
                        ...current,
                        [dayKey]: readStoredDay(snapshot.val())
                    }));
                }
            );
        });

        return () => {
            unsubscribes.forEach((unsubscribe) => unsubscribe());
        }
    }, [ startDayKey, dayCount ]);

    return mealsByDay
}

export function useTodaysMeals(){
    const [ meals, setMeals ] = useState<PlannedDayGroup>({
        all: [],
        breakfast: [],
        lunch: [],
        dinner: []
    });

    useEffect(() => {
        const unsubscribe = onValue(
            todaysMealsRef(),
            (snapshot) => {
                const day = readStoredDay(snapshot.val());

                // Today's page only shows the three cooked meals, so the other slots are dropped
                // here rather than rendered nowhere.
                setMeals({
                    all: [ ...day.breakfast, ...day.lunch, ...day.dinner ],
                    breakfast: day.breakfast,
                    lunch: day.lunch,
                    dinner: day.dinner
                });
            }
        );

        return () => {
            unsubscribe();
        }
    }, []);

    return meals
}
