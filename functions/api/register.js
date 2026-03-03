import { hashPassword } from './utils/auth';  // 确保 auth.js 中有 hashPassword

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const body = await request.json();
        const { username, password, honeypot } = body;  // 只提取需要的字段，不再关心 cf-turnstile-response

        // 蜜罐检查
        if (honeypot) {
            return new Response(JSON.stringify({ error: '检测到机器人行为' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        

        if (!username || !password) {
            return new Response(JSON.stringify({ error: '用户名和密码不能为空' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 检查用户名是否已存在
        const { results } = await env.DB.prepare(
            'SELECT id FROM users WHERE username = ?'
        ).bind(username).all();
        if (results.length > 0) {
            return new Response(JSON.stringify({ error: '用户名已存在' }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 生成哈希和盐
        const { salt, hash } = await hashPassword(password);

        await env.DB.prepare(
            'INSERT INTO users (username, password_hash, salt, role) VALUES (?, ?, ?, ?)'
        ).bind(username, hash, salt, 'user').run();
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
