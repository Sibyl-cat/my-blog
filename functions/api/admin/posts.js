import { getCurrentUserId } from '../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;

    const userId = await getCurrentUserId(request, env);
    if (!userId) {
        return new Response(JSON.stringify({ error: '未登录' }), { status: 401 });
    }

    const { results } = await env.DB.prepare(
        `SELECT slug, title, excerpt, tags, updated_at
         FROM posts
         WHERE author_id = ?
         ORDER BY updated_at DESC`
    ).bind(userId).all();

    return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' }
    });
}
