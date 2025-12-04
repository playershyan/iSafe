import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales } from './i18n';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always',
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('/icon') ||
    pathname.includes('/favicon')
  ) {
    return NextResponse.next();
  }

  const response = intlMiddleware(request);

  if (pathname.includes('/register') && !pathname.includes('/register/auth')) {
    const shelterCode = request.cookies.get('shelter_code');

    if (!shelterCode) {
      const url = request.nextUrl.clone();
      const locale = pathname.split('/')[1];
      url.pathname = `/${locale}/register/auth`;
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
