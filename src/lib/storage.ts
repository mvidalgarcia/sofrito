import { Recipe, RecipeStatus } from "./types";
import { generateId } from "./id";

export function saveRecipe(recipe: Recipe, status: RecipeStatus): void {
  const key = "sofrito_recipes";
  const existing: (Recipe & { status: RecipeStatus; createdAt: string })[] = JSON.parse(
    localStorage.getItem(key) || "[]",
  );
  const nameExists = existing.some((r) => r.name === recipe.name);

  if (nameExists) {
    const updated = existing.map((r) => (r.name === recipe.name ? { ...r, status } : r));
    localStorage.setItem(key, JSON.stringify(updated));
  } else {
    const updated = [
      {
        ...recipe,
        id: recipe.id || generateId(recipe.name),
        createdAt: new Date().toISOString(),
        status,
      },
      ...existing,
    ].slice(0, 100);
    localStorage.setItem(key, JSON.stringify(updated));
  }
}

export function getAllRecipes(): (Recipe & { status: RecipeStatus; createdAt: string })[] {
  const key = "sofrito_recipes";
  return JSON.parse(localStorage.getItem(key) || "[]");
}

export function getRecipesByStatus(status: RecipeStatus): (Recipe & { status: RecipeStatus })[] {
  const all = getAllRecipes();
  return all.filter((r) => r.status === status);
}

export function isRecipeSavedAny(recipe: Recipe): RecipeStatus | null {
  const all = getAllRecipes();
  const found = all.find((r) => r.name === recipe.name);
  return found?.status || null;
}

export function isNameSaved(name: string): RecipeStatus | null {
  const all = getAllRecipes();
  const found = all.find((r) => r.name === name);
  return found?.status || null;
}

export function getRecipeById(
  id: string,
): (Recipe & { status: RecipeStatus; createdAt: string }) | null {
  const all = getAllRecipes();
  return all.find((r) => r.id === id) || null;
}

export function deleteRecipe(id: string): void {
  const key = "sofrito_recipes";
  const existing: (Recipe & { status: RecipeStatus })[] = JSON.parse(
    localStorage.getItem(key) || "[]",
  );
  const updated = existing.filter((r) => r.id !== id);
  localStorage.setItem(key, JSON.stringify(updated));
}

export function updateRecipeStatus(id: string, status: RecipeStatus): void {
  const key = "sofrito_recipes";
  const existing: (Recipe & { status: RecipeStatus })[] = JSON.parse(
    localStorage.getItem(key) || "[]",
  );
  const updated = existing.map((r) => (r.id === id ? { ...r, status } : r));
  localStorage.setItem(key, JSON.stringify(updated));
}
