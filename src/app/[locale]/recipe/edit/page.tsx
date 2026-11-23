"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { FullPageLoading } from "@/components/FullPageLoading";
import { useTranslations } from "next-intl";
import { Recipe, RecipeStatus } from "@/lib/types";
import { getSavedRecipe, RecipeApiError, updateSavedRecipe } from "@/lib/recipe-api";
import { Check } from "lucide-react";
import { RecipeForm } from "@/components/RecipeForm";
import { AppShell, BackButton, PageHeader } from "@/components/PageHeader";
import { RecipeLoadError, RecipeNotFound } from "@/components/RecipeStates";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState, PageLoading } from "@/components/ui/States";

function EditContent() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [recipe, setRecipe] = useState<(Recipe & { status: RecipeStatus }) | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!id) {
      setLoading(false);
      setLoadError(false);
      setRecipe(null);
      return;
    }

    setLoading(true);
    setLoadError(false);
    setRecipe(null);

    getSavedRecipe(id)
      .then((found) => {
        if (!cancelled) setRecipe(found);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof RecipeApiError && err.status === 404) {
          setLoadError(false);
          return;
        }
        setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const handleSubmit = async (data: Omit<Recipe, "id" | "source">) => {
    if (!id || saving) return;
    setSaving(true);
    setSaveError(false);
    try {
      await updateSavedRecipe(id, data);
      setSaved(true);
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  let body;
  if (saved) {
    body = (
      <EmptyState
        icon={Check}
        title={t("recipeSaved")}
        actions={
          <ButtonLink href={`/recipe?id=${id}`} variant="primary">
            {t("backList")}
          </ButtonLink>
        }
      />
    );
  } else if (loading) {
    body = <PageLoading label={t("loadingRecipe")} />;
  } else if (loadError) {
    body = <RecipeLoadError onRetry={() => setReloadKey((key) => key + 1)} />;
  } else if (!recipe) {
    body = <RecipeNotFound />;
  } else {
    body = (
      <>
        <h1 className="font-display text-display-l tracking-[-0.01em]">{t("editRecipeTitle")}</h1>
        <RecipeForm
          initialData={recipe}
          onSubmit={handleSubmit}
          cancelHref={`/recipe?id=${id}`}
          submitLabel={t("saveRecipe")}
          saving={saving}
          error={saveError ? t("recipeSaveError") : null}
        />
      </>
    );
  }

  return (
    <AppShell
      header={
        <PageHeader
          left={<BackButton href={id ? `/recipe?id=${id}` : "/recipes"} />}
          title={recipe?.name}
        />
      }
    >
      {body}
    </AppShell>
  );
}

export default function EditRecipePage() {
  return (
    <Suspense fallback={<FullPageLoading />}>
      <EditContent />
    </Suspense>
  );
}
