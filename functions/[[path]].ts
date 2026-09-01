export async function onRequest(context: any) {
  const { request, next } = context;
  const url = new URL(request.url);

  // If requesting API routes, execute API handlers
  if (url.pathname.startsWith('/api/')) {
    return next();
  }

  // If requesting static assets (_next, icons, favicon, images, manifest), pass through
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.json') ||
    url.pathname.endsWith('.webmanifest') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css')
  ) {
    return next();
  }

  // Try serving static route first
  const response = await next();
  if (response.status !== 404) {
    return response;
  }

  // SPA fallback for /dashboard, /superadmin, or sub-routes
  return next('/index.html');
}
