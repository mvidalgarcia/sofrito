"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useTranslations } from "next-intl";
import { Recipe } from "@/lib/types";
import { generateId } from "@/lib/id";
import { saveRecipe } from "@/lib/storage";
import { RecipeDetail } from "@/components/RecipeDetail";

function ShareContent() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError(true);
      return;
    }

    fetch(`/api/share?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data) => {
        setRecipe({ ...data, id: generateId(data.name) });
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id]);

  const handleSave = () => {
    if (recipe) {
      saveRecipe(recipe, "saved");
      setSaved(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
        <main className="mx-auto max-w-3xl px-4 py-16 text-center text-zinc-500 dark:text-zinc-400">
          Loading...
        </main>
      </div>
    );
  }

  if (error || !recipe) {
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
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="font-medium text-amber-600 hover:text-amber-700">
            ← {t("back")}
          </Link>
          {!saved && (
            <button
              onClick={handleSave}
              className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition-colors hover:bg-amber-700"
            >
              {t("save")}
            </button>
          )}
          {saved && (
            <span className="font-medium text-green-600 dark:text-green-400">✓ {t("saved")}</span>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <RecipeDetail recipe={recipe} showShareButton={false} />
      </main>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" />}>
      <ShareContent />
    </Suspense>
  );
}
