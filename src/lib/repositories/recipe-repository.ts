import type { CreateSavedRecipe, RecipeStatus, SavedRecipe, UpdateSavedRecipe } from "@/lib/types";

export interface RecipeRepository {
  list(ownerEmail: string, status?: RecipeStatus): Promise<SavedRecipe[]>;
  create(ownerEmail: string, recipe: CreateSavedRecipe): Promise<SavedRecipe>;
  getById(ownerEmail: string, id: string): Promise<SavedRecipe | null>;
  update(ownerEmail: string, id: string, recipe: UpdateSavedRecipe): Promise<SavedRecipe | null>;
  delete(ownerEmail: string, id: string): Promise<boolean>;
  reset?(): Promise<void>;
}
