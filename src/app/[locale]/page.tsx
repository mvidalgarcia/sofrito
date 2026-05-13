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

  const isMock = process.env.NODE_ENV === "development";

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
        body: isMock ? undefined : JSON.stringify({ query: searchQuery, locale }),
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
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <header className="mx-auto flex max-w-3xl justify-end px-4 py-4">
        <LangSwitcher />
      </header>
      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-4xl font-bold text-zinc-900 dark:text-zinc-50">{t("title")}</h1>
          <p className="mb-4 text-zinc-600 dark:text-zinc-400">{t("subtitle")}</p>
          <Link href="/recipes" className="text-sm font-medium text-amber-600 hover:text-amber-700">
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
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-600"></div>
            <div className="text-lg text-zinc-600 dark:text-zinc-400">{t("searching")}</div>
          </div>
        )}

        {recipe && !loading && <RecipeDetail recipe={recipe} />}
      </main>
    </div>
  );
}
