"use client";

import { useTranslations } from "next-intl";
import { PageLoading } from "@/components/ui/States";

/** Whole-screen sauté loader for route loads and Suspense fallbacks. */
export function FullPageLoading() {
  const t = useTranslations();
  return <PageLoading label={t("loading")} fullScreen />;
}
