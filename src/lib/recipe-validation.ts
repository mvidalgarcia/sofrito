import { z } from "zod";

const ingredientSchema = z.object({
  item: z.string().trim().min(1).max(200),
  amount: z.string().trim().min(1).max(100),
});

const recipeFields = z.object({
  name: z.string().trim().min(1).max(200),
  ingredients: z.array(ingredientSchema).min(1).max(100),
  steps: z.array(z.string().trim().min(1).max(2000)).min(1).max(100),
  servings: z.number().int().min(1).max(12),
  prepTime: z.string().trim().max(100),
  cookTime: z.string().trim().max(100),
  searchQuery: z.string().trim().max(500).optional(),
  locale: z.string().trim().max(20).optional(),
  source: z.enum(["llm", "manual"]).optional(),
  status: z.enum(["saved", "made"]),
});

export const createSavedRecipeSchema = recipeFields.strict();

export const updateSavedRecipeSchema = z
  .object(recipeFields.shape)
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, "At least one field is required");
