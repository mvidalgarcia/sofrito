"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";

const OTHER_LOCALES = { es: "en", en: "es" } as const;

export function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const t = useTranslations();
  const pathname = usePathname();
  const currentLocale = pathname?.split("/")[1] || "es";
  const targetLocale = OTHER_LOCALES[currentLocale as keyof typeof OTHER_LOCALES] || "en";
  const newPathname = pathname?.replace(`/${currentLocale}`, `/${targetLocale}`) || "/en";

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        aria-label="Menu"
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {open && <div className="fixed inset-0 z-40 bg-black/20" onClick={() => setOpen(false)} />}

      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-64 flex-col bg-white shadow-lg transition-transform dark:bg-zinc-900 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{t("menu")}</span>
          <button
            onClick={() => setOpen(false)}
            className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {session?.user && (
            <div className="mb-6">
              <p className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {session.user.email}
              </p>
              <button
                onClick={() => signOut({ redirectTo: "/" })}
                className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                {t("signOut")}
              </button>
            </div>
          )}

          <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <Link
              href={newPathname}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-zinc-600 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-500"
            >
              {t("switchLanguage")}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
