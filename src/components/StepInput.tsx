"use client";

import { useTranslations } from "next-intl";

interface StepInputProps {
  steps: string[];
  onUpdate: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  submitted: boolean;
}

export function StepInput({ steps, onUpdate, onAdd, onRemove, submitted }: StepInputProps) {
  const t = useTranslations();

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t("steps")}</label>
        <button
          type="button"
          onClick={onAdd}
          className="cursor-pointer text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          + {t("addStep")}
        </button>
      </div>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              {i + 1}
            </span>
            <textarea
              value={step}
              onChange={(e) => onUpdate(i, e.target.value)}
              placeholder={t("stepPlaceholder")}
              rows={2}
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            {steps.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="mt-2 cursor-pointer rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      {submitted && steps.filter((s) => s.trim()).length === 0 && (
        <p className="mt-1 text-sm text-red-500">{t("requiredStep")}</p>
      )}
    </div>
  );
}
