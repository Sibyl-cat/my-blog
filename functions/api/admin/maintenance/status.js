import { getCurrentUserId } from '../../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;

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

    const modeResult = await env.DB.prepare(
        'SELECT value FROM site_config WHERE key = ?'
    ).bind('maintenance_mode').first();
    const startResult = await env.DB.prepare(
        'SELECT value FROM site_config WHERE key = ?'
    ).bind('maintenance_start_time').first();

    return new Response(JSON.stringify({
        enabled: modeResult?.value === 'on',
        startTime: parseInt(startResult?.value || '0')
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
