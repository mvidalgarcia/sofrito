"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Bookmark, PencilLine, Plus, Sparkles } from "lucide-react";
import { Recipe, SavedRecipeState } from "@/lib/types";
import { SEARCH_DEFAULT_SERVINGS } from "@/lib/constants";
import { generateId } from "@/lib/id";
import { createSavedRecipe, deleteSavedRecipe } from "@/lib/recipe-api";
import { GeneratedNote, RecipeDetail } from "@/components/RecipeDetail";
import { BackButton } from "@/components/PageHeader";
import { Button, linkClasses } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { FieldError, Input, Label } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { RecipeMeta } from "@/components/ui/RecipeMeta";
import { ServingsStepper } from "@/components/ui/ServingsStepper";
import { ErrorAlert, LoadingState, Spinner } from "@/components/ui/States";

type Meal = "breakfast" | "lunch" | "dinner";

/** Meal the cook is most likely planning, from the device's clock. */
function mealForNow(date = new Date()): Meal {
  const hour = date.getHours();
  if (hour < 11) return "breakfast";
  if (hour < 16) return "lunch";
  return "dinner";
}

function SaveToggle({
  recipe,
  saved,
  onChange,
}: {
  recipe: Recipe;
  saved?: SavedRecipeState;
  onChange: (saved: SavedRecipeState | null) => void;
}) {
  const t = useTranslations();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const isSaved = Boolean(saved);

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    setError(false);
    try {
      if (saved) {
        await deleteSavedRecipe(saved.id);
        onChange(null);
      } else {
        const result = await createSavedRecipe(recipe, "saved");
        onChange({ id: result.id, status: result.status });
      }
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant="ghost"
      icon
      className={`-mt-1.5 -mr-1.5 ${isSaved ? "text-tomato" : "text-ink-muted"} ${
        error ? "text-danger" : ""
      }`}
      aria-pressed={isSaved}
      aria-label={
        isSaved ? t("unsaveNamed", { name: recipe.name }) : t("saveNamed", { name: recipe.name })
      }
      title={error ? t("recipeSaveError") : undefined}
      onClick={toggle}
    >
      {busy ? <Spinner /> : <Icon icon={Bookmark} filled={isSaved} />}
    </Button>
  );
}

type View = "form" | "results" | "recipe";

export function IngredientSearch({ onViewChange }: { onViewChange?: (view: View) => void }) {
  const t = useTranslations();
  const locale = useLocale();
  const [draft, setDraft] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [view, setView] = useState<View>("form");
  const [savedRecipes, setSavedRecipes] = useState<Record<string, SavedRecipeState>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [servings, setServings] = useState(SEARCH_DEFAULT_SERVINGS);
  const [meal, setMeal] = useState<Meal>("dinner");
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    onViewChange?.(view);
    window.scrollTo({ top: 0 });
  }, [view, onViewChange]);

  /** Split "onion, garlic" into chips, skipping duplicates. */
  const addDraft = (value = draft) => {
    const items = value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (items.length === 0) return ingredients;
    const known = new Set(ingredients.map((i) => i.toLowerCase()));
    const next = [...ingredients];
    for (const item of items) {
      if (!known.has(item.toLowerCase())) {
        known.add(item.toLowerCase());
        next.push(item.charAt(0).toUpperCase() + item.slice(1));
      }
    }
    setIngredients(next);
    setDraft("");
    setMissing(false);
    return next;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const list = addDraft();
    if (list.length === 0) {
      setMissing(true);
      return;
    }
    if (loading) return;

    setLoading(true);
    setError("");
    setRecipes([]);
    setSelected(null);

    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: list, locale, servings }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t("apiNotConfigured"));
      }

      const withIds = (data.recipes || []).map((r: Recipe) => ({
        ...r,
        id: generateId(r.name),
        locale,
        source: "llm",
      }));
      setRecipes(withIds);
      setMeal(mealForNow());
      setView("results");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("apiNotConfigured"));
    } finally {
      setLoading(false);
    }
  };

  const setSaved = (recipeId: string, saved: SavedRecipeState | null) => {
    setSavedRecipes((prev) => {
      const next = { ...prev };
      if (saved) next[recipeId] = saved;
      else delete next[recipeId];
      return next;
    });
  };

  if (view === "recipe" && selected !== null && recipes[selected]) {
    const recipe = recipes[selected];
    return (
      <div className="flex flex-col gap-6">
        <div className="-ml-3 flex items-center gap-1">
          <BackButton onClick={() => setView("results")} />
          <button
            type="button"
            onClick={() => setView("results")}
            className={`${linkClasses} cursor-pointer`}
          >
            {t("allSuggestions")}
          </button>
        </div>
        <GeneratedNote>{t("generatedNote")}</GeneratedNote>
        <RecipeDetail
          recipe={recipe}
          showShareButton={false}
          savedRecipe={savedRecipes[recipe.id]}
          onSaved={(saved) => setSaved(recipe.id, saved)}
        />
      </div>
    );
  }

  if (view === "results") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-label text-ink-muted font-semibold tracking-[0.08em] uppercase">
            {t("resultsEyebrow", { servings })}
          </p>
          <h1 className="font-display text-display-l tracking-[-0.01em] text-balance">
            {t("resultsHeading", { count: recipes.length, meal })}
          </h1>
          <ul className="flex flex-wrap gap-2" aria-label={t("yourIngredients")}>
            {ingredients.map((item) => (
              <li key={item}>
                <Chip label={item} />
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setView("form")}
            className={`${linkClasses} cursor-pointer self-start`}
          >
            <Icon icon={PencilLine} size={16} />
            {t("changeIngredients")}
          </button>
        </div>

        <GeneratedNote>{t("generatedNote")}</GeneratedNote>

        <ul className="flex flex-col gap-3">
          {recipes.map((r, i) => (
            <li
              key={r.id}
              className="border-line bg-paper-raised hover:border-line-strong hover:shadow-card relative flex items-start gap-2 rounded-md border p-4 transition-[box-shadow,border-color] duration-150 ease-out"
            >
              <button
                type="button"
                onClick={() => {
                  setSelected(i);
                  setView("recipe");
                }}
                className="flex min-w-0 flex-1 cursor-pointer flex-col gap-2 rounded-sm text-left"
              >
                <h2 className="font-display text-card-title text-balance">{r.name}</h2>
                <RecipeMeta servings={r.servings} prepTime={r.prepTime} cookTime={r.cookTime} />
              </button>
              <SaveToggle
                recipe={r}
                saved={savedRecipes[r.id]}
                onChange={(saved) => setSaved(r.id, saved)}
              />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSearch} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label htmlFor="ingredient">{t("ingredientsLabel")}</Label>
          <div className="flex gap-2">
            <Input
              id="ingredient"
              leadingIcon={Plus}
              value={draft}
              onChange={(e) => {
                const value = e.target.value;
                if (value.includes(",")) addDraft(value);
                else setDraft(value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && draft.trim()) {
                  e.preventDefault();
                  addDraft();
                }
              }}
              placeholder={t("ingredientPlaceholder")}
              enterKeyHint="done"
              autoComplete="off"
              aria-invalid={missing || undefined}
            />
            <Button onClick={() => addDraft()} disabled={!draft.trim()}>
              {t("addIngredientShort")}
            </Button>
          </div>
          {missing ? <FieldError>{t("requiredIngredient")}</FieldError> : null}
          {ingredients.length > 0 ? (
            <ul className="flex flex-wrap gap-2 pt-1" aria-label={t("yourIngredients")}>
              {ingredients.map((item) => (
                <li key={item}>
                  <Chip
                    label={item}
                    removeLabel={t("removeIngredient", { item })}
                    onRemove={() => setIngredients(ingredients.filter((i) => i !== item))}
                  />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <ServingsStepper value={servings} onChange={setServings} />

        <Button type="submit" variant="primary" block aria-disabled={loading || undefined}>
          {loading ? <Spinner /> : <Icon icon={Sparkles} />}
          {loading ? t("searchingShort") : t("suggestButton")}
        </Button>
      </form>

      {error ? <ErrorAlert title={t("searchErrorTitle")} text={error} /> : null}
      {loading ? <LoadingState label={t("suggesting", { servings })} cards={3} /> : null}
    </div>
  );
}
