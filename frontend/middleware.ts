import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Cross-domain deployments (Vercel + Render) use localStorage JWT tokens,
  // which are not available in server-side middleware.
  // Auth is enforced client-side by the dashboard layout & api-client.
  // Allow all dashboard routes through - the client will redirect to /login if not authenticated.
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
