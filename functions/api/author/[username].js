export async function onRequest(context) {
    const { env, params } = context;
    const username = params.username;

    // 1. 获取作者基本信息
    const { results: userResults } = await env.DB.prepare(
        `SELECT username, role, created_at, avatar, signature 
         FROM users 
         WHERE username = ? AND role != 'superadmin'`
    ).bind(username).all();

    if (userResults.length === 0) {
        return new Response(JSON.stringify({ error: '用户不存在' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }

    const user = userResults[0];

    // 2. 获取作者已发布的文章
    const { results: postResults } = await env.DB.prepare(
        `SELECT p.slug, p.title, p.excerpt, p.tags, 
                strftime('%Y-%m-%dT%H:%M:%SZ', p.created_at) as created_at,
                strftime('%Y-%m-%dT%H:%M:%SZ', p.updated_at) as updated_at
         FROM posts p
         JOIN users u ON p.author_id = u.id
         WHERE u.username = ? AND p.is_published = 1
         ORDER BY p.created_at DESC`
    ).bind(username).all();

    return new Response(JSON.stringify({
        user: user,
        posts: postResults
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
