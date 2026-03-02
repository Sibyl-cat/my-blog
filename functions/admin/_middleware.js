// /functions/admin/_middleware.js
export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);

    // 放行登录页和注册页
    if (url.pathname === '/admin/login.html' || url.pathname === '/admin/login' || url.pathname === '/register.html') {
        return await next();
    }

    // 需要保护的页面：/admin/* 下的所有路径 + 根目录的 /users.html 和 /users
    const isProtectedPage = url.pathname.startsWith('/admin/') || 
                            url.pathname === '/users.html' || 
                            url.pathname === '/users';
    if (!isProtectedPage) {
        return await next(); // 其他页面（如首页）直接放行
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
        return new Response(null, {
            status: 302,
            headers: { Location: '/admin/login.html' }
        });
    }

    // 查询会话（包括角色）
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

    // ⭐ 仅对 /users.html 和 /users 进行管理员角色检查
    if (url.pathname === '/users.html' || url.pathname === '/users') {
        if (role !== 'admin') {
            return new Response(null, {
                status: 302,
                headers: { Location: '/admin/login.html' } // 非管理员重定向到登录页
            });
        }
    }

    // 其他受保护页面（如 /admin.html）仅需登录，无需角色检查
    return await next();
}
