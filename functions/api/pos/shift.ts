import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  'miegraine-saas-enterprise-secret-key-32chars-min!!'
);

const SESSION_COOKIE_NAME = '__miegraine_session';

let currentShift: any = null;

async function verifyAuth(request: Request) {
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
    return payload;
  } catch {
    return null;
  }
}

export async function onRequestGet(context: any) {
  const user = await verifyAuth(context.request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(currentShift), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context: any) {
  const user = await verifyAuth(context.request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await context.request.json();
    const { action, openingCash, actualCash, notes } = body;

    if (action === 'OPEN') {
      currentShift = {
        id: `shift-${Date.now()}`,
        cashierName: user.name || 'Kasir',
        openingCash: Number(openingCash) || 0,
        startTime: new Date().toISOString(),
        status: 'OPEN',
      };
      return new Response(JSON.stringify({ success: true, shift: currentShift }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (action === 'CLOSE') {
      const closed = {
        ...currentShift,
        actualCash: Number(actualCash) || 0,
        notes: notes || '',
        endTime: new Date().toISOString(),
        status: 'CLOSED',
      };
      currentShift = null;
      return new Response(JSON.stringify({ success: true, shift: closed }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid shift action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
