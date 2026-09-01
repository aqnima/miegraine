import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  'miegraine-saas-enterprise-secret-key-32chars-min!!'
);

const SESSION_COOKIE_NAME = '__miegraine_session';

let sampleTenants = [
  {
    id: 'tenant-demo-1',
    name: 'Toko Mie Graine Pusat',
    businessType: 'fnb',
    phone: '08123456789',
    address: 'Jl. Ahmad Yani No. 88, Jakarta',
    subscriptionPlan: 'pro',
    subscriptionStatus: 'active',
    subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    ownerName: 'Bos Besar Banget',
    ownerUsername: 'owner',
    outletsCount: 1,
    totalSales: 15450000,
    transactionsCount: 128,
  },
];

async function verifySuperadmin(request: Request) {
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c: string) => {
      const [key, ...v] = c.trim().split('=');
      return [key, v.join('=')];
    })
  );

  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== 'superadmin') return null;
    return payload;
  } catch {
    return null;
  }
}

// 1. GET: Fetch all tenants
export async function onRequestGet(context: any) {
  const admin = await verifySuperadmin(context.request);
  if (!admin) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(sampleTenants), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// 2. POST: Create New Tenant Manually
export async function onRequestPost(context: any) {
  const admin = await verifySuperadmin(context.request);
  if (!admin) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await context.request.json();
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + (Number(body.months) || 1));

    const newTenant = {
      id: `tenant-${Date.now()}`,
      name: body.storeName.trim(),
      businessType: body.businessType || 'general',
      phone: body.phone?.trim() || '-',
      address: body.address?.trim() || '-',
      subscriptionPlan: body.plan || 'starter',
      subscriptionStatus: 'active',
      subscriptionExpiresAt: expiry.toISOString(),
      createdAt: new Date().toISOString(),
      ownerName: body.ownerName.trim(),
      ownerUsername: body.username.trim().toLowerCase(),
      outletsCount: 1,
      totalSales: 0,
      transactionsCount: 0,
    };

    sampleTenants.unshift(newTenant);

    return new Response(JSON.stringify({ success: true, tenant: newTenant }), {
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

// 3. PUT: Update Subscription
export async function onRequestPut(context: any) {
  const admin = await verifySuperadmin(context.request);
  if (!admin) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await context.request.json();
    const { tenantId, plan, status, extendMonths } = body;

    const tenant = sampleTenants.find((t) => t.id === tenantId);
    if (tenant) {
      if (plan) tenant.subscriptionPlan = plan;
      if (status) tenant.subscriptionStatus = status;
      if (extendMonths && extendMonths > 0) {
        let currentExp = new Date(tenant.subscriptionExpiresAt);
        if (currentExp < new Date()) currentExp = new Date();
        currentExp.setMonth(currentExp.getMonth() + extendMonths);
        tenant.subscriptionExpiresAt = currentExp.toISOString();
      }
    }

    return new Response(JSON.stringify({ success: true, tenant }), {
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

// 4. DELETE: Delete Tenant
export async function onRequestDelete(context: any) {
  const admin = await verifySuperadmin(context.request);
  if (!admin) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');

    if (id) {
      sampleTenants = sampleTenants.filter((t) => t.id !== id);
    }

    return new Response(JSON.stringify({ success: true }), {
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
