import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "always",
  // Remember the chosen language across browser and PWA restarts (default is a session cookie).
  localeCookie: { maxAge: 60 * 60 * 24 * 365 },
});
