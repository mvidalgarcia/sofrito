"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, PencilLine } from "lucide-react";
import { NameSearch } from "@/components/NameSearch";
import { IngredientSearch } from "@/components/IngredientSearch";
import { AppShell, PageHeader } from "@/components/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

type SearchMode = "name" | "ingredients";

const segmentClasses =
  "flex min-h-10 cursor-pointer items-center justify-center rounded-full text-button font-semibold text-ink-muted aria-pressed:bg-paper-raised aria-pressed:text-ink aria-pressed:shadow-[0_1px_2px_rgba(43,32,25,0.12)]";

export default function Home() {
  const t = useTranslations();
  const [mode, setMode] = useState<SearchMode>("name");
  const [ingredientView, setIngredientView] = useState<"form" | "results" | "recipe">("form");
  const showIntro = mode === "name" || ingredientView === "form";

  return (
    <AppShell header={<PageHeader />}>
      {showIntro ? (
        <>
          <div className="flex flex-col gap-3 pt-2">
            <h1 className="font-display text-display-xl tracking-[-0.01em] text-balance">
              {t.rich("masthead", {
                swash: (chunks) => <span className="swash">{chunks}</span>,
              })}
            </h1>
            <p className="text-ink-muted">{t("lede")}</p>
          </div>

          <div
            role="group"
            aria-label={t("searchModeLabel")}
            className="bg-paper-sunk grid grid-cols-2 gap-1 rounded-full p-1"
          >
            <button
              type="button"
              className={segmentClasses}
              aria-pressed={mode === "name"}
              onClick={() => setMode("name")}
            >
              {t("searchByName")}
            </button>
            <button
              type="button"
              className={segmentClasses}
              aria-pressed={mode === "ingredients"}
              onClick={() => setMode("ingredients")}
            >
              {t("searchByIngredients")}
            </button>
          </div>
        </>
      ) : null}

      {mode === "name" ? <NameSearch /> : <IngredientSearch onViewChange={setIngredientView} />}

      {showIntro ? (
        <div className="border-line mt-auto flex justify-between gap-2 border-t pt-3">
          <ButtonLink href="/recipes" variant="ghost" className="-ml-2 px-2">
            <Icon icon={BookOpen} />
            {t("navMyRecipes")}
          </ButtonLink>
          <ButtonLink href="/recipe/new" variant="ghost" className="-mr-2 px-2">
            <Icon icon={PencilLine} />
            {t("navWrite")}
          </ButtonLink>
        </div>
      ) : null}
    </AppShell>
  );
}
