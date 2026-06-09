import type { Metadata, Viewport } from "next";
import { getMessages, getLocale } from "next-intl/server";
import "../globals.css";
import { I18nProvider } from "@/components/I18nProvider";
import { PwaRegister } from "@/components/PwaRegister";
import { SessionProvider } from "@/components/SessionProvider";
import { AuthButton } from "@/components/AuthButton";
import { LangSwitcher } from "@/components/LangSwitcher";
import { DEFAULT_TIMEZONE } from "@/lib/constants";

export const metadata: Metadata = {
  manifest: "/manifest.json",
  icons: {
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#f59e0b",
};

export default async function LocaleLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="flex h-full min-h-full flex-col antialiased">
        <I18nProvider locale={locale} messages={messages} timeZone={DEFAULT_TIMEZONE}>
          <SessionProvider>
            <header className="absolute top-4 right-4 z-50 flex items-center gap-3">
              <LangSwitcher />
              <AuthButton />
            </header>
            {children}
          </SessionProvider>
        </I18nProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
