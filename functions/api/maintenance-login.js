// /functions/api/maintenance-login.js
import { hashPassword } from '../utils/auth'; // 假设 hashPassword 用于验证，实际上验证密码需要 verifyPassword，这里需要导入 verifyPassword
// 通常 auth.js 中应包含 verifyPassword 函数，我们假设已存在

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { username, password } = await request.json();

        // 查询用户
        const { results } = await env.DB.prepare(
            'SELECT id, password_hash, salt, role FROM users WHERE username = ?'
        ).bind(username).all();

        if (results.length === 0) {
            return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const user = results[0];

        // 验证密码（假设你有 verifyPassword 函数）
        // 这里需要引入 verifyPassword，如果没有，可以复用之前定义的
        const { verifyPassword } = await import('../utils/auth'); // 或者直接包含验证逻辑
        const isValid = await verifyPassword(password, user.salt, user.password_hash);

        if (!isValid) {
            return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 检查角色是否为 admin
        if (user.role !== 'admin') {
            return new Response(JSON.stringify({ error: '仅管理员可登录' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 创建会话（复用现有会话机制）
        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天

        await env.DB.prepare(
            'INSERT INTO sessions (id, user_id, role, expires_at) VALUES (?, ?, ?, ?)'
        ).bind(sessionId, user.id, user.role, expiresAt.toISOString()).run();

        // 设置 Cookie
        const headers = new Headers({
            'Set-Cookie': `session_id=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`,
            'Content-Type': 'application/json'
        });

        return new Response(JSON.stringify({ success: true }), { headers });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
