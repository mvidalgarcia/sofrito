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

const PUBLIC_PATHS = new Set(["login"]);

function isPublic(path: string): boolean {
  return PUBLIC_PATHS.has(path);
}

function redirectToLogin(baseUrl: string, pathname: string, locale: Locale): Response {
  const loginUrl = new URL(`/${locale}/login`, baseUrl);
  loginUrl.searchParams.set("callbackUrl", pathname);
  return Response.redirect(loginUrl);
}

function redirectToHome(locale: Locale, baseUrl: string): Response {
  return Response.redirect(new URL(`/${locale}`, baseUrl));
}

export default auth((req) => {
  if (BYPASS_AUTH) return intl(req);

  const parts = req.nextUrl.pathname.split("/").filter(Boolean);
  const locale = extractLocale(parts);

  if (!req.auth && !isPublic(parts[parts.length - 1])) {
    return redirectToLogin(req.url, req.nextUrl.pathname, locale);
  }

  if (req.auth && isPublic(parts[parts.length - 1])) {
    return redirectToHome(locale, req.url);
  }

  return intl(req);
});

export const config = {
  matcher: "/((?!api|_next|_vercel|favicon.ico|.*\\..*).*)",
};
