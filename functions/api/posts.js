// /functions/api/posts.js
export async function onRequest(context) {
    const { env } = context;

    const { results } = await env.DB.prepare(`
        SELECT 
            p.slug, 
            p.title, 
            p.excerpt, 
            p.tags, 
            p.updated_at,
            u.username as author
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        ORDER BY p.updated_at DESC
    `).all();

    return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' }
    });
}
