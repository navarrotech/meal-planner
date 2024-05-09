// Copyright © 2024 Navarrotech

// Typescript
import type { MealType, Recipe } from "@/types";

// Redux
import { useSelector } from "@/store";

export function useRecipes(
    searchTitleTextFilter?: string,
    filterTags?: string[],
    filterWantedIngredients?: string[],
    filterUnwantedIngredients?: string[],
){
    const byType = useSelector(state => state.recipes.byType)
    const keys = useSelector(state => state.recipes.keys)
    const byId = useSelector(state => state.recipes.byId)

    let filteredKeys: string[] = keys;
    
    // Filter by title if provided
    if (searchTitleTextFilter) {
        filteredKeys = filteredKeys.filter(key => {
            const recipe = byId[key];
            return recipe.title.toLowerCase().includes(searchTitleTextFilter.toLowerCase());
        });
    }
    // Filter by tags if provided
    if (filterTags && filterTags.length > 0) {
        filteredKeys = filteredKeys.filter(key => {
            const recipe = byId[key];
            return recipe.tags.some(tag => filterTags.includes(tag));
        });
    }

    // Filter by wanted ingredients if provided
    if (filterWantedIngredients && filterWantedIngredients.length > 0) {
        filteredKeys = filteredKeys.filter(key => {
            const recipe = byId[key];
            return filterWantedIngredients.every(ingredient => recipe.ingredients.includes(ingredient));
        });
    }

    // Filter by unwanted ingredients if provided
    if (filterUnwantedIngredients && filterUnwantedIngredients.length > 0) {
        filteredKeys = filteredKeys.filter(key => {
            const recipe = byId[key];
            return !filterUnwantedIngredients.some(ingredient => recipe.ingredients.includes(ingredient));
        });
    }

    // Construct the filteredById map from the filtered keys
    const filteredById: Record<string, Recipe> = {};
    filteredKeys.forEach(key => {
        filteredById[key] = byId[key];
    });

    const typeKeys = Object.keys(byType) as MealType[]
    const byTypeFiltered = {} as Record<MealType, Recipe[]>;

    typeKeys.forEach(type => {
        byTypeFiltered[type] = byType[type].filter(recipe => filteredKeys.includes(recipe.id));
    })

    return {
        keys: filteredKeys,
        byId: filteredById,
        byType: byTypeFiltered,
    };
}
