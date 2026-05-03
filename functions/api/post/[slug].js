// /functions/api/post/[slug].js
export async function onRequest(context) {
    const { request, env, params } = context;
    const slug = params.slug;

    try {
        const { results } = await env.DB.prepare(`
            SELECT 
                p.slug, 
                p.title, 
                p.content, 
                p.excerpt, 
                p.tags, 
                strftime('%Y-%m-%dT%H:%M:%SZ', p.created_at) as created_at, 
                strftime('%Y-%m-%dT%H:%M:%SZ', p.updated_at) as updated_at, 
                u.username as author,
                p.is_published
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.id
            WHERE p.slug = ?
        `).bind(slug).all();

        if (results.length === 0) {
            return new Response(JSON.stringify({ error: '文章不存在' }), { status: 404 });
        }

        return new Response(JSON.stringify(results[0]), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
