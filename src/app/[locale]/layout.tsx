import type { Metadata, Viewport } from "next";
import { Fraunces, Schibsted_Grotesk } from "next/font/google";
import { getMessages, getLocale } from "next-intl/server";
import "../globals.css";
import { I18nProvider } from "@/components/I18nProvider";
import { PwaRegister } from "@/components/PwaRegister";
import { SessionProvider } from "@/components/SessionProvider";
import { DEFAULT_TIMEZONE } from "@/lib/constants";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const schibsted = Schibsted_Grotesk({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-schibsted",
  display: "swap",
});

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
    <html lang={locale} className={`${fraunces.variable} ${schibsted.variable}`}>
      <body className="flex h-full min-h-full flex-col antialiased">
        <I18nProvider locale={locale} messages={messages} timeZone={DEFAULT_TIMEZONE}>
          <SessionProvider>{children}</SessionProvider>
        </I18nProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
