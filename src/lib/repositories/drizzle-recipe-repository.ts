import { and, count, desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { recipes, type RecipeRow } from "@/db/schema";
import type { CreateSavedRecipe, RecipeStatus, SavedRecipe, UpdateSavedRecipe } from "@/lib/types";
import type { RecipeRepository } from "./recipe-repository";

function toSavedRecipe(row: RecipeRow): SavedRecipe {
  return {
    id: row.id,
    name: row.name,
    ingredients: row.ingredients,
    steps: row.steps,
    servings: row.servings,
    prepTime: row.prepTime,
    cookTime: row.cookTime,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    ...(row.searchQuery ? { searchQuery: row.searchQuery } : {}),
    ...(row.locale ? { locale: row.locale } : {}),
    ...(row.source ? { source: row.source } : {}),
  };
}

export const drizzleRecipeRepository: RecipeRepository = {
  async list(ownerEmail, status?: RecipeStatus) {
    const rows = await getDb()
      .select()
      .from(recipes)
      .where(
        status
          ? and(eq(recipes.ownerEmail, ownerEmail), eq(recipes.status, status))
          : eq(recipes.ownerEmail, ownerEmail),
      )
      .orderBy(desc(recipes.createdAt));

    return rows.map(toSavedRecipe);
  },

  async count(ownerEmail) {
    const [result] = await getDb()
      .select({ value: count() })
      .from(recipes)
      .where(eq(recipes.ownerEmail, ownerEmail));
    return result.value;
  },

  async create(ownerEmail, recipe: CreateSavedRecipe) {
    const [created] = await getDb()
      .insert(recipes)
      .values({ ownerEmail, ...recipe })
      .returning();
    return toSavedRecipe(created);
  },

  async getById(ownerEmail, id) {
    const [row] = await getDb()
      .select()
      .from(recipes)
      .where(and(eq(recipes.ownerEmail, ownerEmail), eq(recipes.id, id)))
      .limit(1);
    return row ? toSavedRecipe(row) : null;
  },

  async update(ownerEmail, id, update: UpdateSavedRecipe) {
    const [updated] = await getDb()
      .update(recipes)
      .set({ ...update, updatedAt: new Date().toISOString() })
      .where(and(eq(recipes.ownerEmail, ownerEmail), eq(recipes.id, id)))
      .returning();
    return updated ? toSavedRecipe(updated) : null;
  },

  async delete(ownerEmail, id) {
    const deleted = await getDb()
      .delete(recipes)
      .where(and(eq(recipes.ownerEmail, ownerEmail), eq(recipes.id, id)))
      .returning({ id: recipes.id });
    return deleted.length > 0;
  },
};
