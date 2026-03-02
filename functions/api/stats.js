// /functions/api/stats.js
export async function onRequest(context) {
    const { env } = context;

    try {
        // 文章总数
        const postsResult = await env.DB.prepare("SELECT COUNT(*) as count FROM posts").first();
        const postsCount = postsResult.count || 0;

        // 用户总数（排除 superadmin）
        const usersResult = await env.DB.prepare(
            "SELECT COUNT(*) as count FROM users WHERE role != 'superadmin'"
        ).first();
        const usersCount = usersResult.count || 0;

        return new Response(JSON.stringify({ postsCount, usersCount }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
