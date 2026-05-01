// /functions/api/user/update.js
import { getCurrentUserId } from '../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'POST' && request.method !== 'PUT') {
        return new Response(JSON.stringify({ error: '方法不允许' }), { status: 405 });
    }

    const userId = await getCurrentUserId(request, env);
    if (!userId) {
        return new Response(JSON.stringify({ error: '未登录' }), { status: 401 });
    }

    try {
        const body = await request.json();
        const { signature } = body;

        if (signature !== undefined) {
            // Check if column exists, if not it will fail but we assume it's created or we'll create it.
            // Ideally signature length limit
            const sigText = String(signature).substring(0, 100); 
            await env.DB.prepare(
                'UPDATE users SET signature = ? WHERE id = ?'
            ).bind(sigText, userId).run();
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: '更新失败', details: err.message }), { status: 500 });
    }
}
