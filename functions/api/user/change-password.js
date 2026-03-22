import { getCurrentUserId, verifyPassword, hashPassword } from '../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const userId = await getCurrentUserId(request, env);
    if (!userId) {
        return new Response(JSON.stringify({ error: '未登录' }), { status: 401 });
    }

    try {
        const { oldPassword, newPassword } = await request.json();
        if (!oldPassword || !newPassword) {
            return new Response(JSON.stringify({ error: '密码不能为空' }), { status: 400 });
        }
        if (newPassword.length < 6) {
            return new Response(JSON.stringify({ error: '新密码长度至少6位' }), { status: 400 });
        }

        // 获取当前用户信息（包括盐和哈希）
        const { results } = await env.DB.prepare(
            'SELECT password_hash, salt FROM users WHERE id = ?'
        ).bind(userId).all();
        if (results.length === 0) {
            return new Response(JSON.stringify({ error: '用户不存在' }), { status: 404 });
        }
        const user = results[0];

        // 验证旧密码
        const isValid = await verifyPassword(oldPassword, user.salt, user.password_hash);
        if (!isValid) {
            return new Response(JSON.stringify({ error: '当前密码错误' }), { status: 401 });
        }

        // 生成新密码哈希和盐
        const { salt, hash } = await hashPassword(newPassword);
        await env.DB.prepare(
            'UPDATE users SET password_hash = ?, salt = ? WHERE id = ?'
        ).bind(hash, salt, userId).run();

        // 可选：清除该用户的所有会话，强制重新登录
        await env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(userId).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('修改密码失败:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
