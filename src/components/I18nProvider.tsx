"use client";

import { IntlProvider } from "next-intl";
import { ReactNode } from "react";

export function I18nProvider({
  children,
  locale,
  messages,
  timeZone,
}: {
  children: ReactNode;
  locale: string;
  messages: Record<string, Record<string, string>>;
  timeZone: string;
}) {
  return (
    <IntlProvider locale={locale} messages={messages} timeZone={timeZone}>
      {children}
    </IntlProvider>
  );
}
