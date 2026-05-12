import { getMessages, getLocale } from "next-intl/server";
import "../globals.css";
import { I18nProvider } from "@/components/I18nProvider";

export default async function LocaleLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="flex h-full min-h-full flex-col antialiased">
        <I18nProvider locale={locale} messages={messages}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
