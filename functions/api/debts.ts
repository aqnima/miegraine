import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  'miegraine-saas-enterprise-secret-key-32chars-min!!'
);

const SESSION_COOKIE_NAME = '__miegraine_session';

let sampleCustomers = [
  {
    id: 'cust-1',
    name: 'Warung Bu Siti',
    phone: '081298765432',
    address: 'Jl. Melati No. 4',
    totalDebt: 350000,
    debtLimit: 1000000,
    lastTransactionDate: new Date().toISOString(),
    transactions: [
      {
        id: 'tx-debt-1',
        invoiceNo: 'INV-20260901-1001',
        createdAt: new Date().toISOString(),
        total: 500000,
        paidAmount: 150000,
        remainingDebt: 350000,
        paymentStatus: 'UNPAID',
      },
    ],
  },
  {
    id: 'cust-2',
    name: 'Kantin Pak Bambang',
    phone: '081345678901',
    address: 'Komplek Ruko Blok B',
    totalDebt: 120000,
    debtLimit: 500000,
    lastTransactionDate: new Date().toISOString(),
    transactions: [
      {
        id: 'tx-debt-2',
        invoiceNo: 'INV-20260901-1002',
        createdAt: new Date().toISOString(),
        total: 200000,
        paidAmount: 80000,
        remainingDebt: 120000,
        paymentStatus: 'UNPAID',
      },
    ],
  },
];

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

  const totalActiveDebt = sampleCustomers.reduce((sum, c) => sum + c.totalDebt, 0);

  const summary = {
    totalActiveDebt,
    debtorsCount: sampleCustomers.length,
    overLimitCount: 0,
    totalCustomers: sampleCustomers.length,
  };

  return new Response(JSON.stringify({ summary, customers: sampleCustomers }), {
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
    const { customerId, amount } = body;

    const cust = sampleCustomers.find((c) => c.id === customerId);
    if (cust) {
      cust.totalDebt = Math.max(0, cust.totalDebt - Number(amount));
    }

    return new Response(JSON.stringify({ success: true, customer: cust }), {
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
