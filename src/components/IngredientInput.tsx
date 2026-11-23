"use client";

import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import { Button, linkClasses } from "@/components/ui/Button";
import { FieldError, Input, labelClasses } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";

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
  const missing =
    submitted && ingredients.filter((ing) => ing.item.trim() && ing.amount.trim()).length === 0;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-title">{t("ingredients")}</h2>
      <div className="grid grid-cols-[6.5rem_minmax(0,1fr)_2.75rem] items-center gap-2">
        <span className={labelClasses} aria-hidden="true">
          {t("ingredientAmount")}
        </span>
        <span className={labelClasses} aria-hidden="true">
          {t("ingredientItem")}
        </span>
        <span />
        {ingredients.map((ing, i) => (
          <div key={i} className="contents">
            <Input
              value={ing.amount}
              onChange={(e) => onUpdate(i, "amount", e.target.value)}
              placeholder={t("ingredientAmount")}
              aria-label={`${t("ingredientAmount")} ${i + 1}`}
              aria-invalid={missing || undefined}
            />
            <Input
              value={ing.item}
              onChange={(e) => onUpdate(i, "item", e.target.value)}
              placeholder={t("ingredientItem")}
              aria-label={`${t("ingredientItem")} ${i + 1}`}
              aria-invalid={missing || undefined}
            />
            {ingredients.length > 1 ? (
              <Button
                variant="ghost"
                icon
                onClick={() => onRemove(i)}
                aria-label={t("removeIngredientRow", { n: i + 1 })}
              >
                <Icon icon={X} />
              </Button>
            ) : (
              <span />
            )}
          </div>
        ))}
      </div>
      {missing ? <FieldError>{t("requiredIngredient")}</FieldError> : null}
      <button
        type="button"
        onClick={onAdd}
        className={`${linkClasses} cursor-pointer self-start py-1`}
      >
        <Icon icon={Plus} size={18} />
        {t("addIngredient")}
      </button>
    </section>
  );
}
