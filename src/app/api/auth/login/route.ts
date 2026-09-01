import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tenants, users, outlets } from '@/lib/db/schema';
import { signSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { verifyPassword, dummyVerifyPassword } from '@/lib/auth/password';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/auth/rate-limiter';
import { sanitizeRedirectPath } from '@/lib/utils';
import { eq, and } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = (body.username || '').toString().trim().toLowerCase();
    const password = (body.password || '').toString();
    const requestedRedirect = body.redirect?.toString();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username dan password wajib diisi.' }, { status: 400 });
    }

    const rateLimit = checkRateLimit(username);
    if (!rateLimit.isAllowed) {
      const minutesLeft = Math.ceil((rateLimit.retryAfterSeconds || 60) / 60);
      return NextResponse.json({
        success: false,
        error: `Terlalu banyak percobaan login gagal. Akun dikunci sementara selama ${minutesLeft} menit.`,
      }, { status: 429 });
    }

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

    if (matchedUsers.length === 0) {
      await dummyVerifyPassword(password);
      const attempt = recordFailedAttempt(username);
      return NextResponse.json({
        success: false,
        error: attempt.isLocked
          ? 'Percobaan login melebihi batas (5x salah). Akun dikunci sementara selama 15 menit.'
          : 'Username atau password tidak sesuai.',
      }, { status: 401 });
    }

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
      return NextResponse.json({
        success: false,
        error: attempt.isLocked
          ? 'Percobaan login melebihi batas (5x salah). Akun dikunci sementara selama 15 menit.'
          : `Password salah. Sisa percobaan: ${attempt.attemptsLeft}x sebelum akun dikunci.`,
      }, { status: 401 });
    }

    resetRateLimit(username);

    const { user, tenant, outlet } = authenticatedCandidate;
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

    const defaultDestination =
      user.role === 'superadmin'
        ? '/superadmin'
        : user.role === 'cashier'
        ? '/dashboard/pos'
        : '/dashboard';

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

    const response = NextResponse.json({ success: true, redirectTo: targetDestination });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal memproses login.';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
