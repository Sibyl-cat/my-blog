import { getCurrentUserId } from '../../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const userId = await getCurrentUserId(request, env);
    if (!userId) {
        return new Response(JSON.stringify({ error: '未登录' }), { status: 401 });
    }
<<<<<<< HEAD
=======
    // 检查是否为 admin
    const { results: userResults } = await env.DB.prepare(
        'SELECT role FROM users WHERE id = ?'
    ).bind(userId).all();
    if (userResults[0]?.role !== 'admin') {
        return new Response(JSON.stringify({ error: '无权访问' }), { status: 403 });
    }
>>>>>>> 13ec8190b9cdf379ca0a14ec490da7131d115ebe

    try {
        const { id } = await request.json();

        if (!id) {
            return new Response(JSON.stringify({ error: '用户ID不能为空' }), { status: 400 });
        }

        // 可选：禁止删除当前登录用户自身
        if (id === userId) {
            return new Response(JSON.stringify({ error: '不能删除当前登录用户' }), { status: 403 });
        }

        // 在一个事务中执行：先删除该用户的文章，再删除该用户（以及会话）
        await env.DB.batch([
            // 删除该用户的所有文章
            env.DB.prepare('DELETE FROM posts WHERE author_id = ?').bind(id),
            // 删除该用户的所有会话（可选，保持数据整洁）
            env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(id),
            // 最后删除用户
            env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id)
        ]);

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
