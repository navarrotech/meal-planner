// Copyright © 2024 Navarrotech

// React.js
import { useState, useEffect } from "react";

// Typescript
import type { MealType, PlannedMeal, PlannedDayGroup } from "@/types";

// Firebase data
import { onValue } from "firebase/database";
import { mealsListRef, todaysMealsRef } from "./references";

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

export function useTodaysMeals(){
    const [ meals, setMeals ] = useState<PlannedDayGroup>({
        breakfast: [],
        lunch: [],
        dinner: []
    });

    useEffect(() => {
        const unsubscribe = onValue(
            todaysMealsRef(),
            (snapshot) => {
                const data = snapshot.val() as Record<MealType, Record<string, PlannedMeal>> | null;
                if (!data){
                    return;
                }

                // Some small re-structuring to make it easier to work with

                const grouping: PlannedDayGroup = {
                    breakfast: [],
                    lunch: [],
                    dinner: []
                }

                data.breakfast && Object.values(data.breakfast).forEach((meal) => {
                    grouping.breakfast.push(meal);
                })
                data.lunch && Object.values(data.lunch).forEach((meal) => {
                    grouping.lunch.push(meal);
                })
                data.dinner && Object.values(data.dinner).forEach((meal) => {
                    grouping.dinner.push(meal);
                })

                setMeals(grouping);
            }
        );

        return () => {
            unsubscribe();
        }
    }, []);
    
    return meals
}
