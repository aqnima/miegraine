import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  'miegraine-saas-enterprise-secret-key-32chars-min!!'
);

const SESSION_COOKIE_NAME = '__miegraine_session';

export async function onRequestGet(context: any) {
  try {
    const { request } = context;
    const cookieHeader = request.headers.get('Cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split(';').map((c: string) => {
        const [key, ...v] = c.trim().split('=');
        return [key, v.join('=')];
      })
    );

    const token = cookies[SESSION_COOKIE_NAME];
    if (!token) {
      return new Response(JSON.stringify({ user: null }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return new Response(JSON.stringify({ user: payload }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ user: null }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
