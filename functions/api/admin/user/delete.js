import { getCurrentUserId } from '../../utils/auth';

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
        const { id } = await request.json();

        if (!id) {
            return new Response(JSON.stringify({ error: '用户ID不能为空' }), { status: 400 });
        }

        // 可选：禁止删除当前登录用户自身
        if (id === userId) {
            return new Response(JSON.stringify({ error: '不能删除当前登录用户' }), { status: 403 });
        }

        await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
