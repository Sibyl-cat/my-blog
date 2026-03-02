// /functions/admin/_middleware.js
export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);

    // 放行登录页和注册页（这些页面不需要保护）
    if (url.pathname === '/admin/login.html' || url.pathname === '/admin/login' || url.pathname === '/register.html') {
        return await next();
    }

    // 需要保护的页面列表：/admin/* 下的所有页面 + 根目录下的 /users.html
    const isProtectedPage = url.pathname.startsWith('/admin/') || url.pathname === '/users.html';
    if (!isProtectedPage) {
        // 如果不是受保护页面，直接放行（如首页、文章页等）
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

    // 未登录 → 重定向到登录页
    if (!sessionId) {
        return new Response(null, {
            status: 302,
            headers: { Location: '/admin/login.html' }
        });
    }

    // 验证会话
    const { results } = await env.DB.prepare(
        'SELECT user_id, role FROM sessions WHERE id = ? AND expires_at > ?'
    ).bind(sessionId, new Date().toISOString()).all();

    if (results.length === 0) {
        return new Response(null, {
            status: 302,
            headers: { Location: '/admin/login.html' }
        });
    }

    const { role } = results[0];

    // 对特定页面进行角色权限检查
    if (url.pathname === '/admin.html' || url.pathname === '/users.html') {
        if (role !== 'admin') {
            // 非管理员重定向到登录页（或首页）
            return new Response(null, {
                status: 302,
                headers: { Location: '/admin/login.html' }
            });
        }
    }

    // 其他受保护页面仅需登录，无需额外角色
    return await next();
}
