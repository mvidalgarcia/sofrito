"use client";

import { useTranslations } from "next-intl";
import { Check, Share2, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { Recipe, RecipeStatus, SavedRecipeState } from "@/lib/types";
import { DEFAULT_LOCALE, COPY_FEEDBACK_DURATION_MS } from "@/lib/constants";
import { scaleIngredientAmount } from "@/lib/scale-ingredient";
import { toShareableRecipe } from "@/lib/recipe-share";
import { ActionButtons } from "./ActionButtons";
import { useEffect, useMemo, useState } from "react";
import { SourceBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { RecipeMeta } from "@/components/ui/RecipeMeta";
import { ServingsStepper } from "@/components/ui/ServingsStepper";

/** Tool button for the recipe head: icon-only on phones, labelled from desktop up. */
export const recipeToolClasses = "w-11 px-0 lg:w-auto lg:px-4";

/** One-line disclosure shown above recipes written by the model. */
export function GeneratedNote({ children }: { children: ReactNode }) {
  return (
    <p className="bg-saffron-soft text-body-s text-saffron-ink flex items-start gap-2 rounded-md px-4 py-3">
      <Icon icon={Sparkles} size={16} className="mt-0.5" />
      <span>{children}</span>
    </p>
  );
}

interface RecipeDetailProps {
  recipe: Recipe;
  showShareButton?: boolean;
  savedRecipe?: SavedRecipeState | null;
  onSaved?: (saved: SavedRecipeState) => void;
  /** Extra tools beside Share, e.g. Edit and Delete for the owner. */
  tools?: ReactNode;
  /** Shown between the head and the ingredients (confirmations, notices). */
  notice?: ReactNode;
  /** Small uppercase line above the title. */
  eyebrow?: string;
  /** Show the source badge (only where generated and hand-written recipes mix). */
  showSource?: boolean;
  /** Two-column desktop layout; only on full recipe pages. */
  wide?: boolean;
  headingLevel?: "h1" | "h2";
}

export function RecipeDetail({
  recipe,
  showShareButton = true,
  savedRecipe,
  onSaved,
  tools,
  notice,
  eyebrow,
  showSource = false,
  wide = false,
  headingLevel: Heading = "h1",
}: RecipeDetailProps) {
  const t = useTranslations();
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [displayServings, setDisplayServings] = useState(recipe.servings);
  const [status, setStatus] = useState<RecipeStatus | null>(
    savedRecipe?.status ?? recipe.status ?? null,
  );

  useEffect(() => {
    setDisplayServings(recipe.servings);
  }, [recipe.id, recipe.servings]);

  useEffect(() => {
    setStatus(savedRecipe?.status ?? recipe.status ?? null);
  }, [savedRecipe?.status, recipe.status]);

  const scaleFactor = displayServings / recipe.servings;
  const scaledIngredients = useMemo(
    () =>
      recipe.ingredients.map((ing) => ({
        item: ing.item,
        ...scaleIngredientAmount(ing.amount, scaleFactor),
      })),
    [recipe.ingredients, scaleFactor],
  );

  const handleShare = async () => {
    setSharing(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toShareableRecipe(recipe)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const pathParts = window.location.pathname.split("/").filter(Boolean);
      const locale = pathParts[0] || DEFAULT_LOCALE;
      const url = `${window.location.origin}/${locale}/share?id=${data.id}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION_MS);
    } catch (e) {
      console.error("Share failed:", e);
    } finally {
      setSharing(false);
    }
  };

  const hasTools = showShareButton || Boolean(tools);
  const hasBadges = Boolean(status) || (showSource && recipe.source);

  return (
    <article className="flex flex-col gap-8">
      <div
        className={`grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3 [grid-template-areas:'badges_tools'_'title_title'_'meta_meta'_'actions_actions'] ${
          wide
            ? "lg:gap-y-4 lg:[grid-template-areas:'badges_badges'_'title_title'_'meta_meta'_'actions_tools']"
            : ""
        }`}
      >
        <div className="flex flex-wrap items-center gap-2 [grid-area:badges]">
          {eyebrow ? (
            <p className="text-label text-ink-muted font-semibold tracking-[0.08em] uppercase">
              {eyebrow}
            </p>
          ) : null}
          {hasBadges ? (
            <>
              {status ? <StatusBadge status={status} /> : null}
              {showSource && recipe.source ? <SourceBadge source={recipe.source} /> : null}
            </>
          ) : null}
        </div>

        {hasTools ? (
          <div
            className={`-my-2.5 -mr-2.5 flex items-center gap-1 self-center [grid-area:tools] ${
              wide ? "lg:my-0 lg:-mr-4" : ""
            }`}
          >
            {showShareButton ? (
              <Button
                variant="ghost"
                className={wide ? recipeToolClasses : "w-11 px-0"}
                onClick={handleShare}
                disabled={sharing}
                aria-label={copied ? t("copiedLink") : t("shareRecipe")}
              >
                <Icon icon={copied ? Check : Share2} />
                <span aria-hidden="true" className={wide ? "hidden lg:inline" : "hidden"}>
                  {copied ? t("copiedLink") : t("share")}
                </span>
              </Button>
            ) : null}
            {tools}
          </div>
        ) : null}

        <Heading
          className={`font-display text-display-l tracking-[-0.01em] text-balance [grid-area:title] ${
            wide ? "lg:max-w-[760px] lg:text-[56px] lg:leading-[60px] lg:tracking-[-0.015em]" : ""
          }`}
        >
          {recipe.name}
        </Heading>

        <RecipeMeta
          prepTime={recipe.prepTime}
          cookTime={recipe.cookTime}
          long
          className="text-[15px] [grid-area:meta]"
        />

        <div className="pt-1 [grid-area:actions]">
          <ActionButtons
            recipe={recipe}
            savedRecipe={savedRecipe}
            onSaved={(saved) => {
              setStatus(saved.status);
              onSaved?.(saved);
            }}
          />
        </div>
      </div>

      {notice}

      <div
        className={`flex flex-col gap-8 ${
          wide
            ? "lg:border-line lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start lg:gap-16 lg:border-t lg:pt-10"
            : ""
        }`}
      >
        <section
          className={`flex flex-col gap-4 ${
            wide ? "lg:border-line lg:bg-paper-raised lg:rounded-md lg:border lg:p-6" : ""
          }`}
        >
          <ServingsStepper
            value={displayServings}
            onChange={setDisplayServings}
            withTestIds
            className={`border-line order-first border-y py-3 ${
              wide ? "lg:order-none lg:border-0 lg:py-0" : ""
            }`}
          />
          <h2 className={`font-display text-title ${wide ? "lg:order-first" : ""}`}>
            {t("ingredients")}
          </h2>
          <ul>
            {scaledIngredients.map((ing, i) => {
              const showApproximate = scaleFactor !== 1 && !ing.scaled;
              return (
                <li
                  key={i}
                  className={`border-line grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 border-b py-3 last:border-b-0 ${
                    wide ? "lg:grid-cols-[5.5rem_minmax(0,1fr)]" : ""
                  }`}
                >
                  <span
                    className={`text-[15px] font-semibold tabular-nums ${
                      showApproximate ? "text-ink-muted italic" : "text-ink"
                    }`}
                    title={showApproximate ? t("approximateAmount") : undefined}
                  >
                    {showApproximate ? "~ " : ""}
                    {ing.amount}
                  </span>{" "}
                  <span>{ing.item}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="flex flex-col gap-5 lg:gap-6">
          <h2 className="font-display text-title">{t("steps")}</h2>
          <ol className="flex flex-col gap-6 lg:gap-7">
            {recipe.steps.map((step, i) => (
              <li key={i} className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-baseline gap-3">
                <span className="font-display text-step-number text-tomato lining-nums">
                  {i + 1}
                </span>
                <p className="text-body-l max-w-[60ch]">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </article>
  );
}
