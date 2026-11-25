import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { FullPageLoading } from "@/components/FullPageLoading";
import { SharedRecipe } from "@/components/SharedRecipe";
import { getPreviewTimes, getSharePreview } from "@/lib/share-preview";
import { routing } from "@/routing";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string | string[] }>;
}): Promise<Metadata> {
  const { locale: requested } = await params;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const { id: rawId } = await searchParams;
  const id = typeof rawId === "string" ? rawId : undefined;

  const t = await getTranslations({ locale });
  const recipe = await getSharePreview(id);

  const title = recipe?.name ?? t("title");
  let description = t("sharePreviewFallback");
  if (recipe) {
    const facts = [
      ...(await getPreviewTimes(recipe, locale)),
      ...(recipe.servings ? [t("shareServes", { count: recipe.servings })] : []),
    ].join(" · ");
    description = facts ? `${facts}. ${t("shareSource")}` : t("shareSource");
  }

  const query = new URLSearchParams({ ...(recipe && id ? { id } : {}), locale });
  const image = { url: `/api/og?${query}`, width: 1200, height: 630, alt: title };

  return {
    title,
    description,
    openGraph: { type: "website", siteName: t("title"), title, description, images: [image] },
    twitter: { card: "summary_large_image" },
  };
}

export default function SharePage() {
  return (
    <Suspense fallback={<FullPageLoading />}>
      <SharedRecipe />
    </Suspense>
  );
}
