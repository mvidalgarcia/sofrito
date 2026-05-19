"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Recipe } from "@/lib/types";
import { DEFAULT_SERVINGS, MIN_SERVINGS, MAX_SERVINGS } from "@/lib/constants";
import { generateId } from "@/lib/id";
import { RecipeDetail } from "@/components/RecipeDetail";
import { ActionButtons } from "@/components/ActionButtons";

export function IngredientSearch() {
  const t = useTranslations();
  const tError = useTranslations();
  const locale = useLocale();
  const [ingredients, setIngredients] = useState([""]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [servings, setServings] = useState(DEFAULT_SERVINGS);

  const handleSearch = async () => {
    const valid = ingredients.filter((i) => i.trim());
    if (valid.length === 0) return;

    setLoading(true);
    setError("");
    setRecipes([]);
    setExpandedIndex(null);

    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: valid, locale, servings }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || tError("apiNotConfigured"));
      }

      const withIds = (data.recipes || []).map((r: Recipe) => ({
        ...r,
        id: generateId(r.name),
        locale,
      }));
      setRecipes(withIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : tError("apiNotConfigured"));
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => setIngredients([...ingredients, ""]);

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const updateIngredient = (index: number, value: string) => {
    const next = [...ingredients];
    next[index] = value;
    setIngredients(next);
  };

  return (
    <div>
      <div className="mb-8 space-y-2">
        {ingredients.map((ing, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={ing}
              onChange={(e) => updateIngredient(i, e.target.value)}
              placeholder={t("ingredientPlaceholder")}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder-zinc-400 focus:ring-2 focus:ring-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            {ingredients.length > 1 && (
              <button
                onClick={() => removeIngredient(i)}
                className="rounded-lg bg-zinc-100 px-3 py-3 text-zinc-500 transition-colors hover:bg-red-100 hover:text-red-600 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <button
            onClick={addIngredient}
            className="rounded-lg border border-dashed border-zinc-300 px-4 py-2 text-sm text-zinc-500 transition-colors hover:border-amber-500 hover:text-amber-600 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-amber-400 dark:hover:text-amber-400"
          >
            + {t("addIngredient")}
          </button>
          <button
            onClick={handleSearch}
            disabled={loading || ingredients.every((i) => !i.trim())}
            className="ml-auto rounded-lg bg-amber-600 px-6 py-2 font-medium text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "..." : t("searchButton")}
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("servingsInput")}
        </label>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setServings(Math.max(MIN_SERVINGS, servings - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            −
          </button>
          <span className="flex h-8 w-10 items-center justify-center rounded-lg bg-white text-sm font-semibold text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
            {servings}
          </span>
          <button
            onClick={() => setServings(Math.min(MAX_SERVINGS, servings + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            +
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600"></div>
          <div className="text-lg text-zinc-600 dark:text-zinc-400">{t("searching")}</div>
        </div>
      )}

      {recipes.length > 0 && !loading && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            {t("suggestedRecipes")}
          </h2>
          <div className="space-y-3">
            {recipes.map((r, i) => (
              <div
                key={r.id}
                className="rounded-xl bg-white shadow transition-all dark:bg-zinc-900"
              >
                <button
                  onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                  className="flex w-full items-center justify-between px-4 py-4 text-left"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{r.name}</h3>
                    <div className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {r.servings} 🍽️ · {r.prepTime} · {r.cookTime}
                    </div>
                  </div>
                  <span className="ml-2 text-zinc-400 transition-transform data-[expanded=true]:rotate-180">
                    ▼
                  </span>
                </button>

                {expandedIndex !== i && (
                  <div className="px-4 pb-2">
                    <ActionButtons recipe={r} />
                  </div>
                )}

                {expandedIndex === i && (
                  <div className="border-t border-zinc-200 dark:border-zinc-700">
                    <RecipeDetail recipe={r} showShareButton={false} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
