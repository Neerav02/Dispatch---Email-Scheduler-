import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const sessionCookie = request.cookies.get('dispatch_session');
    // Also check demo mode header or query parameter
    const isDemoMode = request.cookies.get('dispatch_demo_mode')?.value === 'true' || request.nextUrl.searchParams.get('demo') === 'true';

    if (!sessionCookie && !isDemoMode) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
