import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  'miegraine-saas-enterprise-secret-key-32chars-min!!'
);

const SESSION_COOKIE_NAME = '__miegraine_session';

// In-memory tenant products storage at Edge
let sampleProducts: any[] = [
  {
    id: 'prod-1',
    name: 'Mie Graine Spesial Level 1',
    baseUnit: 'porsi',
    categoryName: 'Makanan Utama',
    costPrice: 8000,
    price: 15000,
    stock: 85,
    minStockAlert: 10,
    barcode: '8991001001',
    hasImei: false,
    isActive: true,
    units: [],
    priceTiers: [{ id: 'pt-1', tierName: 'ecer', minQty: 1, price: 15000 }],
  },
  {
    id: 'prod-2',
    name: 'Mie Graine Spesial Level 3 (Pedas)',
    baseUnit: 'porsi',
    categoryName: 'Makanan Utama',
    costPrice: 8500,
    price: 16000,
    stock: 42,
    minStockAlert: 10,
    barcode: '8991001002',
    hasImei: false,
    isActive: true,
    units: [],
    priceTiers: [{ id: 'pt-2', tierName: 'ecer', minQty: 1, price: 16000 }],
  },
  {
    id: 'prod-3',
    name: 'Es Teh Manis Jumbo',
    baseUnit: 'cup',
    categoryName: 'Minuman Segar',
    costPrice: 1500,
    price: 5000,
    stock: 120,
    minStockAlert: 15,
    barcode: '8991001003',
    hasImei: false,
    isActive: true,
    units: [],
    priceTiers: [{ id: 'pt-3', tierName: 'ecer', minQty: 1, price: 5000 }],
  },
  {
    id: 'prod-4',
    name: 'Pangsit Goreng Renyah (Isi 5)',
    baseUnit: 'porsi',
    categoryName: 'Snack & Topping',
    costPrice: 4000,
    price: 10000,
    stock: 6,
    minStockAlert: 10,
    barcode: '8991001004',
    hasImei: false,
    isActive: true,
    units: [],
    priceTiers: [{ id: 'pt-4', tierName: 'ecer', minQty: 1, price: 10000 }],
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

// 1. GET: Fetch all products
export async function onRequestGet(context: any) {
  const user = await verifyAuth(context.request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const activeProducts = sampleProducts.filter((p) => p.isActive);
  return new Response(JSON.stringify(activeProducts), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// 2. POST: Create Product
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
    const newProduct = {
      id: `prod-${Date.now()}`,
      name: body.name,
      baseUnit: body.baseUnit || 'pcs',
      categoryName: body.categoryName || 'Umum',
      costPrice: Number(body.costPrice) || 0,
      price: Number(body.sellingPrice || body.price) || 0,
      stock: Number(body.initialStock || body.stock) || 0,
      minStockAlert: Number(body.minStockAlert) || 5,
      barcode: body.barcode || '',
      hasImei: Boolean(body.hasImei),
      isActive: true,
      units: body.units || [],
      priceTiers: [
        {
          id: `pt-${Date.now()}`,
          tierName: 'ecer',
          minQty: 1,
          price: Number(body.sellingPrice || body.price) || 0,
        },
      ],
    };

    sampleProducts.unshift(newProduct);

    return new Response(JSON.stringify({ success: true, product: newProduct }), {
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

// 3. DELETE: Soft delete product
export async function onRequestDelete(context: any) {
  const user = await verifyAuth(context.request);
  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(context.request.url);
    const id = url.searchParams.get('id');

    if (id) {
      sampleProducts = sampleProducts.filter((p) => p.id !== id);
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
