"use client";

import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import { Button, linkClasses } from "@/components/ui/Button";
import { FieldError, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";

interface StepInputProps {
  steps: string[];
  onUpdate: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  submitted: boolean;
}

export function StepInput({ steps, onUpdate, onAdd, onRemove, submitted }: StepInputProps) {
  const t = useTranslations();
  const missing = submitted && steps.filter((s) => s.trim()).length === 0;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-title">{t("steps")}</h2>
      {steps.map((step, i) => (
        <div key={i} className="grid grid-cols-[2.25rem_minmax(0,1fr)_2.75rem] items-start gap-2">
          <span className="font-display text-step-number text-tomato pt-2.5 lining-nums">
            {i + 1}
          </span>
          <Textarea
            value={step}
            onChange={(e) => onUpdate(i, e.target.value)}
            placeholder={t("stepPlaceholder")}
            aria-label={`${t("steps")} ${i + 1}`}
            aria-invalid={missing || undefined}
            rows={3}
          />
          {steps.length > 1 ? (
            <Button
              variant="ghost"
              icon
              onClick={() => onRemove(i)}
              aria-label={t("removeStepRow", { n: i + 1 })}
            >
              <Icon icon={X} />
            </Button>
          ) : (
            <span />
          )}
        </div>
      ))}
      {missing ? <FieldError>{t("requiredStep")}</FieldError> : null}
      <button
        type="button"
        onClick={onAdd}
        className={`${linkClasses} cursor-pointer self-start py-1`}
      >
        <Icon icon={Plus} size={18} />
        {t("addStep")}
      </button>
    </section>
  );
}
