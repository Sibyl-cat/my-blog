// /functions/_middleware.js
export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);
    const path = url.pathname;

    // ========== 修复模式检查（优先级最高） ==========
    const maintenanceMode = env.MAINTENANCE_MODE === 'on';
    if (maintenanceMode) {
        // 放行修复页面本身和静态资源
        const isStaticAsset = 
            path === '/maintenance.html' ||
            path.startsWith('/images/') ||
            path.startsWith('/css/') ||
            path.startsWith('/js/') ||
            path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$/i);
        if (isStaticAsset) {
            return await next();
        }

        // 放行修复模式专用登录 API
        if (path === '/api/maintenance-login' || path === '/api/repair-time') {
            return await next();
        }

        // 检查用户是否已登录且为 admin（复用现有会话）
        const cookieHeader = request.headers.get('Cookie') || '';
        const cookies = Object.fromEntries(
            cookieHeader.split('; ').map(c => {
                const [key, value] = c.split('=');
                return [key, value];
            })
        );
        const sessionId = cookies.session_id;

        if (sessionId) {
            try {
                const { results } = await env.DB.prepare(
                    'SELECT role FROM sessions WHERE id = ? AND expires_at > ?'
                ).bind(sessionId, new Date().toISOString()).all();
                if (results.length > 0 && results[0].role === 'admin') {
                    // 管理员登录，放行（允许访问所有页面）
                    return await next();
                }
            } catch (e) {
                console.error('修复模式会话检查失败:', e);
            }
        }

        // 其他所有请求重定向到修复页面
        return new Response(null, {
            status: 302,
            headers: { Location: '/maintenance.html' }
        });
    }

    // ========== 以下为原有页面保护逻辑 ==========
    // 放行登录页和注册页（无需任何检查）
    if (path === '/admin/login.html' || 
        path === '/admin/login' || 
        path === '/register.html') {
        return await next();
    }

    // 需要保护的页面列表（任何登录用户可访问）
    const isProtectedPage = 
        path === '/admin.html' ||
        path === '/admin' ||                  // 文章管理页
        path.startsWith('/admin/') ||          // 其他 admin 子路径
        path === '/users.html' ||              // 用户管理页
        path === '/users';                      // 可能的用户管理页别名

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
    if (path === '/users.html' || path === '/users') {
        if (role !== 'admin') {
            // 非管理员重定向到登录页
            return new Response(null, {
                status: 302,
                headers: { Location: '/admin/login.html' }
            });
        }
    }

    // 其他受保护页面（如 /admin.html）仅需登录，无需额外角色
    return await next();
}
