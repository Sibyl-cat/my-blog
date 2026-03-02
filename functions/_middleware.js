// /functions/_middleware.js
export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);

    // 放行登录页和注册页（无需任何检查）
    if (url.pathname === '/admin/login.html' || 
        url.pathname === '/admin/login' || 
        url.pathname === '/register.html') {
        return await next();
    }

    // 需要保护的页面列表（任何登录用户可访问）
    const isProtectedPage = 
        url.pathname === '/admin.html' ||
        url.pathname === '/admin' ||                  // 文章管理页
        url.pathname.startsWith('/admin/') ||             // 其他 admin 子路径
        url.pathname === '/users.html' ||                 // 用户管理页
        url.pathname === '/users';                         // 可能的用户管理页别名

    if (!isProtectedPage) {
        // 非保护页面直接放行（如首页、文章页等）
        return await next();
    }

    // ----- 以下为登录检查 -----
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

    // 查询会话有效性及角色
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

    // ----- 管理员页面权限检查（仅 /users.html 和 /users 需要 admin 角色）-----
    if (url.pathname === '/users.html' || url.pathname === '/users') {
        if (role !== 'admin') {
            // 非管理员重定向到登录页（或首页）
            return new Response(null, {
                status: 302,
                headers: { Location: '/admin/login.html' }
            });
        }
    }

    // 其他受保护页面（如 /admin.html）仅需登录，无需额外角色
    return await next();
}
