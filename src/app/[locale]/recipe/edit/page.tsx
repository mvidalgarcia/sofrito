"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useTranslations } from "next-intl";
import { Recipe, RecipeStatus } from "@/lib/types";
import { getSavedRecipe, RecipeApiError, updateSavedRecipe } from "@/lib/recipe-api";
import { RecipeForm } from "@/components/RecipeForm";
import { PageHeader } from "@/components/PageHeader";

function EditContent() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [recipe, setRecipe] = useState<(Recipe & { status: RecipeStatus }) | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);
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
    if (!id) return;
    setSaveError(false);
    try {
      await updateSavedRecipe(id, data);
      setSaved(true);
    } catch {
      setSaveError(true);
    }
  };

  if (saved) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="mb-4 text-xl font-semibold text-green-600 dark:text-green-400">
            ✓ {t("recipeSaved")}
          </p>
          <Link
            href={`/recipe?id=${id}`}
            className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition-colors hover:bg-amber-700"
          >
            {t("back")}
          </Link>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
        <main className="mx-auto max-w-3xl px-4 py-16 text-center text-zinc-500 dark:text-zinc-400">
          {t("loadingRecipes")}
        </main>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="mb-4 text-red-500">{t("recipeLoadError")}</p>
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            className="cursor-pointer font-medium text-amber-600 hover:text-amber-700"
          >
            {t("retry")}
          </button>
        </main>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
        <main className="mx-auto max-w-3xl px-4 py-16">
          <div className="text-center">
            <p className="mb-4 text-zinc-500 dark:text-zinc-400">{t("notFound")}</p>
            <Link href="/" className="font-medium text-amber-600 hover:text-amber-700">
              ← {t("back")}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <PageHeader
        left={
          <Link
            href={`/recipe?id=${id}`}
            className="font-medium text-amber-600 hover:text-amber-700"
          >
            ← {t("backList")}
          </Link>
        }
      />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {t("editRecipeTitle")}
        </h1>

        {saveError ? <p className="mb-4 text-sm text-red-500">{t("recipeSaveError")}</p> : null}
        <RecipeForm initialData={recipe} onSubmit={handleSubmit} />
      </main>
    </div>
  );
}

export default function EditRecipePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" />}>
      <EditContent />
    </Suspense>
  );
}
