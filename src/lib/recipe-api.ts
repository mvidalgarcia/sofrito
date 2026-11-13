import type {
  CreateSavedRecipe,
  Recipe,
  RecipeStatus,
  SavedRecipe,
  UpdateSavedRecipe,
} from "@/lib/types";

export class RecipeApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "RecipeApiError";
  }
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new RecipeApiError(body?.error ?? "Recipe request failed", response.status);
  }
  return response.json() as Promise<T>;
}

function toCreateRecipe(recipe: Omit<Recipe, "id">, status: RecipeStatus): CreateSavedRecipe {
  return {
    name: recipe.name,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    servings: recipe.servings,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    status,
    ...(recipe.searchQuery ? { searchQuery: recipe.searchQuery } : {}),
    ...(recipe.locale ? { locale: recipe.locale } : {}),
    ...(recipe.source ? { source: recipe.source } : {}),
  };
}

export function listSavedRecipes(status?: RecipeStatus): Promise<SavedRecipe[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return requestJson<SavedRecipe[]>(`/api/saved-recipes${query}`);
}

export function getSavedRecipe(id: string): Promise<SavedRecipe> {
  return requestJson<SavedRecipe>(`/api/saved-recipes/${encodeURIComponent(id)}`);
}

export function createSavedRecipe(
  recipe: Omit<Recipe, "id">,
  status: RecipeStatus,
): Promise<SavedRecipe> {
  return requestJson<SavedRecipe>("/api/saved-recipes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toCreateRecipe(recipe, status)),
  });
}

export function updateSavedRecipe(id: string, update: UpdateSavedRecipe): Promise<SavedRecipe> {
  return requestJson<SavedRecipe>(`/api/saved-recipes/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
}

export async function deleteSavedRecipe(id: string): Promise<void> {
  const response = await fetch(`/api/saved-recipes/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new RecipeApiError(body?.error ?? "Failed to delete recipe", response.status);
  }
}
