"use client";

import { useSession, signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

export function AuthButton() {
  const { data: session } = useSession();
  const t = useTranslations();

  if (!session?.user) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{session.user.email}</span>
      <button
        onClick={() => signOut({ redirectTo: "/" })}
        className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        {t("signOut")}
      </button>
    </div>
  );
}
