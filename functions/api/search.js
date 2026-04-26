export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';

    if (!query) {
        return new Response(JSON.stringify({ posts: [], authors: [], tags: [] }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const keyword = `%${query}%`;

    // 1. 搜索文章 (标题或摘要)
    const { results: posts } = await env.DB.prepare(`
        SELECT p.slug, p.title, p.excerpt, p.tags, u.username as author
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE p.is_published = 1 AND (p.title LIKE ? OR p.excerpt LIKE ?)
        ORDER BY p.updated_at DESC
        LIMIT 10
    `).bind(keyword, keyword).all();

    // 2. 搜索作者
    const { results: authors } = await env.DB.prepare(`
        SELECT u.username, COUNT(p.id) as post_count
        FROM users u
        LEFT JOIN posts p ON u.id = p.author_id
        WHERE u.role != 'superadmin' AND u.username LIKE ?
        GROUP BY u.id
        LIMIT 5
    `).bind(keyword).all();

    // 3. 搜索标签 (从所有已发布文章中提取并匹配)
    const { results: allPostTags } = await env.DB.prepare("SELECT tags FROM posts WHERE is_published = 1").all();
    const tagMap = new Map();
    allPostTags.forEach(row => {
        if (row.tags) {
            row.tags.split(',').forEach(tag => {
                const name = tag.trim();
                if (name && name.toLowerCase().includes(query.toLowerCase())) {
                    tagMap.set(name, (tagMap.get(name) || 0) + 1);
                }
            });
        }
    });
    const tags = Array.from(tagMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    return new Response(JSON.stringify({ posts, authors, tags }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
