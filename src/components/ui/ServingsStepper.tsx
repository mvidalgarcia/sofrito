"use client";

import { Minus, Plus } from "lucide-react";
import { useId } from "react";
import { useTranslations } from "next-intl";
import { MAX_SERVINGS, MIN_SERVINGS } from "@/lib/constants";
import { Icon } from "./Icon";
import { labelClasses } from "./Field";

const stepButton =
  "grid size-10 cursor-pointer place-items-center rounded-full bg-paper-raised text-ink hover:bg-line disabled:cursor-not-allowed disabled:opacity-50";

export function ServingsStepper({
  value,
  onChange,
  min = MIN_SERVINGS,
  max = MAX_SERVINGS,
  withTestIds = false,
  className = "",
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Adds the data-testid hooks the E2E suite uses on the recipe page. */
  withTestIds?: boolean;
  className?: string;
}) {
  const t = useTranslations();
  const labelId = useId();
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <span className={labelClasses} id={labelId}>
        {t("servings")}
      </span>
      <div
        role="group"
        aria-labelledby={labelId}
        className="bg-paper-sunk inline-flex items-center gap-1 rounded-full p-1"
      >
        <button
          type="button"
          className={stepButton}
          aria-label={t("decreaseServings")}
          data-testid={withTestIds ? "decrease-servings" : undefined}
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          <Icon icon={Minus} />
        </button>
        <output
          aria-live="polite"
          data-testid={withTestIds ? "display-servings" : undefined}
          className="text-body-l min-w-10 text-center font-semibold tabular-nums"
        >
          {value}
        </output>
        <button
          type="button"
          className={stepButton}
          aria-label={t("increaseServings")}
          data-testid={withTestIds ? "increase-servings" : undefined}
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          <Icon icon={Plus} />
        </button>
      </div>
    </div>
  );
}
