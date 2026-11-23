"use client";

import { signIn } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Languages } from "lucide-react";
import { buttonClasses, Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useLocaleSwitch } from "@/lib/hooks/use-locale-switch";

export default function LoginPage() {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || `/${locale}`;
  const localeSwitch = useLocaleSwitch();

  return (
    <div className="bg-paper flex min-h-screen flex-col">
      <section className="bg-saffron-soft px-6 pt-18 pb-10">
        <div className="mx-auto flex max-w-[480px] flex-col gap-5">
          <p className="font-display text-ink text-[56px] leading-[56px] tracking-[-0.02em]">
            sofrito
          </p>
        </div>
      </section>

      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col gap-4 px-6 pt-10 pb-6">
        <h1 className="font-display text-display-l tracking-[-0.01em] text-balance">
          {t("loginTitle")}
        </h1>
        <p className="text-ink-muted">{t("loginDescription")}</p>
        <Button
          variant="primary"
          block
          className="mt-4 min-h-[52px]"
          onClick={() => signIn("google", { callbackUrl })}
        >
          {t("signInWithGoogle")}
        </Button>
        <p className="text-body-s text-ink-muted text-center">{t("loginNote")}</p>
      </main>

      <footer className="flex justify-center px-6 pb-8">
        <Link
          href={localeSwitch.href}
          hrefLang={localeSwitch.target}
          className={buttonClasses({ variant: "ghost" })}
        >
          <Icon icon={Languages} />
          {localeSwitch.label}
        </Link>
      </footer>
    </div>
  );
}
