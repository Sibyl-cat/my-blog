// /functions/admin/_middleware.js
export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);
  
  // 1. 如果是登录页，直接放行（不检查会话）
  if (url.pathname === '/admin/login.html') {
    return await next();
  }


  // 获取 Cookie
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => {
      const [key, value] = c.split('=');
      return [key, value];
    })
  );
  const sessionId = cookies.session_id;

  if (!sessionId) {
    // 未登录，重定向到登录页
    return new Response(null, {
      status: 302,
      headers: { Location: '/admin/login.html' }
    });
  }

  // 验证会话是否有效
  const { results } = await env.DB.prepare(
    'SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?'
  ).bind(sessionId, new Date().toISOString()).all();

  if (results.length === 0) {
    // 会话无效或过期，重定向到登录页
    return new Response(null, {
      status: 302,
      headers: { Location: '/admin/login.html' }
    });
  }

  // 会话有效，继续处理请求
  return await next();
}
