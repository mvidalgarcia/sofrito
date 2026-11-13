"use client";

import { useTranslations } from "next-intl";
import { Recipe, RecipeStatus, SavedRecipeState } from "@/lib/types";
import { createSavedRecipe, updateSavedRecipe } from "@/lib/recipe-api";
import { useEffect, useState } from "react";

interface ActionButtonsProps {
  recipe: Recipe;
  savedRecipe?: SavedRecipeState | null;
  onSaved?: (saved: SavedRecipeState) => void;
}

export function ActionButtons({ recipe, savedRecipe, onSaved }: ActionButtonsProps) {
  const t = useTranslations();
  const savedRecipeId = savedRecipe?.id;
  const savedRecipeStatus = savedRecipe?.status;
  const [savedId, setSavedId] = useState<string | null>(
    savedRecipeId ?? (recipe.status ? recipe.id : null),
  );
  const [savedStatus, setSavedStatus] = useState<RecipeStatus | null>(
    savedRecipeStatus ?? recipe.status ?? null,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setSavedId(savedRecipeId ?? (recipe.status ? recipe.id : null));
    setSavedStatus(savedRecipeStatus ?? recipe.status ?? null);
    setError(false);
  }, [recipe.id, recipe.status, savedRecipeId, savedRecipeStatus]);

  const handleSave = async (status: RecipeStatus) => {
    if (saving || savedStatus === status) return;
    setSaving(true);
    setError(false);
    try {
      const result = savedId
        ? await updateSavedRecipe(savedId, { status })
        : await createSavedRecipe(recipe, status);
      const saved = { id: result.id, status: result.status };
      setSavedId(saved.id);
      setSavedStatus(saved.status);
      onSaved?.(saved);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6 flex flex-wrap gap-2 border-t border-zinc-200 pt-6 dark:border-zinc-700">
      <button
        onClick={() => handleSave("saved")}
        disabled={saving}
        className={`rounded-lg px-4 py-2 font-medium transition-colors ${
          savedStatus === "saved"
            ? "bg-amber-600 text-white"
            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        }`}
      >
        {savedStatus === "saved" ? `✓ ${t("saved")}` : t("save")}
      </button>
      <button
        onClick={() => handleSave("made")}
        disabled={saving}
        className={`rounded-lg px-4 py-2 font-medium transition-colors ${
          savedStatus === "made"
            ? "bg-amber-600 text-white"
            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        }`}
      >
        {savedStatus === "made" ? `✓ ${t("made")}` : t("markAsMade")}
      </button>
      {error ? <p className="w-full text-sm text-red-500">{t("recipeSaveError")}</p> : null}
    </div>
  );
}
