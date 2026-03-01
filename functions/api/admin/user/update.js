import { getCurrentUserId } from '../../utils/auth';
import { hashPassword } from '../../utils/auth';

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
        const { id, password } = await request.json();

        if (!id || !password) {
            return new Response(JSON.stringify({ error: '用户ID和密码不能为空' }), { status: 400 });
        }

        // 生成新哈希和盐
        const { salt, hash } = await hashPassword(password);

        await env.DB.prepare(
            'UPDATE users SET password_hash = ?, salt = ? WHERE id = ?'
        ).bind(hash, salt, id).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
