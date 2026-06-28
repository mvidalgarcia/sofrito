"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { saveRecipe } from "@/lib/storage";
import { generateId } from "@/lib/id";
import { Recipe } from "@/lib/types";
import { RecipeForm } from "@/components/RecipeForm";

function SuccessScreen({ onReset }: { onReset: () => void }) {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="mb-4 text-xl font-semibold text-green-600 dark:text-green-400">
          ✓ {t("recipeSaved")}
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onReset}
            className="cursor-pointer rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition-colors hover:bg-amber-700"
          >
            {t("createAnother")}
          </button>
          <Link
            href="/recipes"
            className="rounded-lg bg-zinc-100 px-4 py-2 font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {t("myRecipes")}
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function NewRecipePage() {
  const t = useTranslations();

  const [key, setKey] = useState(0);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (data: Omit<Recipe, "id" | "source">) => {
    saveRecipe(
      {
        id: generateId(data.name),
        ...data,
        source: "manual" as const,
      },
      "saved",
    );
    setSaved(true);
  };

  const reset = () => {
    setKey((k) => k + 1);
    setSaved(false);
  };

  if (saved) return <SuccessScreen onReset={reset} />;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-4">
          <Link href="/" className="font-medium text-amber-600 hover:text-amber-700">
            ← {t("back")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {t("newRecipeTitle")}
        </h1>

        <RecipeForm key={key} onSubmit={handleSubmit} />
      </main>
    </div>
  );
}
