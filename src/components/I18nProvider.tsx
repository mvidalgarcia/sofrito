'use client';

import { IntlProvider } from 'next-intl';
import { ReactNode } from 'react';

export function I18nProvider({
  children,
  locale,
  messages,
}: {
  children: ReactNode;
  locale: string;
  messages: Record<string, Record<string, string>>;
}) {
  return (
    <IntlProvider locale={locale} messages={messages}>
      {children}
    </IntlProvider>
  );
}