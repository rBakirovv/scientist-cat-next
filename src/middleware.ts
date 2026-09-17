import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

const SIGN_IN = '/sign-in';

export function middleware(request: NextRequest) {
  const hasSession = getSessionCookie(request) != null;
  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith(SIGN_IN);

  if (!hasSession && !isAuthRoute) {
    return NextResponse.redirect(new URL(SIGN_IN, request.url));
  }

  if (hasSession && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
