"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Search } from "lucide-react";
import { Recipe } from "@/lib/types";
import { SEARCH_DEFAULT_SERVINGS } from "@/lib/constants";
import { generateId } from "@/lib/id";
import { GeneratedNote, RecipeDetail } from "@/components/RecipeDetail";
import { Button } from "@/components/ui/Button";
import { Field, Input, Label } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { ServingsStepper } from "@/components/ui/ServingsStepper";
import { ErrorAlert, LoadingState, Spinner } from "@/components/ui/States";

export function NameSearch() {
  const t = useTranslations();
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [servings, setServings] = useState(SEARCH_DEFAULT_SERVINGS);
  const [searched, setSearched] = useState({ dish: "", servings: SEARCH_DEFAULT_SERVINGS });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const searchQuery = query.trim();
    if (!searchQuery || loading) return;

    setLoading(true);
    setError("");
    setRecipe(null);
    setSearched({ dish: searchQuery, servings });

    try {
      const res = await fetch("/api/recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, locale, servings }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t("apiNotConfigured"));
      }
      setRecipe({ ...data, id: generateId(data.name), searchQuery, locale, source: "llm" });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("apiNotConfigured"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field>
          <Label htmlFor="dish">{t("dishLabel")}</Label>
          <Input
            id="dish"
            leadingIcon={Search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            enterKeyHint="search"
            autoComplete="off"
          />
        </Field>

        <ServingsStepper value={servings} onChange={setServings} />

        <Button
          type="submit"
          variant="primary"
          block
          aria-disabled={loading || !query.trim() || undefined}
        >
          {loading ? <Spinner /> : <Icon icon={Search} />}
          {loading ? t("searchingShort") : t("searchButton")}
        </Button>
      </form>

      {error ? <ErrorAlert title={t("searchErrorTitle")} text={error} /> : null}

      {loading ? (
        <LoadingState
          label={t("searching", { dish: searched.dish, servings: searched.servings })}
        />
      ) : null}

      {recipe && !loading ? (
        <div className="border-line flex flex-col gap-6 border-t pt-8">
          <GeneratedNote>{t("generatedNote")}</GeneratedNote>
          <RecipeDetail recipe={recipe} headingLevel="h2" />
        </div>
      ) : null}
    </div>
  );
}
