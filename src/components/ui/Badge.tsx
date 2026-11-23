"use client";

import { Bookmark, Check, PencilLine, Sparkles, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Recipe, RecipeStatus } from "@/lib/types";
import { Icon } from "./Icon";

type Tone = "saffron" | "olive";

const TONES: Record<Tone, string> = {
  saffron: "bg-saffron-soft text-saffron-ink",
  olive: "bg-olive-soft text-olive-ink",
};

export function Badge({ tone, icon, label }: { tone: Tone; icon: LucideIcon; label: string }) {
  return (
    <span
      className={`text-label inline-flex h-6 items-center gap-1 rounded-full px-2 font-semibold tracking-[0.06em] uppercase ${TONES[tone]}`}
    >
      <Icon icon={icon} size={14} />
      {label}
    </span>
  );
}

/** Saved or Made. A recipe has exactly one status. */
export function StatusBadge({ status }: { status: RecipeStatus }) {
  const t = useTranslations();
  return status === "made" ? (
    <Badge tone="olive" icon={Check} label={t("made")} />
  ) : (
    <Badge tone="saffron" icon={Bookmark} label={t("saved")} />
  );
}

/**
 * Where the recipe came from. Only show it where generated and hand-written recipes
 * appear together (My recipes, a saved recipe); never on the suggestions list.
 */
export function SourceBadge({ source }: { source: NonNullable<Recipe["source"]> }) {
  const t = useTranslations();
  return source === "manual" ? (
    <Badge tone="olive" icon={PencilLine} label={t("sourceManual")} />
  ) : (
    <Badge tone="saffron" icon={Sparkles} label={t("sourceLlm")} />
  );
}
