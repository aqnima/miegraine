'use server';

import { db } from '@/lib/db';
import {
  storeRequests,
  tenants,
  outlets,
  users,
  auditLogs,
  platformSettings,
} from '@/lib/db/schema';
import { getSessionUser } from '@/lib/auth/session';
import { BUSINESS_PRESETS } from '@/lib/constants/business-presets';
import { createId } from '@paralleldrive/cuid2';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * 1. Owner submits request for a new store / tenant
 */
export async function createStoreRequestAction(data: {
  storeName: string;
  businessType: string;
  requestedPlan: 'starter' | 'pro' | 'ultra';
  ownerPhone?: string;
}) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  if (user.role !== 'owner' && user.role !== 'superadmin') {
    throw new Error('Hanya pemilik akun (Owner) yang berhak mengajukan pembukaan toko baru.');
  }

  const requestId = createId();

  await db.insert(storeRequests).values({
    id: requestId,
    ownerId: user.userId,
    ownerName: user.name,
    ownerUsername: user.username,
    ownerPhone: data.ownerPhone || '',
    storeName: data.storeName.trim(),
    businessType: data.businessType,
    requestedPlan: data.requestedPlan,
    status: 'PENDING',
  });

  // Log Audit Trail
  await db.insert(auditLogs).values({
    id: createId(),
    tenantId: user.tenantId,
    outletId: user.outletId || null,
    userId: user.userId,
    userName: user.name,
    userRole: user.role,
    action: 'STORE_REQUEST_CREATED',
    resourceType: 'TENANT_REQUEST',
    resourceId: requestId,
    reason: `Pengajuan toko baru "${data.storeName}" (${data.businessType}) paket ${data.requestedPlan.toUpperCase()}`,
  });

  revalidatePath('/dashboard');
  revalidatePath('/superadmin/tenants');
  return { success: true, requestId };
}

/**
 * 2. Fetch all Store Requests for Superadmin
 */
export async function getStoreRequestsAction() {
  const user = await getSessionUser();
  if (!user || user.role !== 'superadmin') throw new Error('Unauthorized');

  return await db
    .select()
    .from(storeRequests)
    .orderBy(desc(storeRequests.createdAt));
}

/**
 * 3. Superadmin approves store request & provisions new tenant
 */
export async function approveStoreRequestAction(requestId: string) {
  const user = await getSessionUser();
  if (!user || user.role !== 'superadmin') throw new Error('Unauthorized');

  const reqList = await db
    .select()
    .from(storeRequests)
    .where(eq(storeRequests.id, requestId))
    .limit(1);

  if (reqList.length === 0) throw new Error('Pengajuan toko tidak ditemukan.');
  const req = reqList[0];
  if (req.status !== 'PENDING') throw new Error('Pengajuan ini sudah diproses sebelumnya.');

  const newTenantId = createId();
  const preset = BUSINESS_PRESETS[req.businessType] || BUSINESS_PRESETS.general;

  const now = new Date();
  const expiresAt = new Date(now);
  if (req.requestedPlan === 'starter') {
    expiresAt.setDate(expiresAt.getDate() + 7);
  } else {
    expiresAt.setDate(expiresAt.getDate() + 30);
  }

  // 1. Create Tenant
  await db.insert(tenants).values({
    id: newTenantId,
    name: req.storeName,
    businessType: req.businessType,
    phone: req.ownerPhone || '',
    receiptHeader: req.storeName.toUpperCase(),
    receiptFooter: preset.receiptFooter,
    subscriptionPlan: req.requestedPlan,
    subscriptionStatus: 'active',
    subscriptionExpiresAt: expiresAt,
  });

  // 2. Create Main Outlet
  const mainOutletId = createId();
  await db.insert(outlets).values({
    id: mainOutletId,
    tenantId: newTenantId,
    name: 'Toko Utama',
    isMain: true,
  });

  // 3. Mark request APPROVED
  await db
    .update(storeRequests)
    .set({
      status: 'APPROVED',
      updatedAt: new Date(),
    })
    .where(eq(storeRequests.id, requestId));

  // 4. Audit Log
  await db.insert(auditLogs).values({
    id: createId(),
    tenantId: newTenantId,
    outletId: mainOutletId,
    userId: user.userId,
    userName: user.name,
    userRole: 'superadmin',
    action: 'STORE_REQUEST_APPROVED',
    resourceType: 'TENANT_REQUEST',
    resourceId: requestId,
    reason: `Persetujuan toko baru "${req.storeName}" untuk owner ${req.ownerName} (@${req.ownerUsername})`,
  });

  revalidatePath('/superadmin/tenants');
  revalidatePath('/dashboard');
  return { success: true, tenantId: newTenantId };
}

/**
 * 4. Superadmin rejects store request
 */
export async function rejectStoreRequestAction(requestId: string, adminNotes: string) {
  const user = await getSessionUser();
  if (!user || user.role !== 'superadmin') throw new Error('Unauthorized');

  await db
    .update(storeRequests)
    .set({
      status: 'REJECTED',
      adminNotes: adminNotes.trim(),
      updatedAt: new Date(),
    })
    .where(eq(storeRequests.id, requestId));

  revalidatePath('/superadmin/tenants');
  revalidatePath('/dashboard');
  return { success: true };
}
