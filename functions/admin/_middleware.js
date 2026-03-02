// /functions/admin/_middleware.js
export async function onRequest(context) {
    const { request, env, next } = context;
    const url = new URL(request.url);

    // 放行登录页和注册页
    if (url.pathname === '/admin/login.html' || url.pathname === '/admin/login' || url.pathname === '/register.html') {
        return await next();
    }

    
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

        const { role } = results[0];

        // 权限检查：只有 admin 可以访问 users.html
        if (url.pathname === '/users' || url.pathname === '/users.html') 
    {
            if (role !== 'admin') {
                // 普通用户重定向到登录页
                return new Response(null, {
                    status: 302,
                    headers: { Location: 'admin/login.html' }
                });
            }
        }

        // 其他 /admin/* 资源（如 API）由各自处理，这里仅确保登录
        return await next();
    }
