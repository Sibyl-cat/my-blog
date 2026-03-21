// /functions/api/user/me.js
import { getCurrentUserId } from '../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;

    const userId = await getCurrentUserId(request, env);
    if (!userId) {
        return new Response(JSON.stringify({ error: '未登录' }), { status: 401 });
    }

    const { results } = await env.DB.prepare(
        'SELECT username, role, created_at FROM users WHERE id = ?'
    ).bind(userId).all();

    if (results.length === 0) {
        return new Response(JSON.stringify({ error: '用户不存在' }), { status: 404 });
    }

    return new Response(JSON.stringify(results[0]), {
        headers: { 'Content-Type': 'application/json' }
    });
}
