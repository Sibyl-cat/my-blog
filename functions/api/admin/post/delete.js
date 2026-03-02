// /functions/api/admin/post/delete.js
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

    let role; // 提前声明
    try {
        // 获取用户角色
        const { results: userResults } = await env.DB.prepare(
            'SELECT role FROM users WHERE id = ?'
        ).bind(userId).all();
        if (userResults.length === 0) {
            return new Response(JSON.stringify({ error: '用户不存在' }), { status: 404 });
        }
        role = userResults[0].role;

    try {
        const formData = await request.formData();
        const slug = formData.get('slug');

        if (!slug) {
            return new Response(JSON.stringify({ error: 'slug 不能为空' }), { status: 400 });
        }

        const { results } = await env.DB.prepare(
            'SELECT author_id FROM posts WHERE slug = ?'
        ).bind(slug).all();

        if (results.length === 0) {
            return new Response(JSON.stringify({ error: '文章不存在' }), { status: 404 });
        }

        const authorId = results[0].author_id;
        if (role !== 'admin' && role !== 'superadmin' && results[0].author_id !== userId) {
            return new Response(JSON.stringify({ error: '无权删除他人文章' }), { status: 403 });
        }

        await env.DB.prepare('DELETE FROM posts WHERE slug = ?').bind(slug).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
