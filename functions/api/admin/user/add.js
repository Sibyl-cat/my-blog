import { getCurrentUserId } from '../../utils/auth';
import { hashPassword } from '../../utils/auth'; // 假设 hashPassword 也在 auth.js 中

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
        const { username, password } = await request.json();

        if (!username || !password) {
            return new Response(JSON.stringify({ error: '用户名和密码不能为空' }), { status: 400 });
        }

        // 检查用户名是否已存在
        const { results } = await env.DB.prepare(
            'SELECT id FROM users WHERE username = ?'
        ).bind(username).all();
        if (results.length > 0) {
            return new Response(JSON.stringify({ error: '用户名已存在' }), { status: 409 });
        }

        // 生成哈希和盐
        const { salt, hash } = await hashPassword(password);

        await env.DB.prepare(
            'INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)'
        ).bind(username, hash, salt).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
