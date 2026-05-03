// /functions/api/posts.js
export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '6');
    const offset = (page - 1) * limit;

    // 获取文章列表
    const { results: posts } = await env.DB.prepare(`
        SELECT p.slug, p.title, p.excerpt, p.tags, 
               strftime('%Y-%m-%dT%H:%M:%SZ', p.created_at) as created_at, 
               strftime('%Y-%m-%dT%H:%M:%SZ', p.updated_at) as updated_at, 
               u.username as author
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE p.is_published = 1
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    `).bind(limit, offset).all();

    // 获取总数
    const countResult = await env.DB.prepare(`
        SELECT COUNT(*) as total FROM posts WHERE is_published = 1
    `).first();

    return new Response(JSON.stringify({
        posts,
        total: countResult.total,
        page,
        limit
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
