// /functions/api/maintenance-login.js
import { verifyPassword } from '../../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { username, password } = await request.json();

        const { results } = await env.DB.prepare(
            'SELECT id, password_hash, salt, role FROM users WHERE username = ?'
        ).bind(username).all();

        if (results.length === 0) {
            return new Response(JSON.stringify({ error: '用户名或密码错误' }), { status: 401 });
        }

        const user = results[0];

        const isValid = await verifyPassword(password, user.salt, user.password_hash);
        if (!isValid) {
            return new Response(JSON.stringify({ error: '用户名或密码错误' }), { status: 401 });
        }

        if (user.role !== 'admin') {
            return new Response(JSON.stringify({ error: '仅管理员可登录' }), { status: 403 });
        }

        const sessionId = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await env.DB.prepare(
            'INSERT INTO sessions (id, user_id, role, expires_at) VALUES (?, ?, ?, ?)'
        ).bind(sessionId, user.id, user.role, expiresAt.toISOString()).run();

        const headers = new Headers({
            'Set-Cookie': `session_id=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`,
            'Content-Type': 'application/json'
        });

        return new Response(JSON.stringify({ success: true }), { headers });
    } catch (error) {
        console.error('Maintenance login error:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
