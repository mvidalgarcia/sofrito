"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";

const OTHER_LOCALE = { es: "en", en: "es" } as const;

/** The same page in the other language, and the label for the switch ("English" / "Español"). */
export function useLocaleSwitch() {
  const t = useTranslations();
  const locale = useLocale() as keyof typeof OTHER_LOCALE;
  const pathname = usePathname() || `/${locale}`;
  const searchParams = useSearchParams();
  const target = OTHER_LOCALE[locale] ?? "en";
  const path = pathname.startsWith(`/${locale}`)
    ? pathname.replace(`/${locale}`, `/${target}`)
    : `/${target}${pathname}`;
  const query = searchParams?.toString();
  return { href: query ? `${path}?${query}` : path, label: t("switchLanguage"), target };
}
