'use server';

import { db } from '@/lib/db';
import {
  tenants,
  users,
  outlets,
  transactions,
  categories,
  auditLogs,
  platformSettings,
} from '@/lib/db/schema';
import {
  getSessionUser,
  setSessionCookie,
  signSessionToken,
  UserSessionPayload,
} from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';
import { BUSINESS_PRESETS } from '@/lib/constants/business-presets';
import { createId } from '@paralleldrive/cuid2';
import { eq, desc, sql, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Security Guard: Ensure current session has Superadmin privileges
 */
async function requireSuperadmin() {
  const user = await getSessionUser();
  if (!user || user.role !== 'superadmin') {
    throw new Error('Akses ditolak: Operasi ini memerlukan hak akses Superadmin.');
  }
  return user;
}

/**
 * 1. Global Platform Analytics for Superadmin
 */
export async function getSuperadminOverviewAction() {
  const user = await requireSuperadmin();


  const allTenants = await db.select().from(tenants);
  const allTransactions = await db
    .select({
      total: transactions.total,
    })
    .from(transactions);

  const totalGMV = allTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
  const activeTenantsCount = allTenants.filter(
    (t) => t.subscriptionStatus === 'active' || t.subscriptionStatus === 'trial'
  ).length;
  const suspendedCount = allTenants.filter(
    (t) => t.subscriptionStatus === 'suspended'
  ).length;

  // Estimated Monthly Recurring Revenue (MRR): Starter = Rp 0 (Trial), Pro = Rp 99.000, Ultra = Rp 249.000
  const mrr = allTenants.reduce((sum, t) => {
    if (t.subscriptionStatus !== 'active') return sum;
    if (t.subscriptionPlan === 'ultra') return sum + 249000;
    if (t.subscriptionPlan === 'pro') return sum + 99000;
    return sum;
  }, 0);

  return {
    totalTenants: allTenants.length,
    activeTenantsCount,
    suspendedCount,
    totalGMV,
    mrr,
    totalTransactionsCount: allTransactions.length,
  };
}

/**
 * 2. Fetch All Tenants with Owner Info & Outlets
 */
export async function getAllTenantsAction() {
  await requireSuperadmin();

  const allTenants = await db
    .select()
    .from(tenants)
    .orderBy(desc(tenants.createdAt));

  const enriched = await Promise.all(
    allTenants.map(async (t) => {
      const owner = await db
        .select()
        .from(users)
        .where(and(eq(users.tenantId, t.id), eq(users.role, 'owner')))
        .limit(1);

      const outletList = await db
        .select()
        .from(outlets)
        .where(eq(outlets.tenantId, t.id));

      const txCount = await db
        .select({
          count: sql<number>`COUNT(*)`,
          sum: sql<number>`SUM(${transactions.total})`,
        })
        .from(transactions)
        .where(eq(transactions.tenantId, t.id));

      return {
        ...t,
        ownerName: owner[0]?.name || 'Owner',
        ownerUsername: owner[0]?.username || '-',
        outletsCount: outletList.length,
        totalSales: txCount[0]?.sum || 0,
        transactionsCount: txCount[0]?.count || 0,
      };
    })
  );

  return enriched;
}

/**
 * 3. Update Tenant Subscription (Extend Duration, Change Plan, Suspend/Activate)
 */
export async function updateTenantSubscriptionAction(
  tenantId: string,
  plan: string,
  status: string,
  extendMonths: number = 0
) {
  const user = await requireSuperadmin();

  const tenant = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  if (!tenant[0]) throw new Error('Tenant tidak ditemukan.');

  let newExpiry = tenant[0].subscriptionExpiresAt
    ? new Date(tenant[0].subscriptionExpiresAt)
    : new Date();

  // If already expired, extend from today
  if (newExpiry < new Date()) {
    newExpiry = new Date();
  }

  if (extendMonths > 0) {
    newExpiry.setMonth(newExpiry.getMonth() + extendMonths);
  }

  await db
    .update(tenants)
    .set({
      subscriptionPlan: plan,
      subscriptionStatus: status,
      subscriptionExpiresAt: newExpiry,
    })
    .where(eq(tenants.id, tenantId));

  await db.insert(auditLogs).values({
    id: createId(),
    tenantId,
    userId: user.userId,
    userName: user.name,
    userRole: 'superadmin',
    action: 'SUBSCRIPTION_UPDATE',
    resourceType: 'TENANT',
    resourceId: tenantId,
    reason: `Pembaruan paket ${plan.toUpperCase()}, status ${status}${extendMonths > 0 ? `, perpanjang +${extendMonths} bulan` : ''}`,
  });

  revalidatePath('/superadmin');
  revalidatePath('/superadmin/tenants');
  revalidatePath('/superadmin/audit');
  revalidatePath('/dashboard');
  return { success: true };
}

/**
 * 4. Impersonate Tenant (Login as Tenant Owner)
 */
export async function impersonateTenantAction(tenantId: string) {
  const currentUser = await requireSuperadmin();

  const tenant = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);

  if (!tenant[0]) throw new Error('Tenant tidak ditemukan.');

  const ownerUser = await db
    .select()
    .from(users)
    .where(and(eq(users.tenantId, tenantId), eq(users.role, 'owner')))
    .limit(1);

  if (!ownerUser[0]) throw new Error('Owner toko tidak ditemukan.');

  const outlet = await db
    .select()
    .from(outlets)
    .where(eq(outlets.tenantId, tenantId))
    .limit(1);

  // Log audit event for impersonation
  await db.insert(auditLogs).values({
    id: createId(),
    tenantId: tenant[0].id,
    userId: currentUser.userId,
    userName: currentUser.name,
    userRole: 'superadmin',
    action: 'SUPERADMIN_IMPERSONATION',
    resourceType: 'TENANT',
    resourceId: tenant[0].id,
    reason: `Superadmin ${currentUser.name} masuk ke dashboard toko "${tenant[0].name}" untuk asistensi teknis`,
  });

  // Set session cookie as this owner with impersonation context
  const token = await signSessionToken({
    userId: ownerUser[0].id,
    tenantId: tenant[0].id,
    tenantName: tenant[0].name,
    businessType: tenant[0].businessType,
    outletId: outlet[0]?.id || '',
    outletName: outlet[0]?.name || 'Toko Utama',
    username: ownerUser[0].username,
    name: ownerUser[0].name,
    role: 'owner',
    isImpersonating: true,
    originalRole: 'superadmin',
    originalUserId: currentUser.userId,
    originalName: currentUser.name,
  });

  await setSessionCookie(token);
  redirect('/dashboard');
}

/**
 * 5. Exit Impersonation Mode and Return to Superadmin
 */
export async function exitImpersonationAction() {
  const currentUser = await getSessionUser();
  if (!currentUser) redirect('/login');

  if (!currentUser.isImpersonating && currentUser.originalRole !== 'superadmin' && currentUser.role !== 'superadmin') {
    redirect('/dashboard');
  }

  // Find superadmin user in db
  const superadminUser = await db
    .select()
    .from(users)
    .where(eq(users.role, 'superadmin'))
    .limit(1);

  const adminName = currentUser.originalName || 'Superadmin';
  const adminId = currentUser.originalUserId || superadminUser[0]?.id || 'demo-user-superadmin';

  // Restore Superadmin Session
  const token = await signSessionToken({
    userId: adminId,
    tenantId: 'demo-tenant-01',
    tenantName: 'Platform Superadmin',
    businessType: 'general',
    name: adminName,
    username: 'superadmin',
    role: 'superadmin',
  });

  await setSessionCookie(token);
  redirect('/superadmin/tenants');
}

/**
 * 6. Create New Tenant Manually from Superadmin
 */
export async function createTenantManualAction(data: {
  storeName: string;
  businessType: string;
  ownerName: string;
  username: string;
  password: string;
  phone?: string;
  address?: string;
  plan: 'starter' | 'pro';
  months: number;
}) {
  const user = await requireSuperadmin();

  const tenantId = createId();
  const outletId = createId();
  const ownerId = createId();
  const passwordHash = await hashPassword(data.password);
  const preset = BUSINESS_PRESETS[data.businessType] || BUSINESS_PRESETS.general;

  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + (data.months || 1));

  // 1. Create Tenant
  await db.insert(tenants).values({
    id: tenantId,
    name: data.storeName.trim(),
    businessType: data.businessType,
    phone: data.phone?.trim() || null,
    address: data.address?.trim() || null,
    subscriptionPlan: data.plan,
    subscriptionStatus: 'active',
    subscriptionExpiresAt: expiry,
    receiptHeader: preset.receiptHeader,
    receiptFooter: preset.receiptFooter,
  });

  // 2. Create Outlet
  await db.insert(outlets).values({
    id: outletId,
    tenantId,
    name: 'Toko Utama',
    address: data.address?.trim() || null,
    phone: data.phone?.trim() || null,
    isMain: true,
  });

  // 3. Create Owner User
  await db.insert(users).values({
    id: ownerId,
    tenantId,
    outletId,
    name: data.ownerName.trim(),
    username: data.username.trim().toLowerCase(),
    passwordHash,
    role: 'owner',
    isActive: true,
  });

  // 4. Default categories
  for (const cat of preset.defaultCategories) {
    await db.insert(categories).values({
      id: createId(),
      tenantId,
      name: cat,
    });
  }

  // 5. Log Audit Event
  await db.insert(auditLogs).values({
    id: createId(),
    tenantId,
    userId: user.userId,
    userName: user.name,
    userRole: 'superadmin',
    action: 'TENANT_CREATE',
    resourceType: 'TENANT',
    resourceId: tenantId,
    reason: `Pendaftaran toko klien baru "${data.storeName}" (${data.businessType}) paket ${data.plan.toUpperCase()}`,
  });

  revalidatePath('/superadmin');
  revalidatePath('/superadmin/tenants');
  revalidatePath('/superadmin/audit');
  return { success: true };
}

/**
 * 7. Delete Tenant (Permanent Cleanup)
 */
export async function deleteTenantAction(tenantId: string) {
  await requireSuperadmin();

  await db.delete(tenants).where(eq(tenants.id, tenantId));

  revalidatePath('/superadmin');
  revalidatePath('/superadmin/tenants');
  return { success: true };
}

/**
 * 8. Billing & Financial Overview for Superadmin
 */
export async function getSuperadminBillingAction() {
  await requireSuperadmin();

  const allTenants = await db
    .select()
    .from(tenants)
    .orderBy(desc(tenants.createdAt));

  const now = new Date();

  const enriched = await Promise.all(
    allTenants.map(async (t) => {
      const owner = await db
        .select()
        .from(users)
        .where(and(eq(users.tenantId, t.id), eq(users.role, 'owner')))
        .limit(1);

      let daysLeft = 0;
      let isExpiringSoon = false;
      let isExpired = false;

      if (t.subscriptionExpiresAt) {
        const diffTime = t.subscriptionExpiresAt.getTime() - now.getTime();
        daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) {
          isExpired = true;
          daysLeft = 0;
        } else if (daysLeft <= 7) {
          isExpiringSoon = true;
        }
      }

      const planPrice =
        t.subscriptionPlan === 'ultra'
          ? 249000
          : t.subscriptionPlan === 'pro'
          ? 99000
          : 0;
      const phoneClean = (t.phone || '').replace(/[^0-9]/g, '');
      const waPhone = phoneClean.startsWith('0')
        ? '62' + phoneClean.slice(1)
        : phoneClean.startsWith('62')
        ? phoneClean
        : '62' + phoneClean;

      const waReminderMessage = `Halo Bapak/Ibu ${owner[0]?.name || 'Owner'} (${t.name}), masa aktif langganan paket ${t.subscriptionPlan?.toUpperCase()} Miegraine Anda tersisa ${daysLeft} hari lagi. Untuk kelancaran operasional kasir, silakan lakukan perpanjangan. Terima kasih!`;
      const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(waReminderMessage)}`;

      return {
        id: t.id,
        name: t.name,
        businessType: t.businessType,
        ownerName: owner[0]?.name || 'Owner',
        ownerUsername: owner[0]?.username || '-',
        phone: t.phone || '-',
        waUrl,
        subscriptionPlan: t.subscriptionPlan || 'starter',
        subscriptionStatus: t.subscriptionStatus || 'trial',
        subscriptionExpiresAt: t.subscriptionExpiresAt,
        daysLeft,
        isExpiringSoon,
        isExpired,
        planPrice,
      };
    })
  );

  const totalMRR = enriched.reduce((sum, item) => {
    if (item.subscriptionStatus === 'active' || item.subscriptionStatus === 'trial') {
      return sum + item.planPrice;
    }
    return sum;
  }, 0);

  const expiringSoonCount = enriched.filter((i) => i.isExpiringSoon).length;
  const expiredCount = enriched.filter((i) => i.isExpired || i.subscriptionStatus === 'suspended').length;
  const activeCount = enriched.filter((i) => i.subscriptionStatus === 'active').length;

  return {
    tenants: enriched,
    totalMRR,
    expiringSoonCount,
    expiredCount,
    activeCount,
  };
}

/**
 * 9. Platform Audit Logs for Superadmin
 */
export async function getSuperadminAuditLogsAction() {
  await requireSuperadmin();

  const logs = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(50);

  const enrichedLogs = await Promise.all(
    logs.map(async (l) => {
      const tenant = await db
        .select({ name: tenants.name })
        .from(tenants)
        .where(eq(tenants.id, l.tenantId))
        .limit(1);

      return {
        ...l,
        tenantName: tenant[0]?.name || 'Toko Sistem',
      };
    })
  );

  return enrichedLogs;
}

/**
 * 10. Platform Settings - Persistent via Database
 */
export async function getSuperadminSettingsAction() {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');

  const existing = await db
    .select()
    .from(platformSettings)
    .where(eq(platformSettings.id, 'global'))
    .limit(1);

  if (existing[0]) {
    return {
      starterPrice: existing[0].starterPrice,
      proPrice: existing[0].proPrice,
      supportPhone: existing[0].supportPhone || '6281234567890',
      supportEmail: existing[0].supportEmail || 'support@miegraine.id',
      trialDays: existing[0].trialDays,
      broadcastBanner: existing[0].broadcastBanner || '',
      isBroadcastActive: existing[0].isBroadcastActive,
    };
  }

  // Initial fallback if not yet initialized in database
  const initial = {
    id: 'global',
    starterPrice: 99000,
    proPrice: 199000,
    supportPhone: '6281234567890',
    supportEmail: 'support@miegraine.id',
    trialDays: 14,
    broadcastBanner: '',
    isBroadcastActive: false,
  };

  try {
    await db.insert(platformSettings).values(initial);
  } catch {
    // Ignore error if created concurrently
  }

  return {
    starterPrice: initial.starterPrice,
    proPrice: initial.proPrice,
    supportPhone: initial.supportPhone,
    supportEmail: initial.supportEmail,
    trialDays: initial.trialDays,
    broadcastBanner: initial.broadcastBanner,
    isBroadcastActive: initial.isBroadcastActive,
  };
}

export async function updateSuperadminSettingsAction(newSettings: {
  starterPrice?: number;
  proPrice?: number;
  supportPhone?: string;
  supportEmail?: string;
  trialDays?: number;
  broadcastBanner?: string;
  isBroadcastActive?: boolean;
}) {
  await requireSuperadmin();

  const current = await getSuperadminSettingsAction();
  const merged = {
    ...current,
    ...newSettings,
  };

  await db
    .insert(platformSettings)
    .values({
      id: 'global',
      starterPrice: merged.starterPrice,
      proPrice: merged.proPrice,
      supportPhone: merged.supportPhone,
      supportEmail: merged.supportEmail,
      trialDays: merged.trialDays,
      broadcastBanner: merged.broadcastBanner,
      isBroadcastActive: merged.isBroadcastActive,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: platformSettings.id,
      set: {
        starterPrice: merged.starterPrice,
        proPrice: merged.proPrice,
        supportPhone: merged.supportPhone,
        supportEmail: merged.supportEmail,
        trialDays: merged.trialDays,
        broadcastBanner: merged.broadcastBanner,
        isBroadcastActive: merged.isBroadcastActive,
        updatedAt: new Date(),
      },
    });

  revalidatePath('/superadmin');
  revalidatePath('/superadmin/settings');
  revalidatePath('/dashboard', 'layout');
  return { success: true, settings: merged };
}

