import { createNavigation } from "next-intl/navigation";
import { routing } from "../routing";

/**
 * Locale-aware navigation. Use these instead of next/link and next/navigation's
 * router for in-app links: they keep the current /es or /en prefix, so a click
 * never goes through the proxy's redirect, which would pick the language from
 * the cookie or the browser instead of the page the user is on.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
