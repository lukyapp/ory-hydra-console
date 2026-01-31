import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
  ],
};

export default function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const pathname = '/' + request.nextUrl.pathname.split('/').slice(2).join('/');
  requestHeaders.set('x-pathname', pathname);
  const modifiedRequest = new NextRequest(request.url, {
    headers: requestHeaders,
  });
  return intlMiddleware(modifiedRequest);
}
