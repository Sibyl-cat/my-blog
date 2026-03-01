export async function onRequest(context) {
    const { env, params } = context;
    const username = params.username;

    const { results } = await env.DB.prepare(
        `SELECT p.slug, p.title, p.excerpt, p.tags, p.updated_at
         FROM posts p
         JOIN users u ON p.author_id = u.id
         WHERE u.username = ?
         ORDER BY p.updated_at DESC`
    ).bind(username).all();

    return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' }
    });
}
