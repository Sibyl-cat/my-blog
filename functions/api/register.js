import { hashPassword } from './utils/auth';  // 确保 auth.js 中有 hashPassword

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { username, password, 'cf-turnstile-response': token } = await request.json();
        // 验证 Turnstile token
        if (!token) {
            return new Response(JSON.stringify({ error: '请完成验证码' }), { status: 400 });
        }
        // 准备请求体，用于向 Cloudflare 验证 token
        const turnstileBody = {
          secret: env.TURNSTILE_SECRET, // ✅ 从环境变量中读取 Secret 密钥
          response: token,
          remoteip: request.headers.get('CF-Connecting-IP') || ''
        };

        const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(turnstileBody)
        });
        const turnstileData = await turnstileRes.json();
        if (!turnstileData.success) {
            return new Response(JSON.stringify({ error: '验证码验证失败' }), { status: 400 });
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
