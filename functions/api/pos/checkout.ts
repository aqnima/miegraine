import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  'miegraine-saas-enterprise-secret-key-32chars-min!!'
);

const SESSION_COOKIE_NAME = '__miegraine_session';

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
    const invoiceNo = `INV-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const transactionResult = {
      success: true,
      transactionId: `tx-${Date.now()}`,
      invoiceNo,
      total: body.total || 0,
      paidAmount: body.paidAmount || body.total || 0,
      change: (body.paidAmount || body.total) - (body.total || 0),
      paymentMethod: body.paymentMethod || 'CASH',
      createdAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify(transactionResult), {
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
