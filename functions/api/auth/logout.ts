export async function onRequestPost() {
  return new Response(JSON.stringify({ success: true, redirectTo: '/login' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `__miegraine_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
    },
  });
}
