// Copyright © 2024 Navarrotech

// React.js
import { useState, useEffect } from "react";

// Typescript
import type { MealType, PlannedMeal, PlannedDayGroup } from "@/types";
import type { StoredDay } from "@/lib/meals";

// Utility
import moment from "moment";
import { readStoredDay } from "@/lib/meals";
import { mealPlanPathParts } from "@/lib/paths";

// Firebase data
import { onValue } from "firebase/database";
import { mealMonthRef, todaysMealsRef } from "./references";

// The key a day is looked up by. Not the stored path format, which lives in @/lib/paths.
export const DAY_KEY_FORMAT = "YYYY-MM-DD"

// The prefix every day key of one month shares, used to replace a month's days wholesale.
const MONTH_KEY_FORMAT = "YYYY-MM"

export type PlannedMealsByDay = Record<string, Record<MealType, PlannedMeal[]>>

/**
 * Every day from `startDate` for `dayCount` days, keyed by `YYYY-MM-DD`. The calendar draws the
 * week it shows out of this, and the shopping list reads the whole span, so one subscription
 * feeds both and a meal cannot warn in one and be missing from the other.
 *
 * Months are subscribed rather than days: a two month span costs two listeners this way, where a
 * day at a time would cost sixty. The cost of that is having to replace a month's days wholesale
 * when its snapshot arrives, or a deleted day would linger.
 */
export function useMealPlansInRange(startDate: typeof moment, dayCount: number) {
    const [ mealsByDay, setMealsByDay ] = useState<PlannedMealsByDay>({});

    // A moment is a new object on every render, so the range is tracked by the day it starts on.
    const startDayKey = startDate.format(DAY_KEY_FORMAT)

    useEffect(() => {
        // Drop the days the previous range covered. Left in place they would keep feeding the
        // shopping list meals from a span the user has already navigated away from.
        setMealsByDay({});

        const firstDay = moment(startDayKey, DAY_KEY_FORMAT);
        const lastDay = firstDay.clone().add(dayCount - 1, 'days');
        const lastDayKey = lastDay.format(DAY_KEY_FORMAT);

        const months = [];
        const cursor = firstDay.clone().startOf('month');

        while (cursor.isSameOrBefore(lastDay, 'month')) {
            months.push({
                ...mealPlanPathParts(cursor),
                // Days arrive keyed by day of the month alone, so the month they belong to has
                // to come from the subscription rather than from the record.
                dayKeyPrefix: cursor.format(MONTH_KEY_FORMAT) + "-"
            });
            cursor.add(1, 'month');
        }

        const unsubscribes = months.map(({ year, month, dayKeyPrefix }) => onValue(
            mealMonthRef(year, month),
            (snapshot) => {
                const days = snapshot.val() as Record<string, StoredDay> | null;

                setMealsByDay((current) => {
                    const next: PlannedMealsByDay = {};

                    for (const [ dayKey, slots ] of Object.entries(current)) {
                        if (!dayKey.startsWith(dayKeyPrefix)) {
                            next[dayKey] = slots;
                        }
                    }

                    for (const [ dayOfMonth, slots ] of Object.entries(days || {})) {
                        const dayKey = dayKeyPrefix + dayOfMonth;

                        // A month reaches past both ends of the span it was subscribed for.
                        if (!slots || dayKey < startDayKey || dayKey > lastDayKey) {
                            continue;
                        }

                        next[dayKey] = readStoredDay(slots);
                    }

                    return next;
                });
            }
        ));

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
