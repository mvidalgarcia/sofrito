"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const OTHER_LOCALES = {
  es: "en",
  en: "es",
} as const;

export function LangSwitcher() {
  const pathname = usePathname();
  const currentLocale = pathname?.split("/")[1] || "es";
  const targetLocale = OTHER_LOCALES[currentLocale as keyof typeof OTHER_LOCALES] || "en";
  const newPathname = pathname?.replace(`/${currentLocale}`, `/${targetLocale}`) || "/en";

  return (
    <Link
      href={newPathname}
      className="text-sm text-zinc-600 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-500"
    >
      {targetLocale === "en" ? "EN" : "ES"}
    </Link>
  );
}
