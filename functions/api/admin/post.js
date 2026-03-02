// /functions/api/admin/post.js
import { getCurrentUserId } from '../utils/auth';
import { generateSlug } from '../utils/generateSlug';

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const userId = await getCurrentUserId(request, env);
    if (!userId) {
        return new Response(JSON.stringify({ error: '未登录' }), { status: 401 });
    }

    let role;
    try {
        // 获取当前用户角色
        const { results: userResults } = await env.DB.prepare(
            'SELECT role FROM users WHERE id = ?'
        ).bind(userId).all();
        if (userResults.length === 0) {
            return new Response(JSON.stringify({ error: '用户不存在' }), { status: 404 });
        }
        role = userResults[0].role;

        const formData = await request.formData();
        let slug = formData.get('slug');
        const title = formData.get('title');
        const content = formData.get('content');
        const excerpt = formData.get('excerpt');
        const tags = formData.get('tags');

        if (!title) {
            return new Response(JSON.stringify({ error: '标题不能为空' }), { status: 400 });
        }

        if (!slug) {
            // 新增文章
            if (role === 'superadmin') {
                return new Response(JSON.stringify({ error: '超级管理员不能创建文章' }), { status: 403 });
            }
            slug = await generateSlug(env);
            await env.DB.prepare(
                `INSERT INTO posts (slug, title, content, excerpt, tags, author_id)
                 VALUES (?, ?, ?, ?, ?, ?)`
            ).bind(slug, title, content, excerpt, tags, userId).run();
        } else {
            // 更新文章
            const { results } = await env.DB.prepare(
                'SELECT author_id FROM posts WHERE slug = ?'
            ).bind(slug).all();

            if (results.length === 0) {
                return new Response(JSON.stringify({ error: '文章不存在' }), { status: 404 });
            }

            const authorId = results[0].author_id;
            // 允许 admin/superadmin 或作者本人修改
            if (role !== 'admin' && role !== 'superadmin' && authorId !== userId) {
                return new Response(JSON.stringify({ error: '无权修改他人文章' }), { status: 403 });
            }

            await env.DB.prepare(
                `UPDATE posts 
                 SET title = ?, content = ?, excerpt = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE slug = ?`
            ).bind(title, content, excerpt, tags, slug).run();
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}