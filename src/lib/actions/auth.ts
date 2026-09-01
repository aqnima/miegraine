'use server';

import { db } from '@/lib/db';
import { tenants, users, outlets, categories } from '@/lib/db/schema';
import {
  setSessionCookie,
  signSessionToken,
  clearSessionCookie,
} from '@/lib/auth/session';
import { hashPassword, verifyPassword, validatePasswordStrength, dummyVerifyPassword } from '@/lib/auth/password';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/auth/rate-limiter';
import { BUSINESS_PRESETS } from '@/lib/constants/business-presets';
import { sanitizeRedirectPath } from '@/lib/utils';
import { createId } from '@paralleldrive/cuid2';
import { eq, and } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export interface ActionResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

/**
 * 1. Register New Tenant & Master Admin Account
 */
export async function registerTenantAction(formData: FormData): Promise<ActionResult> {
  try {
    const storeName = formData.get('storeName')?.toString().trim();
    const businessType = formData.get('businessType')?.toString().trim() || 'general';
    const ownerName = formData.get('ownerName')?.toString().trim();
    const username = formData.get('username')?.toString().trim().toLowerCase();
    const password = formData.get('password')?.toString();
    const phone = formData.get('phone')?.toString().trim();
    const address = formData.get('address')?.toString().trim();

    if (!storeName || !ownerName || !username || !password) {
      return { success: false, error: 'Semua field wajib diisi lengkap.' };
    }

    if (username.length < 3) {
      return { success: false, error: 'Username minimal 3 karakter.' };
    }

    // Password strength check (Min 8 chars, alphanumeric)
    const pwdCheck = validatePasswordStrength(password);
    if (!pwdCheck.valid) {
      return { success: false, error: pwdCheck.message || 'Password tidak memenuhi standar keamanan.' };
    }

    // Prevent duplicate global owner username
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: `Username "${username}" sudah digunakan. Silakan pilih username lain.` };
    }

    const preset = BUSINESS_PRESETS[businessType] || BUSINESS_PRESETS.general;
    const tenantId = createId();
    const outletId = createId();
    const ownerId = createId();
    const passwordHash = await hashPassword(password);

    const trialExpiry = new Date();
    trialExpiry.setDate(trialExpiry.getDate() + 14);

    // 1. Create Tenant
    await db.insert(tenants).values({
      id: tenantId,
      name: storeName,
      businessType,
      phone,
      address,
      receiptHeader: preset.receiptHeader,
      receiptFooter: preset.receiptFooter,
      subscriptionPlan: 'starter',
      subscriptionStatus: 'trial',
      subscriptionExpiresAt: trialExpiry,
      trialEndsAt: trialExpiry,
    });

    // 2. Create Default Main Outlet
    await db.insert(outlets).values({
      id: outletId,
      tenantId,
      name: 'Toko Utama',
      address,
      phone,
      isMain: true,
    });

    // 3. Create Owner User
    await db.insert(users).values({
      id: ownerId,
      tenantId,
      outletId,
      name: ownerName,
      username,
      passwordHash,
      role: 'owner',
      isActive: true,
    });

    // 4. Populate Default Categories from Business Preset
    for (const catName of preset.defaultCategories) {
      await db.insert(categories).values({
        id: createId(),
        tenantId,
        name: catName,
      });
    }

    // 5. Create Ready-to-use Admin & Cashier Accounts
    const demoPasswordHash = await hashPassword('12345678');
    await db.insert(users).values({
      id: createId(),
      tenantId,
      outletId,
      name: 'Admin Cabang',
      username: `${username}_admin`,
      passwordHash: demoPasswordHash,
      role: 'admin',
      isActive: true,
    });

    await db.insert(users).values({
      id: createId(),
      tenantId,
      outletId,
      name: 'Kasir Utama',
      username: `${username}_kasir`,
      passwordHash: demoPasswordHash,
      role: 'cashier',
      isActive: true,
    });

    // 6. Sign Session & Set Cookie
    const token = await signSessionToken({
      userId: ownerId,
      tenantId,
      tenantName: storeName,
      businessType,
      name: ownerName,
      username,
      role: 'owner',
      outletId,
      outletName: 'Toko Utama',
    });

    await setSessionCookie(token);

    return { success: true, redirectTo: '/dashboard' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem.';
    return { success: false, error: errorMsg };
  }
}

/**
 * 2. Login User (Owner, Admin, or Cashier) with Rate Limiting & Multi-Tenant Resolving
 */
export async function loginAction(formData: FormData): Promise<ActionResult> {
  try {
    const username = formData.get('username')?.toString().trim().toLowerCase();
    const password = formData.get('password')?.toString();

    if (!username || !password) {
      return { success: false, error: 'Username dan password wajib diisi.' };
    }

    // 1. Check Rate Limiter (Brute force protection)
    const rateLimit = checkRateLimit(username);
    if (!rateLimit.isAllowed) {
      const minutesLeft = Math.ceil((rateLimit.retryAfterSeconds || 60) / 60);
      return {
        success: false,
        error: `Terlalu banyak percobaan login gagal. Akun/IP dikunci sementara selama ${minutesLeft} menit untuk keamanan.`,
      };
    }

    // 2. Query candidates by username
    let matchedUsers = await db
      .select({
        user: users,
        tenant: tenants,
        outlet: outlets,
      })
      .from(users)
      .innerJoin(tenants, eq(users.tenantId, tenants.id))
      .leftJoin(outlets, eq(users.outletId, outlets.id))
      .where(and(eq(users.username, username), eq(users.isActive, true)));

    // Auto-seed demo accounts on first demo login attempt
    if (matchedUsers.length === 0 && (username === 'owner' || username === 'kasir' || username === 'admin' || username === 'superadmin')) {
      const { seedDemoData } = await import('@/lib/db/seed');
      await seedDemoData();

      matchedUsers = await db
        .select({
          user: users,
          tenant: tenants,
          outlet: outlets,
        })
        .from(users)
        .innerJoin(tenants, eq(users.tenantId, tenants.id))
        .leftJoin(outlets, eq(users.outletId, outlets.id))
        .where(and(eq(users.username, username), eq(users.isActive, true)));
    }

    const requestedRedirect = formData.get('redirect')?.toString();

    if (matchedUsers.length === 0) {
      // Constant-time execution to protect against timing attack / user enumeration
      await dummyVerifyPassword(password);
      const attempt = recordFailedAttempt(username);
      if (attempt.isLocked) {
        return {
          success: false,
          error: 'Percobaan login melebihi batas (5x salah). Akun dikunci sementara selama 15 menit.',
        };
      }
      return { success: false, error: 'Username atau password tidak sesuai.' };
    }

    // 3. Multi-Tenant Password Verification (Find matching tenant candidate)
    let authenticatedCandidate = null;

    for (const candidate of matchedUsers) {
      const isMatch = await verifyPassword(password, candidate.user.passwordHash);
      if (isMatch) {
        authenticatedCandidate = candidate;
        break;
      }
    }

    if (!authenticatedCandidate) {
      const attempt = recordFailedAttempt(username);
      if (attempt.isLocked) {
        return {
          success: false,
          error: 'Percobaan login melebihi batas (5x salah). Akun dikunci sementara selama 15 menit.',
        };
      }
      return {
        success: false,
        error: `Password salah. Sisa percobaan: ${attempt.attemptsLeft}x sebelum akun dikunci.`,
      };
    }

    // Reset rate limit on success
    resetRateLimit(username);

    const { user, tenant, outlet } = authenticatedCandidate;

    // 4. Sign Session
    const token = await signSessionToken({
      userId: user.id,
      tenantId: tenant.id,
      tenantName: tenant.name,
      businessType: tenant.businessType,
      name: user.name,
      username: user.username,
      role: user.role,
      outletId: outlet?.id || undefined,
      outletName: outlet?.name || 'Toko Utama',
    });

    await setSessionCookie(token);

    // Redirect based on RBAC role or sanitized requested redirect
    const defaultDestination =
      user.role === 'superadmin'
        ? '/superadmin'
        : user.role === 'cashier'
        ? '/dashboard/pos'
        : '/dashboard';

    // If requestedRedirect exists and is appropriate for the role, sanitize it
    let targetDestination = defaultDestination;
    if (requestedRedirect) {
      const sanitized = sanitizeRedirectPath(requestedRedirect, defaultDestination);
      if (user.role === 'cashier' && !sanitized.startsWith('/dashboard/pos')) {
        targetDestination = '/dashboard/pos';
      } else if (user.role !== 'superadmin' && sanitized.startsWith('/superadmin')) {
        targetDestination = '/dashboard';
      } else {
        targetDestination = sanitized;
      }
    }

    return { success: true, redirectTo: targetDestination };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal memproses login.';
    return { success: false, error: errorMsg };
  }
}

/**
 * 3. Logout Action
 */
export async function logoutAction() {
  await clearSessionCookie();
  redirect('/login');
}
