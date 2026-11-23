"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Recipe, RecipeStatus } from "@/lib/types";
import { deleteSavedRecipe } from "@/lib/recipe-api";
import { SourceBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FieldError } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { RecipeMeta } from "@/components/ui/RecipeMeta";
import { Spinner } from "@/components/ui/States";

interface RecipeCardProps {
  recipe: Recipe & { status?: RecipeStatus };
  onDeleted?: (id: string) => void;
}

const cardClasses =
  "relative flex gap-2 rounded-md border border-line bg-paper-raised p-4 transition-[box-shadow,border-color] duration-150 ease-out";

/** One saved recipe in My recipes. The whole card links to it; delete asks in place. */
export function RecipeCard({ recipe, onDeleted }: RecipeCardProps) {
  const t = useTranslations();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(false);

  const handleDelete = async () => {
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

  if (confirming) {
    return (
      <article className={`${cardClasses} border-line-strong flex-col gap-3`}>
        <h2 className="font-display text-card-title text-balance">{recipe.name}</h2>
        <p className="text-[15px] leading-[22px]">{t("confirmDelete")}</p>
        {error ? <FieldError>{t("recipeDeleteError")}</FieldError> : null}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirming(false)} disabled={deleting}>
            {t("keepIt")}
          </Button>
          <Button className="text-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Spinner /> : <Icon icon={Trash2} />}
            {t("delete")}
          </Button>
        </div>
      </article>
    );
  }

  return (
    <article className={`${cardClasses} hover:border-line-strong hover:shadow-card items-start`}>
      <Link
        href={`/recipe?id=${recipe.id}`}
        className="flex min-w-0 flex-1 flex-col gap-2 rounded-sm text-inherit no-underline"
      >
        <h2 className="font-display text-card-title text-ink text-balance">{recipe.name}</h2>
        <RecipeMeta
          servings={recipe.servings}
          prepTime={recipe.prepTime}
          cookTime={recipe.cookTime}
        />
        <div className="flex flex-wrap gap-2">
          {recipe.status ? <StatusBadge status={recipe.status} /> : null}
          {recipe.source ? <SourceBadge source={recipe.source} /> : null}
        </div>
      </Link>
      <Button
        variant="ghost"
        icon
        className="text-ink-muted -mt-1.5 -mr-1.5 min-h-9 w-9"
        aria-label={t("deleteNamed", { name: recipe.name })}
        onClick={() => setConfirming(true)}
      >
        <Icon icon={Trash2} />
      </Button>
    </article>
  );
}
