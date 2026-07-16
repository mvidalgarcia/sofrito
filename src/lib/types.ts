export interface Ingredient {
  item: string;
  amount: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  steps: string[];
  servings: number;
  prepTime: string;
  cookTime: string;
  searchQuery?: string;
  createdAt?: string;
  status?: RecipeStatus;
  locale?: string;
  source?: "llm" | "manual";
}

export type RecipeStatus = "saved" | "made";

export type SavedRecipe = Recipe & {
  status: RecipeStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateSavedRecipe = Omit<Recipe, "id" | "status" | "createdAt"> & {
  status: RecipeStatus;
};

export type UpdateSavedRecipe = Partial<CreateSavedRecipe>;
