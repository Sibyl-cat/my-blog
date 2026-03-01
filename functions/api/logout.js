// /functions/api/logout.js
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => {
      const [key, value] = c.split('=');
      return [key, value];
    })
  );
  const sessionId = cookies.session_id;

  if (sessionId) {
    // 从数据库删除会话
    await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
  }

  // 清除 Cookie
  const headers = new Headers({
    'Set-Cookie': 'session_id=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
    'Content-Type': 'application/json'
  });

  return new Response(JSON.stringify({ success: true }), { headers });
}
