import { getCurrentUserId } from '../../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const adminId = await getCurrentUserId(request, env);
    if (!adminId) {
        return new Response(JSON.stringify({ error: '未登录' }), { status: 401 });
    }

    const { results: adminCheck } = await env.DB.prepare(
        'SELECT role FROM users WHERE id = ?'
    ).bind(adminId).all();
    if (adminCheck[0]?.role !== 'admin') {
        return new Response(JSON.stringify({ error: '无权操作' }), { status: 403 });
    }

    const { targetUserId, active } = await request.json();
    if (!targetUserId) {
        return new Response(JSON.stringify({ error: '参数不足' }), { status: 400 });
    }

    // 禁止禁用超级管理员（可选）
    const { results: targetUser } = await env.DB.prepare(
        'SELECT role FROM users WHERE id = ?'
    ).bind(targetUserId).all();
    if (targetUser.length && targetUser[0].role === 'superadmin') {
        return new Response(JSON.stringify({ error: '不能禁用超级管理员' }), { status: 403 });
    }

    await env.DB.prepare(
        'UPDATE users SET is_active = ? WHERE id = ?'
    ).bind(active ? 1 : 0, targetUserId).run();

    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
