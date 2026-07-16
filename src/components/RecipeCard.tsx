"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Recipe, RecipeStatus } from "@/lib/types";
import { deleteSavedRecipe } from "@/lib/recipe-api";
import Link from "next/link";

interface RecipeCardProps {
  recipe: Recipe & { status?: RecipeStatus };
  onDeleted?: (id: string) => void;
}

export function RecipeCard({ recipe, onDeleted }: RecipeCardProps) {
  const t = useTranslations();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(t("confirmDelete"))) return;
    setDeleting(true);
    setError(false);
    try {
      await deleteSavedRecipe(recipe.id);
      onDeleted?.(recipe.id);
    } catch {
      setDeleting(false);
      setError(true);
    }
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow transition-all hover:shadow-md dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <Link href={`/recipe?id=${recipe.id}`} className="min-w-0 flex-1">
          <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">{recipe.name}</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              {t(recipe.status || "saved")}
            </span>
            {recipe.source && (
              <span
                className={`rounded px-2 py-0.5 text-xs font-medium ${
                  recipe.source === "llm"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                }`}
              >
                {recipe.source === "llm" ? "LLM" : "Manual"}
              </span>
            )}
            <span className="text-zinc-500 dark:text-zinc-400">
              {recipe.servings} 🍽️ · {recipe.prepTime} · {recipe.cookTime}
            </span>
          </div>
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="cursor-pointer rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          title={t("delete")}
        >
          {deleting ? "…" : "✕"}
        </button>
      </div>
      {error ? <p className="mt-2 text-sm text-red-500">{t("recipeDeleteError")}</p> : null}
    </div>
  );
}
