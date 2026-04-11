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

    // 检查操作者是否为管理员
    const { results: adminCheck } = await env.DB.prepare(
        'SELECT role FROM users WHERE id = ?'
    ).bind(adminId).all();
    if (adminCheck[0]?.role !== 'admin') {
        return new Response(JSON.stringify({ error: '无权操作' }), { status: 403 });
    }

    const { targetUserId, newRole } = await request.json();
    if (!targetUserId || !newRole) {
        return new Response(JSON.stringify({ error: '参数不足' }), { status: 400 });
    }

    // 获取目标用户信息
    const { results: targetUser } = await env.DB.prepare(
        'SELECT role FROM users WHERE id = ?'
    ).bind(targetUserId).all();
    if (targetUser.length === 0) {
        return new Response(JSON.stringify({ error: '用户不存在' }), { status: 404 });
    }

    // 禁止修改超级管理员角色
    if (targetUser[0].role === 'superadmin') {
        return new Response(JSON.stringify({ error: '不能修改超级管理员角色' }), { status: 403 });
    }

    // 新角色只能是 user 或 admin
    if (!['user', 'admin'].includes(newRole)) {
        return new Response(JSON.stringify({ error: '无效角色' }), { status: 400 });
    }

    await env.DB.prepare(
        'UPDATE users SET role = ? WHERE id = ?'
    ).bind(newRole, targetUserId).run();

    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
