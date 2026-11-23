"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { BookOpen, Languages, LogOut, Menu, PencilLine, Search, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useLocaleSwitch } from "@/lib/hooks/use-locale-switch";

const itemClasses =
  "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-sm px-3 text-left text-button font-semibold text-ink no-underline hover:bg-paper-sunk aria-[current=page]:text-tomato";

function MenuLink({
  href,
  icon,
  label,
  current,
  onNavigate,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  current: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={itemClasses}
      aria-current={current ? "page" : undefined}
    >
      <Icon icon={icon} />
      {label}
    </Link>
  );
}

export function HamburgerMenu() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname() ?? "";
  const localeSwitch = useLocaleSwitch();
  const panelRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Path without the locale prefix, to mark the current page.
  const page = "/" + pathname.split("/").slice(2).join("/");
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const userName = session?.user?.name || session?.user?.email;

  return (
    <>
      <Button
        ref={buttonRef}
        variant="ghost"
        icon
        onClick={() => setOpen(!open)}
        aria-label={open ? t("closeMenu") : t("menu")}
        aria-expanded={open}
        aria-controls="main-menu"
        className={open ? "bg-paper-sunk" : ""}
      >
        <Icon icon={open ? X : Menu} />
      </Button>

      {open ? (
        <>
          <div className="bg-scrim fixed inset-x-0 top-14 bottom-0 z-40" onClick={close} />
          <nav
            id="main-menu"
            ref={panelRef}
            aria-label={t("menu")}
            className="border-line bg-paper-raised shadow-pop absolute top-[calc(100%+8px)] right-0 z-50 flex w-60 flex-col gap-0.5 rounded-md border p-2"
          >
            {userName ? (
              <p className="text-body-s text-ink-muted px-3 py-2">
                {t("signedInAs", { name: userName })}
              </p>
            ) : null}
            <MenuLink
              href="/"
              icon={Search}
              label={t("navFind")}
              current={page === "/"}
              onNavigate={close}
            />
            <MenuLink
              href="/recipes"
              icon={BookOpen}
              label={t("navMyRecipes")}
              current={page.startsWith("/recipes")}
              onNavigate={close}
            />
            <MenuLink
              href="/recipe/new"
              icon={PencilLine}
              label={t("navWrite")}
              current={page.startsWith("/recipe/new")}
              onNavigate={close}
            />
            <div className="bg-line mx-2 my-1 h-px" />
            {/* The language switch carries its own locale prefix, so it uses the plain link. */}
            <NextLink
              href={localeSwitch.href}
              onClick={close}
              className={itemClasses}
              hrefLang={localeSwitch.target}
            >
              <Icon icon={Languages} />
              {localeSwitch.label}
            </NextLink>
            {session?.user ? (
              <button
                type="button"
                className={itemClasses}
                onClick={() => signOut({ redirectTo: `/${locale}` })}
              >
                <Icon icon={LogOut} />
                {t("signOut")}
              </button>
            ) : null}
          </nav>
        </>
      ) : null}
    </>
  );
}
