"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Recipe } from "@/lib/types";
import { DEFAULT_SERVINGS } from "@/lib/constants";
import { IngredientInput, IngredientField } from "@/components/IngredientInput";
import { StepInput } from "@/components/StepInput";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, FieldError, Input, Label } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { ServingsStepper } from "@/components/ui/ServingsStepper";
import { Spinner } from "@/components/ui/States";

const EMPTY_INGREDIENT: IngredientField = { item: "", amount: "" };

interface RecipeFormProps {
  initialData?: Recipe;
  onSubmit: (recipe: Omit<Recipe, "id" | "source">) => void;
  /** Where Cancel goes. */
  cancelHref: string;
  submitLabel: string;
  saving?: boolean;
  /** Save error from the page, shown next to the buttons. */
  error?: string | null;
}

export function RecipeForm({
  initialData,
  onSubmit,
  cancelHref,
  submitLabel,
  saving = false,
  error,
}: RecipeFormProps) {
  const t = useTranslations();

  const [name, setName] = useState(initialData?.name ?? "");
  const [servings, setServings] = useState(initialData?.servings ?? DEFAULT_SERVINGS);
  const [prepTime, setPrepTime] = useState(initialData?.prepTime ?? "");
  const [cookTime, setCookTime] = useState(initialData?.cookTime ?? "");
  const [ingredients, setIngredients] = useState<IngredientField[]>(
    initialData?.ingredients?.map((i) => ({ item: i.item, amount: i.amount })) ?? [
      { ...EMPTY_INGREDIENT },
    ],
  );
  const [steps, setSteps] = useState(initialData?.steps ?? [""]);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const trimmedName = name.trim();
    const validIngredients = ingredients.filter((ing) => ing.item.trim() && ing.amount.trim());
    const validSteps = steps.filter((s) => s.trim());

    if (!trimmedName || validIngredients.length === 0 || validSteps.length === 0) return;

    onSubmit({
      name: trimmedName,
      servings,
      prepTime: prepTime.trim(),
      cookTime: cookTime.trim(),
      ingredients: validIngredients.map((ing) => ({
        item: ing.item.trim(),
        amount: ing.amount.trim(),
      })),
      steps: validSteps.map((s) => s.trim()),
    });
  };

  const nameMissing = submitted && !name.trim();

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <Field>
          <Label htmlFor="recipe-name">{t("recipeName")}</Label>
          <Input
            id="recipe-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("recipeNamePlaceholder")}
            aria-invalid={nameMissing || undefined}
            aria-describedby={nameMissing ? "recipe-name-error" : undefined}
          />
          {nameMissing ? (
            <FieldError id="recipe-name-error">{t("requiredField")}</FieldError>
          ) : null}
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="recipe-prep">{t("prepTime")}</Label>
            <Input
              id="recipe-prep"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
              placeholder="e.g. 15 min"
            />
          </Field>
          <Field>
            <Label htmlFor="recipe-cook">{t("cookTime")}</Label>
            <Input
              id="recipe-cook"
              value={cookTime}
              onChange={(e) => setCookTime(e.target.value)}
              placeholder="e.g. 30 min"
            />
          </Field>
        </div>
        <ServingsStepper value={servings} onChange={setServings} />
      </section>

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

      <div className="border-line flex flex-col gap-3 border-t pt-4">
        {error ? <FieldError>{error}</FieldError> : null}
        <div className="flex justify-end gap-2">
          <ButtonLink href={cancelHref} variant="ghost">
            {t("cancel")}
          </ButtonLink>
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? <Spinner /> : <Icon icon={Check} />}
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
