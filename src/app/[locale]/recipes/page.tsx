"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Recipe, RecipeStatus } from "@/lib/types";
import { getAllRecipes } from "@/lib/storage";
import { RecipeCard } from "@/components/RecipeCard";
function getCounts(recipes: (Recipe & { status: RecipeStatus })[]) {
  return {
    all: recipes.length,
    saved: recipes.filter((r) => r.status === "saved").length,
    made: recipes.filter((r) => r.status === "made").length,
  };
}

export default function RecipesPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<RecipeStatus | "all">("all");
  const [recipes, setRecipes] = useState<(Recipe & { status: RecipeStatus })[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setRecipes(getAllRecipes());
    }
  }, [activeTab]);

  const counts = getCounts(recipes);
  const filtered = activeTab === "all" ? recipes : recipes.filter((r) => r.status === activeTab);

  const tabs: { key: string; label: string }[] = [
    { key: "all", label: `${t("tabs.all")} (${counts.all})` },
    { key: "saved", label: `${t("tabs.saved")} (${counts.saved})` },
    { key: "made", label: `${t("tabs.made")} (${counts.made})` },
  ].filter((tab) => counts[tab.key as keyof typeof counts] > 0);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-amber-600">
            {t("title")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {recipes.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-zinc-500 dark:text-zinc-400">{t("empty")}</p>
            <Link href="/" className="font-medium text-amber-600 hover:text-amber-700">
              {t("goHome")}
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as RecipeStatus | "all")}
                  className={`rounded-lg px-4 py-2 font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.key
                      ? "bg-amber-600 text-white"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="grid gap-4">
              {filtered.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
