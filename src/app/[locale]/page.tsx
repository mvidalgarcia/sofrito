"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Recipe } from "@/lib/types";
import { generateId } from "@/lib/id";
import { SearchBar } from "@/components/SearchBar";
import { RecipeDetail } from "@/components/RecipeDetail";
import { LangSwitcher } from "@/components/LangSwitcher";

export default function Home() {
  const t = useTranslations();
  const tError = useTranslations();
  const locale = useLocale();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // const isMock = process.env.NODE_ENV === "development";
  const isMock = false;

  const handleSearch = async (searchQuery: string) => {
    setLoading(true);
    setError("");
    setRecipe(null);

    try {
      const endpoint = isMock ? "/api/mock" : "/api/recipe";
      const url = isMock ? `${endpoint}?mock=${Date.now() % 5}` : endpoint;

      const res = await fetch(url, {
        method: isMock ? "GET" : "POST",
        headers: isMock ? {} : { "Content-Type": "application/json" },
        body: isMock
          ? undefined
          : JSON.stringify({ query: searchQuery, locale }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || tError("apiNotConfigured"));
      }
      setRecipe({ ...data, id: generateId(data.name), searchQuery });
    } catch (err) {
      setError(err instanceof Error ? err.message : tError("apiNotConfigured"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
      <header className="max-w-3xl mx-auto px-4 py-4 flex justify-end">
        <LangSwitcher />
      </header>
      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            {t("title")}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            {t("subtitle")}
          </p>
          <Link
            href="/recipes"
            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
          >
            {t("myRecipes")}
          </Link>
        </div>

        <SearchBar
          onSearch={handleSearch}
          loading={loading}
          placeholder={t("searchPlaceholder")}
          buttonText={t("searchButton")}
        />

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mb-4"></div>
            <div className="text-lg text-zinc-600 dark:text-zinc-400">
              {t("searching")}
            </div>
          </div>
        )}

        {recipe && !loading && <RecipeDetail recipe={recipe} />}
      </main>
    </div>
  );
}
