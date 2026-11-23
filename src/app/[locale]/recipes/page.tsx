"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Bookmark, Plus, Search } from "lucide-react";
import { Recipe, RecipeStatus } from "@/lib/types";
import { listSavedRecipes } from "@/lib/recipe-api";
import { RecipeCard } from "@/components/RecipeCard";
import { AppShell, BackButton, PageHeader } from "@/components/PageHeader";
import { ButtonLink, linkClasses } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { EmptyState, ErrorAlert, PageLoading } from "@/components/ui/States";
import { Link } from "@/i18n/navigation";

type Filter = RecipeStatus | "all";

function getCounts(recipes: (Recipe & { status: RecipeStatus })[]) {
  return {
    all: recipes.length,
    saved: recipes.filter((r) => r.status === "saved").length,
    made: recipes.filter((r) => r.status === "made").length,
  };
}

const filterClasses =
  "flex min-h-10 cursor-pointer items-center justify-center gap-1 rounded-full px-3 text-button font-semibold whitespace-nowrap text-ink-muted aria-pressed:bg-paper-raised aria-pressed:text-ink aria-pressed:shadow-[0_1px_2px_rgba(43,32,25,0.12)]";

export default function RecipesPage() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<Filter>("all");
  const [recipes, setRecipes] = useState<(Recipe & { status: RecipeStatus })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    listSavedRecipes()
      .then((data) => {
        if (!cancelled) setRecipes(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const counts = getCounts(recipes);
  const filtered = activeTab === "all" ? recipes : recipes.filter((r) => r.status === activeTab);

  // Only offer a filter when the list actually mixes saved and made recipes.
  const tabs = (
    [
      { key: "all", label: t("tabs.all") },
      { key: "saved", label: t("tabs.saved") },
      { key: "made", label: t("tabs.made") },
    ] as const
  ).filter((tab) => counts[tab.key] > 0);
  const showTabs = counts.saved > 0 && counts.made > 0;

  return (
    <AppShell
      header={
        <PageHeader
          left={<BackButton href="/" />}
          right={
            <ButtonLink href="/recipe/new" variant="ghost" icon aria-label={t("navWrite")}>
              <Icon icon={Plus} />
            </ButtonLink>
          }
        />
      }
    >
      <div className="-mb-3 flex items-baseline justify-between gap-3">
        <h1 className="font-display text-display-l tracking-[-0.01em]">{t("navMyRecipes")}</h1>
        {!loading && !error && recipes.length > 0 ? (
          <span className="text-label text-ink-muted font-semibold tracking-[0.08em] uppercase tabular-nums">
            {t("recipeCount", { count: recipes.length })}
          </span>
        ) : null}
      </div>

      {loading ? (
        <PageLoading label={t("loadingRecipes")} />
      ) : error ? (
        <ErrorAlert title={t("recipeLoadErrorTitle")} text={t("recipeLoadError")} />
      ) : recipes.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title={t("empty")}
          text={t("emptyText")}
          actions={
            <>
              <ButtonLink href="/" variant="primary">
                <Icon icon={Search} />
                {t("goHome")}
              </ButtonLink>
              <Link href="/recipe/new" className={linkClasses}>
                {t("writeOwn")}
              </Link>
            </>
          }
        />
      ) : (
        <div className="flex flex-col gap-5">
          {showTabs ? (
            <div
              role="group"
              aria-label={t("filterLabel")}
              className="bg-paper-sunk grid grid-cols-3 gap-1 rounded-full p-1"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  aria-pressed={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={filterClasses}
                >
                  {tab.label}
                  <span className="tabular-nums opacity-70">{counts[tab.key]}</span>
                </button>
              ))}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onDeleted={(id) => {
                  const next = recipes.filter((item) => item.id !== id);
                  setRecipes(next);
                  if (activeTab !== "all" && !next.some((item) => item.status === activeTab)) {
                    setActiveTab("all");
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
