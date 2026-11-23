"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Recipe } from "@/lib/types";
import { generateId } from "@/lib/id";
import { toShareableRecipe } from "@/lib/recipe-share";
import { RecipeDetail } from "@/components/RecipeDetail";
import { AppShell, PageHeader } from "@/components/PageHeader";
import { RecipeNotFound } from "@/components/RecipeStates";
import { PageLoading } from "@/components/ui/States";

function ShareContent() {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
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
        const shared = toShareableRecipe({ ...data, locale });
        setRecipe({ ...shared, id: generateId(data.name) });
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id, locale]);

  return (
    <AppShell wide header={<PageHeader wide />}>
      {loading ? (
        <PageLoading label={t("loadingRecipe")} />
      ) : error || !recipe ? (
        <RecipeNotFound />
      ) : (
        <RecipeDetail recipe={recipe} wide showShareButton={false} eyebrow={t("sharedWithYou")} />
      )}
    </AppShell>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<div className="bg-paper min-h-screen" />}>
      <ShareContent />
    </Suspense>
  );
}
