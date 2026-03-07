import { getCurrentUserId } from '../../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const userId = await getCurrentUserId(request, env);
    if (!userId) {
        return new Response(JSON.stringify({ error: '未登录' }), { status: 401 });
    }

    const { results: userResults } = await env.DB.prepare(
        'SELECT role FROM users WHERE id = ?'
    ).bind(userId).all();
    const role = userResults[0]?.role;
    if (role !== 'admin' && role !== 'superadmin') {
        return new Response(JSON.stringify({ error: '无权访问' }), { status: 403 });
    }

    const { enable } = await request.json();
    const now = Math.floor(Date.now() / 1000);

    if (enable) {
        await env.DB.prepare(
            'UPDATE site_config SET value = ? WHERE key = ?'
        ).bind('on', 'maintenance_mode').run();
        await env.DB.prepare(
            'UPDATE site_config SET value = ? WHERE key = ?'
        ).bind(now.toString(), 'maintenance_start_time').run();
    } else {
        await env.DB.prepare(
            'UPDATE site_config SET value = ? WHERE key = ?'
        ).bind('off', 'maintenance_mode').run();
    }

    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
