"use client";

import { useTranslations } from "next-intl";
import { Recipe } from "@/lib/types";
import {
  DEFAULT_LOCALE,
  COPY_FEEDBACK_DURATION_MS,
  MIN_SERVINGS,
  MAX_SERVINGS,
} from "@/lib/constants";
import { scaleIngredientAmount } from "@/lib/scale-ingredient";
import { ActionButtons } from "./ActionButtons";
import { useEffect, useMemo, useState } from "react";

interface RecipeDetailProps {
  recipe: Recipe;
  showShareButton?: boolean;
}

export function RecipeDetail({ recipe, showShareButton = true }: RecipeDetailProps) {
  const t = useTranslations();
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [displayServings, setDisplayServings] = useState(recipe.servings);

  useEffect(() => {
    setDisplayServings(recipe.servings);
  }, [recipe.id, recipe.servings]);

  const scaleFactor = displayServings / recipe.servings;
  const scaledIngredients = useMemo(
    () =>
      recipe.ingredients.map((ing) => ({
        item: ing.item,
        ...scaleIngredientAmount(ing.amount, scaleFactor),
      })),
    [recipe.ingredients, scaleFactor],
  );

  const handleShare = async () => {
    setSharing(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const pathParts = window.location.pathname.split("/").filter(Boolean);
      const locale = pathParts[0] || DEFAULT_LOCALE;
      const url = `${window.location.origin}/${locale}/share?id=${data.id}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS);
    } catch (e) {
      console.error("Share failed:", e);
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900">
      <div className="mb-4 flex items-start justify-between gap-4">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{recipe.name}</h2>
        {recipe.source && (
          <span
            className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
              recipe.source === "llm"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            }`}
          >
            {recipe.source === "llm" ? "LLM" : "Manual"}
          </span>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <span>🍽️ {t("servings")}:</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={t("decreaseServings")}
              data-testid="decrease-servings"
              onClick={() => setDisplayServings(Math.max(MIN_SERVINGS, displayServings - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              −
            </button>
            <span
              data-testid="display-servings"
              className="flex h-7 min-w-8 items-center justify-center rounded-lg bg-zinc-50 px-2 text-sm font-semibold text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100"
            >
              {displayServings}
            </span>
            <button
              type="button"
              aria-label={t("increaseServings")}
              data-testid="increase-servings"
              onClick={() => setDisplayServings(Math.min(MAX_SERVINGS, displayServings + 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
            >
              +
            </button>
          </div>
        </div>
        <span>
          ⏱️ {t("prepTime")}: {recipe.prepTime}
        </span>
        <span>
          🔥 {t("cookTime")}: {recipe.cookTime}
        </span>
      </div>

      <div className="mb-6">
        <h3 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {t("ingredients")}
        </h3>
        <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
          {scaledIngredients.map((ing, i) => {
            const showApproximate = scaleFactor !== 1 && !ing.scaled;
            return (
              <li
                key={i}
                className={
                  showApproximate
                    ? "text-zinc-500 italic dark:text-zinc-500"
                    : "text-zinc-700 dark:text-zinc-300"
                }
                title={showApproximate ? t("approximateAmount") : undefined}
              >
                • {showApproximate ? "~ " : ""}
                {ing.amount} {ing.item}
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {t("steps")}
        </h3>
        <ol className="space-y-3">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3 text-zinc-700 dark:text-zinc-300">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <ActionButtons recipe={recipe} />

      {showShareButton && (
        <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-700">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {sharing ? "..." : copied ? "✓ " + t("copied") : "🔗 " + t("share")}
          </button>
        </div>
      )}
    </div>
  );
}
