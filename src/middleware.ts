import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value || request.cookies.get('miegraine_session')?.value;
  const user = token ? await verifySessionToken(token) : null;

  // Initialize response
  const response = NextResponse.next();

  // 1. Enterprise Security Headers (SDD 12)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');

  // 2. Protected Routes Guard (/dashboard/* and /superadmin/*)
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isSuperadminRoute = pathname.startsWith('/superadmin');
  const isAuthRoute = pathname === '/login' || pathname === '/register';

  // Anti-Cache Headers for Authenticated & Protected Application Views (SDD 12)
  // Prevents sensitive financial/customer/POS data from lingering in shared browser history/cache
  if (isDashboardRoute || isSuperadminRoute) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  // Unauthenticated user trying to access protected route
  if ((isDashboardRoute || isSuperadminRoute) && !user) {
    const loginUrl = new URL('/login', request.url);
    if (pathname.startsWith('/') && !pathname.startsWith('//') && !pathname.includes('\\')) {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user trying to access /login or /register
  if (isAuthRoute && user) {
    if (user.role === 'superadmin') {
      return NextResponse.redirect(new URL('/superadmin', request.url));
    }
    if (user.role === 'cashier') {
      return NextResponse.redirect(new URL('/dashboard/pos', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // RBAC Access Control Guard
  if (user) {
    // Non-superadmin trying to access /superadmin
    if (isSuperadminRoute && user.role !== 'superadmin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Cashier role trying to access backoffice management routes
    if (user.role === 'cashier') {
      const allowedCashierRoutes = ['/dashboard/pos'];
      const isAllowed = allowedCashierRoutes.some((route) => pathname.startsWith(route));

      if (isDashboardRoute && !isAllowed) {
        return NextResponse.redirect(new URL('/dashboard/pos', request.url));
      }
    }

    // Admin role trying to access Owner-only routes (/dashboard/audit, /dashboard/users, /dashboard/settings)
    if (user.role === 'admin') {
      const ownerOnlyRoutes = ['/dashboard/audit', '/dashboard/users', '/dashboard/settings'];
      if (ownerOnlyRoutes.some((route) => pathname.startsWith(route))) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
