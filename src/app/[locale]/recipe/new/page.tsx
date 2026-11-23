"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BookOpen, Check, Plus } from "lucide-react";
import { createSavedRecipe } from "@/lib/recipe-api";
import { Recipe } from "@/lib/types";
import { RecipeForm } from "@/components/RecipeForm";
import { AppShell, BackButton, PageHeader } from "@/components/PageHeader";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/States";

function SuccessScreen({ onReset }: { onReset: () => void }) {
  const t = useTranslations();

  return (
    <AppShell header={<PageHeader />}>
      <EmptyState
        icon={Check}
        title={t("recipeSaved")}
        actions={
          <div className="flex flex-wrap justify-center gap-2">
            <ButtonLink href="/recipes" variant="primary">
              <Icon icon={BookOpen} />
              {t("myRecipes")}
            </ButtonLink>
            <Button onClick={onReset}>
              <Icon icon={Plus} />
              {t("createAnother")}
            </Button>
          </div>
        }
      />
    </AppShell>
  );
}

export default function NewRecipePage() {
  const t = useTranslations();

  const [key, setKey] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (data: Omit<Recipe, "id" | "source">) => {
    if (saving) return;
    setSaving(true);
    setError(false);
    try {
      await createSavedRecipe({ ...data, source: "manual" }, "saved");
      setSaved(true);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setKey((k) => k + 1);
    setSaved(false);
    setError(false);
  };

  if (saved) return <SuccessScreen onReset={reset} />;

  return (
    <AppShell header={<PageHeader left={<BackButton href="/recipes" />} title={t("newRecipe")} />}>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-display-l tracking-[-0.01em]">{t("newRecipeTitle")}</h1>
        <p className="text-ink-muted">{t("newRecipeLede")}</p>
      </div>
      <RecipeForm
        key={key}
        onSubmit={handleSubmit}
        cancelHref="/recipes"
        submitLabel={t("createRecipe")}
        saving={saving}
        error={error ? t("recipeSaveError") : null}
      />
    </AppShell>
  );
}
