import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export interface UserSessionPayload {
  userId: string;
  tenantId: string;
  tenantName: string;
  businessType: string;
  name: string;
  username: string;
  role: 'owner' | 'admin' | 'cashier' | 'superadmin';
  outletId?: string;
  outletName?: string;
  isImpersonating?: boolean;
  originalRole?: string;
  originalUserId?: string;
  originalName?: string;
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'miegraine-saas-enterprise-secret-key-32chars-min!!'
);

export const SESSION_COOKIE_NAME = '__miegraine_session';

export async function signSessionToken(payload: UserSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserSessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<UserSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
