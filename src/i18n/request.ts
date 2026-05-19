import { getRequestConfig } from "next-intl/server";
import { routing } from "../routing";
import { DEFAULT_TIMEZONE } from "@/lib/constants";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  const safeLocale =
    locale && routing.locales.includes(locale as (typeof routing.locales)[number])
      ? (locale as (typeof routing.locales)[number])
      : routing.defaultLocale;

  return {
    locale: safeLocale,
    messages: (await import(`../i18n/messages/${safeLocale}.json`)).default,
    timeZone: DEFAULT_TIMEZONE,
  };
});
