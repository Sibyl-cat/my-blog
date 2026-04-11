// /functions/api/stats/public.js
export async function onRequest(context) {
    const { env } = context;

    try {
        // 1. 作者发文榜（前10）
        const authorRank = await env.DB.prepare(`
            SELECT u.username, COUNT(p.id) as post_count
            FROM users u
            LEFT JOIN posts p ON u.id = p.author_id AND p.is_published = 1
            WHERE u.role != 'superadmin'
            GROUP BY u.id
            ORDER BY post_count DESC
            LIMIT 10
        `).all();

        // 2. 热门标签榜（从已发表文章中统计）
        const { results: allPosts } = await env.DB.prepare(
            "SELECT tags FROM posts WHERE is_published = 1 AND tags IS NOT NULL"
        ).all();
        const tagCount = new Map();
        allPosts.forEach(row => {
            if (row.tags) {
                row.tags.split(',').forEach(tag => {
                    tag = tag.trim();
                    if (tag) tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
                });
            }
        });
        const tagRank = Array.from(tagCount.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // 3. 最新文章榜（前10）
        const latestPosts = await env.DB.prepare(`
            SELECT p.title, p.slug, u.username as author, p.updated_at
            FROM posts p
            LEFT JOIN users u ON p.author_id = u.id
            WHERE p.is_published = 1
            ORDER BY p.updated_at DESC
            LIMIT 10
        `).all();

        // 4. 总文章数、总用户数、总标签数（标签数为去重数量）
        const totalPosts = (await env.DB.prepare("SELECT COUNT(*) as count FROM posts WHERE is_published = 1").first()).count;
        const totalUsers = (await env.DB.prepare("SELECT COUNT(*) as count FROM users WHERE role != 'superadmin'").first()).count;
        const totalTags = tagCount.size;

        return new Response(JSON.stringify({
            authorRank: authorRank.results,
            tagRank,
            latestPosts: latestPosts.results,
            totalPosts,
            totalUsers,
            totalTags
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
