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

export async function onRequestGet(context: any) {
  const user = await verifyAuth(context.request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const summary = {
    totalAssetValue: 2540000,
    totalItemsCount: 253,
    lowStockCount: 1,
  };

  const mutations = [
    {
      id: 'mut-1',
      productName: 'Mie Graine Spesial Level 1',
      type: 'IN',
      qtyChange: 50,
      stockBefore: 35,
      stockAfter: 85,
      notes: 'Restock bahan baku mie',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'mut-2',
      productName: 'Es Teh Manis Jumbo',
      type: 'OUT',
      qtyChange: -12,
      stockBefore: 132,
      stockAfter: 120,
      notes: 'Penjualan kasir POS',
      createdAt: new Date().toISOString(),
    },
  ];

  return new Response(JSON.stringify({ summary, mutations }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
