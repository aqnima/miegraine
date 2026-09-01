'use server';

import { db } from '@/lib/db';
import { outlets, outletStock, products } from '@/lib/db/schema';
import { getSessionUser, signSessionToken, setSessionCookie } from '@/lib/auth/session';
import { eq, and } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';
import { revalidatePath } from 'next/cache';

/**
 * 1. Switch Active Outlet Branch for Current Session
 */
export async function switchOutletAction(outletId: string) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const matched = await db
    .select()
    .from(outlets)
    .where(and(eq(outlets.tenantId, user.tenantId), eq(outlets.id, outletId)))
    .limit(1);

  if (matched.length === 0) {
    throw new Error('Cabang toko tidak ditemukan.');
  }

  const targetOutlet = matched[0];

  // Re-sign JWT session with updated outlet
  const token = await signSessionToken({
    ...user,
    outletId: targetOutlet.id,
    outletName: targetOutlet.name,
  });

  await setSessionCookie(token);

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/pos');
  revalidatePath('/dashboard/inventory');
  revalidatePath('/dashboard/reports');

  return { success: true, outletName: targetOutlet.name };
}

/**
 * 2. Create New Branch / Outlet
 */
export async function createOutletAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  if (user.role !== 'owner' && user.role !== 'superadmin') {
    throw new Error('Hanya pemilik toko (Owner) yang berhak menambah cabang.');
  }

  const name = formData.get('name')?.toString().trim();
  const address = formData.get('address')?.toString().trim() || '';
  const phone = formData.get('phone')?.toString().trim() || '';

  if (!name) throw new Error('Nama cabang wajib diisi.');

  const outletId = createId();

  await db.insert(outlets).values({
    id: outletId,
    tenantId: user.tenantId,
    name,
    address,
    phone,
    isMain: false,
  });

  // Seed default 0 stock for existing active products in this new branch
  const existingProducts = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.tenantId, user.tenantId));

  for (const prod of existingProducts) {
    await db.insert(outletStock).values({
      id: createId(),
      tenantId: user.tenantId,
      outletId,
      productId: prod.id,
      currentStock: 0,
    });
  }

  revalidatePath('/dashboard');
  return { success: true, outletId };
}
