// /functions/admin/_middleware.js
export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);

    // 放行登录页和注册页
    if (url.pathname === '/admin/login.html' || url.pathname === '/admin/login' || url.pathname === '/register.html') {
        return await next();
    }

    // 需要保护的页面：所有 /admin/* 路径以及 /users.html
    if (url.pathname.startsWith('/admin/') || url.pathname === '/users.html') {
        // 获取 Cookie 中的 session_id
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

        const { user_id: userId, role } = results[0];

        // 权限检查：只有 admin 可以访问 admin.html 和 users.html
        if (url.pathname === '/admin.html' || url.pathname === '/users.html') {
            if (role !== 'admin') {
                // 普通用户重定向到首页
                return new Response(null, {
                    status: 302,
                    headers: { Location: '/' }
                });
            }
        }

        // 其他 /admin/* 资源（如 API）由各自处理，这里仅确保登录
        return await next();
    }

    // 其他路径不处理
    return await next();
}