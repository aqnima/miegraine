import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  'miegraine-saas-enterprise-secret-key-32chars-min!!'
);

const SESSION_COOKIE_NAME = '__miegraine_session';

export async function onRequest(context: any) {
  const { request, next } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 1. Bypass static assets and API
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/api/') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.json') ||
    pathname.endsWith('.webmanifest') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.rsc') ||
    pathname.endsWith('.js')
  ) {
    return next();
  }

  // 2. Parse Session Cookie
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c: string) => {
      const [key, ...v] = c.trim().split('=');
      return [key, v.join('=')];
    })
  );

  const token = cookies[SESSION_COOKIE_NAME];
  let user: any = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = payload;
    } catch {
      user = null;
    }
  }

  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isSuperadminRoute = pathname.startsWith('/superadmin');
  const isAuthRoute = pathname === '/login' || pathname === '/register';

  // 3. Unauthenticated user accessing protected dashboard/superadmin
  if ((isDashboardRoute || isSuperadminRoute) && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return Response.redirect(loginUrl.toString(), 302);
  }

  // 4. Authenticated user accessing /login or /register
  if (isAuthRoute && user) {
    if (user.role === 'superadmin') {
      return Response.redirect(new URL('/superadmin', request.url).toString(), 302);
    }
    if (user.role === 'cashier') {
      return Response.redirect(new URL('/dashboard/pos', request.url).toString(), 302);
    }
    return Response.redirect(new URL('/dashboard', request.url).toString(), 302);
  }

  // 5. RBAC Access Control Guard
  if (user) {
    if (isSuperadminRoute && user.role !== 'superadmin') {
      return Response.redirect(new URL('/dashboard', request.url).toString(), 302);
    }

    if (user.role === 'cashier') {
      const allowedCashierRoutes = ['/dashboard/pos'];
      const isAllowed = allowedCashierRoutes.some((route) => pathname.startsWith(route));
      if (isDashboardRoute && !isAllowed) {
        return Response.redirect(new URL('/dashboard/pos', request.url).toString(), 302);
      }
    }

    if (user.role === 'admin') {
      const ownerOnlyRoutes = ['/dashboard/audit', '/dashboard/settings'];
      if (ownerOnlyRoutes.some((route) => pathname.startsWith(route))) {
        return Response.redirect(new URL('/dashboard', request.url).toString(), 302);
      }
    }
  }

  const response = await next();

  // Add Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (isDashboardRoute || isSuperadminRoute) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
  }

  return response;
}
