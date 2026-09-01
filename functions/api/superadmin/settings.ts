import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  'miegraine-saas-enterprise-secret-key-32chars-min!!'
);

const SESSION_COOKIE_NAME = '__miegraine_session';

// In-memory / edge KV default state
let globalSettings = {
  starterPrice: 99000,
  proPrice: 199000,
  enterprisePrice: 499000,
  trialDays: 14,
  supportPhone: '6281234567890',
  supportEmail: 'support@miegraine.id',
  broadcastBanner: '',
  isBroadcastActive: false,
};

export async function onRequestGet(context: any) {
  return new Response(JSON.stringify(globalSettings), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context: any) {
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

    const body = await request.json();
    globalSettings = {
      ...globalSettings,
      ...body,
    };

    return new Response(JSON.stringify({ success: true, settings: globalSettings }), {
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
