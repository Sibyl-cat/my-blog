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
        console.error('读取修复模式状态失败:', e);
    }

    // ========== 2. 修复模式处理（优先级最高） ==========
    if (maintenanceMode) {
        // 放行静态资源和修复模式相关页面/API
        const isAllowedPath = (
            path === '/maintenance.html' ||
            path === '/maintenance' ||
            path.startsWith('/images/') ||
            path.startsWith('/css/') ||
            path.startsWith('/js/') ||
            path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$/i) ||
            path === '/api/maintenance-login' ||
            path === '/api/repair-time' ||
            path.startsWith('/api/admin/maintenance/')
        );

        if (isAllowedPath) {
            return await next();
        }

        // 检查当前用户是否为管理员
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
                    return await next();
                }
            } catch (e) {
                console.error('修复模式会话检查失败:', e);
            }
        }

        return new Response(null, {
            status: 302,
            headers: { Location: '/maintenance.html' }
        });
    }

    // ========== 3. 日志记录（异步，不阻塞） ==========
    // 注意：仅记录非静态资源请求，避免过多日志
    const shouldLog = !path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$/i) &&
                      !path.startsWith('/images/') &&
                      path !== '/favicon.ico';
    if (shouldLog) {
        // 异步执行，不等待
        context.waitUntil((async () => {
            try {
                // 获取地理位置信息
                const country = request.headers.get('CF-IPCountry') || 'unknown';
                const region = request.headers.get('CF-Region') || '';
                const city = request.headers.get('CF-City') || '';
                const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || '';

                // 获取用户 ID（如果已登录）
                let userId = null;
                const cookieHeader = request.headers.get('Cookie') || '';
                const cookies = Object.fromEntries(
                    cookieHeader.split('; ').map(c => {
                        const [key, value] = c.split('=');
                        return [key, value];
                    })
                );
                const sessionId = cookies.session_id;
                if (sessionId) {
                    const { results } = await env.DB.prepare(
                        'SELECT user_id FROM sessions WHERE id = ? AND expires_at > ?'
                    ).bind(sessionId, new Date().toISOString()).all();
                    if (results.length) userId = results[0].user_id;
                }

                await env.DB.prepare(`
                    INSERT INTO access_logs (path, method, ip, country, region, city, user_agent, referer, user_id, session_id)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
                    path,
                    request.method,
                    ip,
                    country,
                    region,
                    city,
                    request.headers.get('User-Agent') || '',
                    request.headers.get('Referer') || '',
                    userId,
                    sessionId
                ).run();
            } catch (e) {
                console.error('日志记录失败:', e);
            }
        })());
    }

    // ========== 4. 原有页面保护逻辑 ==========
    // 放行登录页和注册页
    if (path === '/admin/login.html' ||
        path === '/admin/login' ||
        path === '/register.html') {
        return await next();
    }

    // 需要保护的页面列表
    const isProtectedPage =
        path === '/admin.html' ||
        path === '/admin' ||
        path === '/editor.html' ||
        path === '/editor' ||
        path.startsWith('/admin/') ||
        path === '/users.html' ||
        path === '/users' ||
        path === '/profile.html' ||
        path === '/change-password.html';

    if (!isProtectedPage) {
        return await next();
    }

    // 登录检查
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

    // 管理员页面权限检查
    if (path === '/users.html' || path === '/users') {
        if (role !== 'admin') {
            return new Response(null, {
                status: 302,
                headers: { Location: '/admin/login.html' }
            });
        }
    }

    return await next();
}
