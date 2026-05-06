import createMiddleware from 'next-intl/middleware';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  localePrefix: 'always',
});

export default createMiddleware(routing);

export const config = {
  matcher: '/((?!api|_next|_vercel|favicon.ico|.*\\..*).*)',
};