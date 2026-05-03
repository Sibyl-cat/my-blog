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

    // 获取用户角色
    const { results: userResults } = await env.DB.prepare(
        'SELECT role FROM users WHERE id = ?'
    ).bind(userId).all();
    const role = userResults[0]?.role;

    try {
        const formData = await request.formData();
        let slug = formData.get('slug');
        const title = formData.get('title');
        const content = formData.get('content');
        const excerpt = formData.get('excerpt');
        const tags = formData.get('tags');
        const is_published = formData.get('is_published'); // 可能是 '1' 或 '0' 或 null

        if (!title) {
            return new Response(JSON.stringify({ error: '标题不能为空' }), { status: 400 });
        }

        if (!slug) {
            // 新建文章
            if (role === 'superadmin') {
                return new Response(JSON.stringify({ error: '超级管理员不能创建文章' }), { status: 403 });
            }
            slug = await generateSlug(env);
            // 正确转换 is_published：只有显式传入 '1' 才设为已发表，否则为草稿
            const publishFlag = is_published === '1' ? 1 : 0;
            await env.DB.prepare(
                `INSERT INTO posts (slug, title, content, excerpt, tags, author_id, is_published)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`
            ).bind(slug, title, content, excerpt, tags, userId, publishFlag).run();
        } else {
            // 更新文章
            const { results } = await env.DB.prepare(
                'SELECT author_id FROM posts WHERE slug = ?'
            ).bind(slug).all();
            if (results.length === 0) {
                return new Response(JSON.stringify({ error: '文章不存在' }), { status: 404 });
            }
            const authorId = results[0].author_id;
            // 权限检查：管理员/superadmin 可修改任何文章，否则只能修改自己的
            if (role !== 'admin' && role !== 'superadmin' && authorId !== userId) {
                return new Response(JSON.stringify({ error: '无权修改他人文章' }), { status: 403 });
            }

            // 构建动态更新语句
            let sql = "UPDATE posts SET title = ?, content = ?, excerpt = ?, tags = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')";
            const params = [title, content, excerpt, tags];
            if (is_published !== null) {
                // 同样转换 is_published
                const publishFlag = is_published === '1' ? 1 : 0;
                sql += ', is_published = ?';
                params.push(publishFlag);
            }
            sql += ' WHERE slug = ?';
            params.push(slug);
            await env.DB.prepare(sql).bind(...params).run();
        }

        return new Response(JSON.stringify({ success: true, slug }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('文章操作失败:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
