"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { saveRecipe } from "@/lib/storage";
import { generateId } from "@/lib/id";
import { DEFAULT_SERVINGS } from "@/lib/constants";
import { IngredientInput, IngredientField } from "@/components/IngredientInput";
import { StepInput } from "@/components/StepInput";

const EMPTY_INGREDIENT: IngredientField = { item: "", amount: "" };

function SuccessScreen({ onReset }: { onReset: () => void }) {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="mb-4 text-xl font-semibold text-green-600 dark:text-green-400">
          ✓ {t("recipeSaved")}
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onReset}
            className="cursor-pointer rounded-lg bg-amber-600 px-4 py-2 font-medium text-white transition-colors hover:bg-amber-700"
          >
            {t("createAnother")}
          </button>
          <Link
            href="/recipes"
            className="rounded-lg bg-zinc-100 px-4 py-2 font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            {t("myRecipes")}
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function NewRecipePage() {
  const t = useTranslations();

  const [name, setName] = useState("");
  const [servings, setServings] = useState(DEFAULT_SERVINGS);
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [ingredients, setIngredients] = useState<IngredientField[]>([{ ...EMPTY_INGREDIENT }]);
  const [steps, setSteps] = useState([""]);
  const [saved, setSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const trimmedName = name.trim();
    const validIngredients = ingredients.filter((ing) => ing.item.trim() && ing.amount.trim());
    const validSteps = steps.filter((s) => s.trim());

    if (!trimmedName || validIngredients.length === 0 || validSteps.length === 0) return;

    const recipe = {
      id: generateId(trimmedName),
      name: trimmedName,
      servings,
      prepTime: prepTime.trim(),
      cookTime: cookTime.trim(),
      ingredients: validIngredients.map((ing) => ({
        item: ing.item.trim(),
        amount: ing.amount.trim(),
      })),
      steps: validSteps.map((s) => s.trim()),
      source: "manual" as const,
    };

    saveRecipe(recipe, "saved");
    setSaved(true);
  };

  const reset = () => {
    setName("");
    setServings(DEFAULT_SERVINGS);
    setPrepTime("");
    setCookTime("");
    setIngredients([{ ...EMPTY_INGREDIENT }]);
    setSteps([""]);
    setSaved(false);
    setSubmitted(false);
  };

  if (saved) return <SuccessScreen onReset={reset} />;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-3xl items-center px-4 py-4">
          <Link href="/" className="font-medium text-amber-600 hover:text-amber-700">
            ← {t("back")}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {t("newRecipeTitle")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("recipeName")}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("recipeNamePlaceholder")}
              className={`w-full rounded-lg border bg-white px-4 py-2 text-zinc-900 focus:outline-none dark:bg-zinc-900 dark:text-zinc-100 ${
                submitted && !name.trim()
                  ? "border-red-400 focus:border-red-500"
                  : "border-zinc-300 focus:border-amber-500 dark:border-zinc-700"
              }`}
            />
            {submitted && !name.trim() && (
              <p className="mt-1 text-sm text-red-500">{t("requiredField")}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t("servings")}
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t("prepTime")}
              </label>
              <input
                type="text"
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="e.g. 15 min"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t("cookTime")}
              </label>
              <input
                type="text"
                value={cookTime}
                onChange={(e) => setCookTime(e.target.value)}
                placeholder="e.g. 30 min"
                className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <IngredientInput
            ingredients={ingredients}
            onUpdate={(i, field, value) => {
              const updated = [...ingredients];
              updated[i] = { ...updated[i], [field]: value };
              setIngredients(updated);
            }}
            onAdd={() => setIngredients([...ingredients, { ...EMPTY_INGREDIENT }])}
            onRemove={(i) => setIngredients(ingredients.filter((_, idx) => idx !== i))}
            submitted={submitted}
          />

          <StepInput
            steps={steps}
            onUpdate={(i, value) => {
              const updated = [...steps];
              updated[i] = value;
              setSteps(updated);
            }}
            onAdd={() => setSteps([...steps, ""])}
            onRemove={(i) => setSteps(steps.filter((_, idx) => idx !== i))}
            submitted={submitted}
          />

          <button
            type="submit"
            className="w-full cursor-pointer rounded-lg bg-amber-600 px-4 py-3 font-medium text-white transition-colors hover:bg-amber-700"
          >
            {t("saveRecipe")}
          </button>
        </form>
      </main>
    </div>
  );
}
