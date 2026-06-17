"use client";

import { useTranslations } from "next-intl";

export interface IngredientField {
  item: string;
  amount: string;
}

interface IngredientInputProps {
  ingredients: IngredientField[];
  onUpdate: (index: number, field: keyof IngredientField, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  submitted: boolean;
}

export function IngredientInput({
  ingredients,
  onUpdate,
  onAdd,
  onRemove,
  submitted,
}: IngredientInputProps) {
  const t = useTranslations();

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("ingredients")}
        </label>
        <button
          type="button"
          onClick={onAdd}
          className="cursor-pointer text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          + {t("addIngredient")}
        </button>
      </div>
      <div className="space-y-2">
        {ingredients.map((ing, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={ing.amount}
              onChange={(e) => onUpdate(i, "amount", e.target.value)}
              placeholder={t("ingredientAmount")}
              className="w-28 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <input
              type="text"
              value={ing.item}
              onChange={(e) => onUpdate(i, "item", e.target.value)}
              placeholder={t("ingredientItem")}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            {ingredients.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="cursor-pointer rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      {submitted &&
        ingredients.filter((ing) => ing.item.trim() && ing.amount.trim()).length === 0 && (
          <p className="mt-1 text-sm text-red-500">{t("requiredIngredient")}</p>
        )}
    </div>
  );
}
