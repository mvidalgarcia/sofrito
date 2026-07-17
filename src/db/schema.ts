import { index, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { Ingredient } from "@/lib/types";

export const recipeStatusEnum = pgEnum("recipe_status", ["saved", "made"]);
export const recipeSourceEnum = pgEnum("recipe_source", ["llm", "manual"]);

export const recipes = pgTable(
  "recipes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerEmail: text("owner_email").notNull(),
    name: text("name").notNull(),
    ingredients: jsonb("ingredients").$type<Ingredient[]>().notNull(),
    steps: jsonb("steps").$type<string[]>().notNull(),
    servings: integer("servings").notNull(),
    prepTime: text("prep_time").notNull(),
    cookTime: text("cook_time").notNull(),
    searchQuery: text("search_query"),
    locale: text("locale"),
    source: recipeSourceEnum("source"),
    status: recipeStatusEnum("status").notNull().default("saved"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("recipes_owner_email_idx").on(table.ownerEmail),
    index("recipes_owner_status_idx").on(table.ownerEmail, table.status),
  ],
);

export type RecipeRow = typeof recipes.$inferSelect;
export type NewRecipeRow = typeof recipes.$inferInsert;
