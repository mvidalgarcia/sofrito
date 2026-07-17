"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useTranslations } from "next-intl";
import { Recipe, RecipeStatus } from "@/lib/types";
import { deleteSavedRecipe, getSavedRecipe, RecipeApiError } from "@/lib/recipe-api";
import { RecipeDetail } from "@/components/RecipeDetail";
import { PageHeader } from "@/components/PageHeader";

function RecipeContent() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [recipe, setRecipe] = useState<(Recipe & { status: RecipeStatus }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const handleDelete = async () => {
    if (!window.confirm(t("confirmDelete"))) return;
    if (!id) return;
    setDeleting(true);
    setDeleteError(false);
    try {
      await deleteSavedRecipe(id);
      router.push("/recipes");
    } catch {
      setDeleting(false);
      setDeleteError(true);
    }
  };

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
          <Link href="/recipes" className="font-medium text-amber-600 hover:text-amber-700">
            ← {t("backList")}
          </Link>
        }
        right={
          <div className="flex items-center gap-2">
            <Link
              href={`/recipe/edit?id=${id}`}
              className="cursor-pointer rounded-lg bg-zinc-100 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
            >
              {t("edit")}
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="cursor-pointer rounded-lg bg-zinc-100 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
            >
              {deleting ? "…" : `✕ ${t("delete")}`}
            </button>
          </div>
        }
      />

      <main className="mx-auto max-w-3xl px-4 py-8">
        {deleteError ? <p className="mb-4 text-sm text-red-500">{t("recipeDeleteError")}</p> : null}
        <RecipeDetail recipe={recipe} />
      </main>
    </div>
  );
}

export default function RecipePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" />}>
      <RecipeContent />
    </Suspense>
  );
}
