"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { NameSearch } from "@/components/NameSearch";
import { IngredientSearch } from "@/components/IngredientSearch";
import { PageHeader } from "@/components/PageHeader";

type SearchMode = "name" | "ingredients";

export default function Home() {
  const t = useTranslations();
  const [mode, setMode] = useState<SearchMode>("name");

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <PageHeader />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-4xl font-bold text-zinc-900 dark:text-zinc-50">{t("title")}</h1>
          <p className="mb-4 text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
          <Link href="/recipes" className="text-sm font-medium text-amber-600 hover:text-amber-700">
            {t("myRecipes")}
          </Link>
          <span className="mx-2 text-zinc-300 dark:text-zinc-600">·</span>
          <Link
            href="/recipe/new"
            className="text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            {t("newRecipe")}
          </Link>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setMode("name")}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              mode === "name"
                ? "bg-amber-600 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {t("searchByName")}
          </button>
          <button
            onClick={() => setMode("ingredients")}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              mode === "ingredients"
                ? "bg-amber-600 text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {t("searchByIngredients")}
          </button>
        </div>

        {mode === "name" && <NameSearch />}
        {mode === "ingredients" && <IngredientSearch />}
      </main>
    </div>
  );
}
