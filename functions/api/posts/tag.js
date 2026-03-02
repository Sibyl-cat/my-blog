// /functions/api/posts/tag.js
export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const tagName = url.searchParams.get('name');
    if (!tagName) {
        return new Response(JSON.stringify({ error: '缺少标签名' }), { status: 400 });
    }

    const { results } = await env.DB.prepare(
        "SELECT slug, title, excerpt, tags, updated_at FROM posts WHERE tags LIKE ? ORDER BY updated_at DESC"
    ).bind(`%${tagName}%`).all();

    // 精确匹配（因为LIKE可能包含部分匹配，需要过滤）
    const posts = results.filter(row => 
        row.tags.split(',').map(t => t.trim()).includes(tagName)
    );

    return new Response(JSON.stringify(posts), {
        headers: { 'Content-Type': 'application/json' }
    });
}
