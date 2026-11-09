import type { Recipe } from "@/lib/types";

export type ShareableRecipe = Omit<Recipe, "id" | "status" | "createdAt">;

export function toShareableRecipe(recipe: ShareableRecipe): ShareableRecipe {
  return {
    name: recipe.name,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    servings: recipe.servings,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    ...(recipe.searchQuery ? { searchQuery: recipe.searchQuery } : {}),
    ...(recipe.locale ? { locale: recipe.locale } : {}),
    ...(recipe.source ? { source: recipe.source } : {}),
  };
}
