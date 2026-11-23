import { auth } from "@/lib/auth";
import createMiddleware from "next-intl/middleware";
import { routing } from "./routing";

type Locale = (typeof routing.locales)[number];

const intl = createMiddleware(routing);

const BYPASS_AUTH = process.env.E2E_TEST === "true";

function extractLocale(parts: string[]): Locale {
  return parts[0] && routing.locales.includes(parts[0] as Locale)
    ? (parts[0] as Locale)
    : routing.defaultLocale;
}

/** Only for signed-out visitors: signed-in users are sent home. */
const GUEST_ONLY_PATHS = new Set(["login"]);
/** Open to everyone, signed in or not: shared recipe links. */
const OPEN_PATHS = new Set(["share"]);

function isGuestOnly(path: string): boolean {
  return GUEST_ONLY_PATHS.has(path);
}

function isOpen(path: string): boolean {
  return OPEN_PATHS.has(path);
}

function redirectToLogin(baseUrl: string, callbackPath: string, locale: Locale): Response {
  const loginUrl = new URL(`/${locale}/login`, baseUrl);
  loginUrl.searchParams.set("callbackUrl", callbackPath);
  return Response.redirect(loginUrl);
}

function redirectToHome(locale: Locale, baseUrl: string): Response {
  return Response.redirect(new URL(`/${locale}`, baseUrl));
}

export default auth((req) => {
  if (BYPASS_AUTH) return intl(req);

  const parts = req.nextUrl.pathname.split("/").filter(Boolean);
  const locale = extractLocale(parts);

  const page = parts[parts.length - 1];

  if (!req.auth && !isGuestOnly(page) && !isOpen(page)) {
    // Keep the query string (e.g. share ?id=...) so deep links survive the login redirect
    return redirectToLogin(req.url, req.nextUrl.pathname + req.nextUrl.search, locale);
  }

  if (req.auth && isGuestOnly(page)) {
    return redirectToHome(locale, req.url);
  }

  return intl(req);
});

export const config = {
  matcher: "/((?!api|_next|_vercel|favicon.ico|.*\\..*).*)",
};
