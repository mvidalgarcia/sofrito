import "server-only";

import { drizzleRecipeRepository } from "./drizzle-recipe-repository";
import { memoryRecipeRepository } from "./memory-recipe-repository";
import type { RecipeRepository } from "./recipe-repository";

export function isMemoryRepository(): boolean {
  return process.env.RECIPE_REPOSITORY === "memory";
}

export function getRecipeRepository(): RecipeRepository {
  const repository = process.env.RECIPE_REPOSITORY;

  if (repository === "memory") return memoryRecipeRepository;
  if (repository === "postgres") return drizzleRecipeRepository;

  throw new Error("RECIPE_REPOSITORY must be set to either 'postgres' or 'memory'");
}
