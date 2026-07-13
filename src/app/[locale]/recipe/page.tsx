"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useTranslations } from "next-intl";
import { Recipe, RecipeStatus } from "@/lib/types";
import { deleteRecipe, getRecipeById } from "@/lib/storage";
import { RecipeDetail } from "@/components/RecipeDetail";
import { PageHeader } from "@/components/PageHeader";

function RecipeContent() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [recipe, setRecipe] = useState<(Recipe & { status: RecipeStatus }) | null>(null);

  const handleDelete = () => {
    if (!window.confirm(t("confirmDelete"))) return;
    if (id) deleteRecipe(id);
    router.push("/recipes");
  };

  useEffect(() => {
    if (id && typeof window !== "undefined") {
      const found = getRecipeById(id);
      if (found) {
        setRecipe(found);
      }
    }
  }, [id]);

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
              className="cursor-pointer rounded-lg bg-zinc-100 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-800 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
            >
              ✕ {t("delete")}
            </button>
          </div>
        }
      />

      <main className="mx-auto max-w-3xl px-4 py-8">
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
