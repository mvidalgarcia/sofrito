"use client";

import { Clock, Flame, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Icon } from "./Icon";

/** Servings, prep and cook time on one muted line, each with an icon and a spoken label. */
export function RecipeMeta({
  servings,
  prepTime,
  cookTime,
  long = false,
  className = "",
}: {
  servings?: number;
  prepTime?: string;
  cookTime?: string;
  /** Spell out "prep" / "cook" (recipe page) rather than icons alone (cards). */
  long?: boolean;
  className?: string;
}) {
  const t = useTranslations();
  return (
    <div
      className={`text-body-s text-ink-muted flex flex-wrap items-center gap-x-3 gap-y-1 tabular-nums ${className}`}
    >
      {servings ? (
        <span className="inline-flex items-center gap-1">
          <Icon icon={Users} size={16} />
          <span className="sr-only">{t("servings")}: </span>
          {servings}
        </span>
      ) : null}
      {prepTime ? (
        <span className="inline-flex items-center gap-1">
          <Icon icon={Clock} size={16} />
          {long ? t("prepShort", { time: prepTime }) : prepTime}
          {long ? null : <span className="sr-only"> {t("prepTime")}</span>}
        </span>
      ) : null}
      {cookTime ? (
        <span className="inline-flex items-center gap-1">
          <Icon icon={Flame} size={16} />
          {long ? t("cookShort", { time: cookTime }) : cookTime}
          {long ? null : <span className="sr-only"> {t("cookTime")}</span>}
        </span>
      ) : null}
    </div>
  );
}
