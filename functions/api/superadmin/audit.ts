import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  'miegraine-saas-enterprise-secret-key-32chars-min!!'
);

const SESSION_COOKIE_NAME = '__miegraine_session';

export async function onRequestGet(context: any) {
  try {
    const { request } = context;
    const cookieHeader = request.headers.get('Cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c: string) => {
        const [key, ...v] = c.trim().split('=');
        return [key, v.join('=')];
      })
    );

    const token = cookies[SESSION_COOKIE_NAME];
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'superadmin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sampleLogs = [
      {
        id: 'audit-1',
        tenantId: 'tenant-demo-1',
        tenantName: 'Toko Mie Graine Pusat',
        userId: payload.userId || 'admin',
        userName: payload.name || 'Superadmin',
        userRole: 'superadmin',
        action: 'PLATFORM_LOGIN',
        resourceType: 'AUTH',
        resourceId: 'session',
        reason: 'Superadmin berhasil masuk ke console master',
        ipAddress: '127.0.0.1',
        createdAt: new Date().toISOString(),
      },
    ];

    return new Response(JSON.stringify(sampleLogs), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
