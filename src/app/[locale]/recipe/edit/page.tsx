"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useTranslations } from "next-intl";
import { Recipe, RecipeStatus } from "@/lib/types";
import { getRecipeById, updateRecipe } from "@/lib/storage";
import { RecipeForm } from "@/components/RecipeForm";

function EditContent() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [recipe, setRecipe] = useState<(Recipe & { status: RecipeStatus }) | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (id && typeof window !== "undefined") {
      const found = getRecipeById(id);
      if (found) setRecipe(found);
    }
  }, [id]);

  const handleSubmit = (data: Omit<Recipe, "id" | "source">) => {
    if (!id) return;
    updateRecipe(id, { ...recipe, ...data, id });
    setSaved(true);
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
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-4">
          <Link
            href={`/recipe?id=${id}`}
            className="font-medium text-amber-600 hover:text-amber-700"
          >
            ← {t("backList")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {t("editRecipeTitle")}
        </h1>

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
