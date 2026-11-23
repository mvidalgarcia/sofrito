"use client";

import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePathname } from "next/navigation";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Wordmark } from "@/components/ui/Wordmark";

/** Back affordance for the left of the header: a link, or a button for in-page views. */
export function BackButton({ href, onClick }: { href?: string; onClick?: () => void }) {
  const t = useTranslations();
  if (href) {
    return (
      <ButtonLink href={href} variant="ghost" icon aria-label={t("backList")}>
        <Icon icon={ChevronLeft} />
      </ButtonLink>
    );
  }
  return (
    <Button variant="ghost" icon aria-label={t("backList")} onClick={onClick}>
      <Icon icon={ChevronLeft} />
    </Button>
  );
}

function DesktopNav() {
  const t = useTranslations();
  const pathname = usePathname() ?? "";
  const page = "/" + pathname.split("/").slice(2).join("/");
  const links = [
    { href: "/", label: t("navFind"), current: page === "/" },
    { href: "/recipes", label: t("navMyRecipes"), current: page.startsWith("/recipes") },
    { href: "/recipe/new", label: t("navWrite"), current: page.startsWith("/recipe/new") },
  ];
  return (
    <nav aria-label={t("menu")} className="hidden items-center gap-1 lg:flex">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          aria-current={link.current ? "page" : undefined}
          className="text-button text-ink hover:bg-paper-sunk aria-[current=page]:text-tomato inline-flex min-h-11 items-center rounded-sm px-4 font-semibold no-underline"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function PageHeader({
  left,
  title,
  right,
  wide = false,
  guest,
}: {
  /** Replaces the wordmark, usually with a BackButton. */
  left?: ReactNode;
  title?: string;
  right?: ReactNode;
  /** Match the wider desktop recipe layout. */
  wide?: boolean;
  /** Signed-out visitor: no app navigation, a Sign in link instead of the menu. */
  guest?: ReactNode;
}) {
  return (
    <header className="border-line bg-paper-raised relative border-b">
      <div
        className={`mx-auto box-border flex min-h-14 items-center justify-between gap-2 py-1 pr-2 pl-4 ${
          wide ? "max-w-[680px] lg:max-w-[1008px] lg:px-6" : "max-w-[680px]"
        }`}
      >
        <div className="flex min-w-0 items-center gap-1 lg:gap-6">
          {left ? (
            <span className={`-ml-3 flex items-center ${wide ? "lg:hidden" : ""}`}>{left}</span>
          ) : (
            <Wordmark />
          )}
          {left && wide ? (
            <span className="hidden lg:inline-flex">
              <Wordmark />
            </span>
          ) : null}
          {title ? (
            <span className={`font-display text-card-title truncate ${wide ? "lg:hidden" : ""}`}>
              {title}
            </span>
          ) : null}
          {wide && !guest ? <DesktopNav /> : null}
        </div>
        <div className="relative flex items-center gap-1">
          {right}
          {guest ?? <HamburgerMenu />}
        </div>
      </div>
    </header>
  );
}

/** Page frame: header plus a centred main column. */
export function AppShell({
  header,
  children,
  wide = false,
}: {
  header: ReactNode;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="bg-paper flex min-h-screen flex-col">
      {header}
      <main
        className={`mx-auto box-border flex w-full flex-1 flex-col gap-8 px-4 pt-6 pb-12 sm:px-6 ${
          wide ? "max-w-[680px] lg:max-w-[1008px] lg:pt-14 lg:pb-16" : "max-w-[680px]"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
