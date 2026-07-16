import { randomUUID } from "node:crypto";
import type { CreateSavedRecipe, RecipeStatus, SavedRecipe, UpdateSavedRecipe } from "@/lib/types";
import type { RecipeRepository } from "./recipe-repository";

const globalMemory = globalThis as typeof globalThis & {
  sofritoMemoryRecipes?: Map<string, SavedRecipe>;
};
const recipes = (globalMemory.sofritoMemoryRecipes ??= new Map<string, SavedRecipe>());

function key(ownerEmail: string, id: string) {
  return `${ownerEmail}:${id}`;
}

export const memoryRecipeRepository: RecipeRepository = {
  async list(ownerEmail, status?: RecipeStatus) {
    return [...recipes.entries()]
      .filter(
        ([entryKey, recipe]) =>
          entryKey.startsWith(`${ownerEmail}:`) && (!status || recipe.status === status),
      )
      .map(([, recipe]) => recipe)
      .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async count(ownerEmail) {
    return [...recipes.keys()].filter((entryKey) => entryKey.startsWith(`${ownerEmail}:`)).length;
  },

  async create(ownerEmail, recipe: CreateSavedRecipe) {
    const now = new Date().toISOString();
    const savedRecipe: SavedRecipe = {
      ...recipe,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    recipes.set(key(ownerEmail, savedRecipe.id), savedRecipe);
    return savedRecipe;
  },

  async getById(ownerEmail, id) {
    return recipes.get(key(ownerEmail, id)) ?? null;
  },

  async update(ownerEmail, id, update: UpdateSavedRecipe) {
    const entryKey = key(ownerEmail, id);
    const existing = recipes.get(entryKey);
    if (!existing) return null;

    const updated: SavedRecipe = {
      ...existing,
      ...update,
      id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    recipes.set(entryKey, updated);
    return updated;
  },

  async delete(ownerEmail, id) {
    return recipes.delete(key(ownerEmail, id));
  },

  async reset() {
    recipes.clear();
  },
};
