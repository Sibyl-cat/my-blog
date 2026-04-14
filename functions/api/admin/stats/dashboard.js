// /functions/api/admin/stats/dashboard.js
import { getCurrentUserId } from '../../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;
    const userId = await getCurrentUserId(request, env);
    if (!userId) return new Response(JSON.stringify({ error: '未登录' }), { status: 401 });

    const { results: adminCheck } = await env.DB.prepare(
        'SELECT role FROM users WHERE id = ?'
    ).bind(userId).all();
    if (adminCheck[0]?.role !== 'admin') {
        return new Response(JSON.stringify({ error: '无权访问' }), { status: 403 });
    }

    const last7Days = await env.DB.prepare(`
        SELECT date, pv, uv, new_posts, new_users, top_paths, top_referers, country_dist
        FROM daily_stats
        WHERE date >= date('now', '-7 days')
        ORDER BY date ASC
    `).all();

    // 近7天文章阅读量趋势（取前5热门文章）
    const articleTrend = await env.DB.prepare(`
        SELECT p.slug, p.title, SUM(d.views) as total_views
        FROM post_daily_stats d
        JOIN posts p ON d.slug = p.slug
        WHERE d.date >= date('now', '-7 days')
        GROUP BY d.slug
        ORDER BY total_views DESC
        LIMIT 10
    `).all();

    return new Response(JSON.stringify({
        dailyStats: last7Days.results,
        topArticles: articleTrend.results
    }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
