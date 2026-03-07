import { getCurrentUserId } from '../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;

    const userId = await getCurrentUserId(request, env);
    if (!userId) {
        return new Response(JSON.stringify({ error: '未登录' }), { status: 401 });
    }

<<<<<<< HEAD
    const { results } = await env.DB.prepare(
        'SELECT id, username, created_at FROM users ORDER BY id ASC'
    ).all();

=======
    // 检查是否为 admin
    const { results: userResults } = await env.DB.prepare(
        'SELECT role FROM users WHERE id = ?'
    ).bind(userId).all();
    if (userResults[0]?.role !== 'admin') {
        return new Response(JSON.stringify({ error: '无权访问' }), { status: 403 });
    }

    // 查询所有用户，排除 role='superadmin'
    const { results } = await env.DB.prepare(
        "SELECT id, username, created_at FROM users WHERE role != 'superadmin' ORDER BY id ASC"
    ).all();
>>>>>>> 13ec8190b9cdf379ca0a14ec490da7131d115ebe
    return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' }
    });
}
