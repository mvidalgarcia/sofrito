"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Recipe, RecipeStatus } from "@/lib/types";
import { deleteRecipe } from "@/lib/storage";
import { DELETE_ANIMATION_DELAY_MS } from "@/lib/constants";
import Link from "next/link";

interface RecipeCardProps {
  recipe: Recipe & { status?: RecipeStatus };
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const t = useTranslations();
  const [deleted, setDeleted] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!window.confirm(t("confirmDelete"))) return;
    setDeleted(true);
    setTimeout(() => deleteRecipe(recipe.id), DELETE_ANIMATION_DELAY_MS);
  };

  if (deleted) return null;

  return (
    <Link
      href={`/recipe?id=${recipe.id}`}
      className="block rounded-xl bg-white p-4 shadow transition-all hover:shadow-md dark:bg-zinc-900"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">{recipe.name}</h3>
          <div className="flex items-center gap-2 text-sm">
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              {t(recipe.status || "saved")}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">
              {recipe.servings} 🍽️ · {recipe.prepTime} · {recipe.cookTime}
            </span>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="cursor-pointer rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          title={t("delete")}
        >
          ✕
        </button>
      </div>
    </Link>
  );
}
