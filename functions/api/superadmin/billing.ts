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

    // Default enriched tenants data for superadmin billing
    const sampleTenants = [
      {
        id: 'tenant-demo-1',
        name: 'Toko Mie Graine Pusat',
        businessType: 'fnb',
        ownerName: 'Bos Besar Banget',
        ownerUsername: 'owner',
        phone: '08123456789',
        waUrl: 'https://wa.me/628123456789',
        subscriptionPlan: 'pro',
        subscriptionStatus: 'active',
        subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        daysLeft: 30,
        isExpiringSoon: false,
        isExpired: false,
        planPrice: 99000,
      },
    ];

    const data = {
      tenants: sampleTenants,
      totalMRR: 99000,
      expiringSoonCount: 0,
      expiredCount: 0,
      activeCount: 1,
    };

    return new Response(JSON.stringify(data), {
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
