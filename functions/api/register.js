import { hashPassword } from './utils/auth';  // 确保 auth.js 中有 hashPassword

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const body = await request.json();
        const { username, password, honeypot, timestamp } = body;  // 只提取需要的字段，不再关心 cf-turnstile-response

        // 蜜罐检查
        if (honeypot) {
            return new Response(JSON.stringify({ error: '检测到机器人行为' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        // 时间戳检查：如果 timestamp 缺失，直接返回错误（避免后面使用 submitTime）
        if (!timestamp) {
            return new Response(JSON.stringify({ error: '提交超时，请刷新页面重试' }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const now = Date.now();
        const submitTime = parseInt(timestamp);

        if (isNaN(submitTime) || Math.abs(now - submitTime) < 2000) { // 使用绝对值
            return new Response(JSON.stringify({ error: '提交速度过快，请稍后再试' }), {
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
