// /functions/api/login.js
import { verifyPassword, cleanUserSessions } from './utils/auth';

export async function onRequest(context) {
    const { request, env } = context;

    // 仅允许 POST 请求
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { username, password } = await request.json();

        // 查询用户信息（包括密码哈希、盐和角色）
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

        // 验证密码
        const isValid = await verifyPassword(password, user.salt, user.password_hash);
        if (!isValid) {
            return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 创建会话
        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天有效期
        const now = new Date().toISOString(); // 用于 created_at

        // 将会话存入数据库（包含用户角色和创建时间）
        await env.DB.prepare(
            'INSERT INTO sessions (id, user_id, role, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
        ).bind(sessionId, user.id, user.role, expiresAt.toISOString(), now).run();

        // 清理多余会话，只保留最新的3个
        await cleanUserSessions(env, user.id, 3);

        // 设置 Cookie
        const headers = new Headers({
            'Set-Cookie': `session_id=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`,
            'Content-Type': 'application/json'
        });

        return new Response(JSON.stringify({ success: true }), { headers });
    } catch (error) {
        // 记录错误日志（可通过 wrangler tail 查看）
        console.error('Login error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
