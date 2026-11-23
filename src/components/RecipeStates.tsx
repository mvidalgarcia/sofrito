"use client";

import { useTranslations } from "next-intl";
import { RotateCcw, SearchX } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { EmptyState, ErrorAlert } from "@/components/ui/States";

export function RecipeNotFound() {
  const t = useTranslations();
  return (
    <EmptyState
      icon={SearchX}
      title={t("notFound")}
      text={t("notFoundText")}
      actions={
        <ButtonLink href="/" variant="primary">
          {t("back")}
        </ButtonLink>
      }
    />
  );
}

export function RecipeLoadError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations();
  return (
    <ErrorAlert
      title={t("recipeLoadErrorTitle")}
      text={t("recipeLoadError")}
      action={
        <Button onClick={onRetry}>
          <Icon icon={RotateCcw} />
          {t("retry")}
        </Button>
      }
    />
  );
}
