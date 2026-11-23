"use client";

import { useTranslations } from "next-intl";
import { Bookmark, BookmarkCheck, ChefHat } from "lucide-react";
import { Recipe, RecipeStatus, SavedRecipeState } from "@/lib/types";
import { createSavedRecipe, updateSavedRecipe } from "@/lib/recipe-api";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { FieldError } from "@/components/ui/Field";

interface ActionButtonsProps {
  recipe: Recipe;
  savedRecipe?: SavedRecipeState | null;
  onSaved?: (saved: SavedRecipeState) => void;
}

/** Save / Mark as made toggles. Both are secondary; the pressed one turns tomato-soft. */
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
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <Button
          aria-pressed={savedStatus === "saved"}
          disabled={saving}
          onClick={() => handleSave("saved")}
        >
          <Icon icon={savedStatus === "saved" ? BookmarkCheck : Bookmark} />
          {savedStatus === "saved" ? t("saved") : t("save")}
        </Button>
        <Button
          aria-pressed={savedStatus === "made"}
          disabled={saving}
          onClick={() => handleSave("made")}
        >
          <Icon icon={ChefHat} />
          {savedStatus === "made" ? t("made") : t("markAsMade")}
        </Button>
      </div>
      {error ? <FieldError>{t("recipeSaveError")}</FieldError> : null}
    </div>
  );
}
