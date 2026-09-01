import { SignJWT } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  'miegraine-saas-enterprise-secret-key-32chars-min!!'
);

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const username = (body.username || '').toString().trim().toLowerCase();
    const password = (body.password || '').toString();
    const requestedRedirect = body.redirect?.toString();

    if (!username || !password) {
      return new Response(JSON.stringify({ success: false, error: 'Username dan password wajib diisi.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let authenticatedUser: any = null;

    // 1. Check Cloudflare D1 Database Binding
    if (env && env.DB) {
      try {
        const { results } = await env.DB.prepare(
          `SELECT u.id, u.tenant_id as tenantId, u.outlet_id as outletId, u.name, u.username, u.password_hash as passwordHash, u.role, u.is_active as isActive,
                  t.name as tenantName, t.business_type as businessType,
                  o.name as outletName
           FROM users u
           JOIN tenants t ON u.tenant_id = t.id
           LEFT JOIN outlets o ON u.outlet_id = o.id
           WHERE u.username = ? AND u.is_active = 1`
        ).bind(username).all();

        if (results && results.length > 0) {
          for (const candidate of results) {
            const isMatch = await verifyPassword(password, candidate.passwordHash);
            if (isMatch) {
              authenticatedUser = candidate;
              break;
            }
          }
        }
      } catch (dbErr) {
        console.error('D1 Database query error:', dbErr);
      }
    }

    // 2. Built-in Demo accounts instant verification
    if (!authenticatedUser) {
      if (
        (username === 'owner' && (password === 'admin123' || password === '12345678')) ||
        (username === 'kasir' && (password === '123456' || password === '12345678')) ||
        (username === 'admin' && (password === '123456' || password === '12345678')) ||
        (username === 'superadmin' && (password === 'superadmin123' || password === '12345678'))
      ) {
        const role = username === 'superadmin' ? 'superadmin' : username === 'kasir' ? 'cashier' : username === 'admin' ? 'admin' : 'owner';
        authenticatedUser = {
          id: `demo_${username}`,
          tenantId: 'tenant_demo_1',
          tenantName: 'Toko Mie Graine Demo',
          businessType: 'fnb',
          name: username === 'owner' ? 'Owner Bos Besar' : username === 'kasir' ? 'Kasir Utama' : username === 'admin' ? 'Admin Toko' : 'Superadmin',
          username,
          role,
          outletId: 'outlet_demo_1',
          outletName: 'Outlet Utama',
        };
      }
    }

    if (!authenticatedUser) {
      return new Response(JSON.stringify({ success: false, error: 'Username atau password tidak sesuai.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Sign Jose JWT Token
    const token = await new SignJWT({
      userId: authenticatedUser.id,
      tenantId: authenticatedUser.tenantId,
      tenantName: authenticatedUser.tenantName,
      businessType: authenticatedUser.businessType,
      name: authenticatedUser.name,
      username: authenticatedUser.username,
      role: authenticatedUser.role,
      outletId: authenticatedUser.outletId,
      outletName: authenticatedUser.outletName,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    const defaultDestination =
      authenticatedUser.role === 'superadmin'
        ? '/superadmin'
        : authenticatedUser.role === 'cashier'
        ? '/dashboard/pos'
        : '/dashboard';

    const redirectTo = requestedRedirect || defaultDestination;

    return new Response(
      JSON.stringify({ success: true, redirectTo }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `__miegraine_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
        },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err?.message || 'Gagal memproses login.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash) return false;
  if (!storedHash.includes(':')) return password === storedHash;
  const [saltHex, keyHex] = storedHash.split(':');
  const salt = new Uint8Array(saltHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  const derivedHex = Array.from(new Uint8Array(derivedBits))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return derivedHex === keyHex;
}
