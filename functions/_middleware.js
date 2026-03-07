// /functions/_middleware.js
export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);
    const path = url.pathname;

    // ========== 1. 读取修复模式状态（从数据库） ==========
    let maintenanceMode = false;
    try {
        const modeResult = await env.DB.prepare(
            'SELECT value FROM site_config WHERE key = ?'
        ).bind('maintenance_mode').first();
        maintenanceMode = modeResult?.value === 'on';
    } catch (e) {
        // 如果数据库查询失败，记录错误但继续（默认不开启维护模式）
        console.error('读取修复模式状态失败:', e);
    }

    // ========== 2. 修复模式处理（优先级最高） ==========
    if (maintenanceMode) {
        // 放行静态资源和修复模式相关页面/API
        const isAllowedPath = (
            path === '/maintenance.html' ||                     // 修复页面本身
            path === '/maintenance' ||                     // 修复页面不带后缀
            path.startsWith('/images/') ||                       // 图片资源
            path.startsWith('/css/') ||                          // CSS 资源
            path.startsWith('/js/') ||                           // JS 资源
            path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$/i) || // 常见静态文件
            path === '/api/maintenance-login' ||                 // 修复模式专用登录 API
            path === '/api/repair-time' ||                       // 修复模式计时 API
            path.startsWith('/api/admin/maintenance/')           // 管理员切换修复模式的 API
        );

        if (isAllowedPath) {
            return await next();
        }

        // 检查当前用户是否为管理员（通过会话）
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
                if (results.length > 0 && (results[0].role === 'admin' || results[0].role === 'superadmin')) {
                    // 管理员放行，可以正常访问网站
                    return await next();
                }
            } catch (e) {
                console.error('修复模式会话检查失败:', e);
            }
        }

        // 非管理员且非放行路径，重定向到修复页面
        return new Response(null, {
            status: 302,
            headers: { Location: '/maintenance.html' }
        });
    }

    // ========== 3. 原有页面保护逻辑（仅在修复模式关闭时执行） ==========
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

    // ----- 登录检查 -----
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
