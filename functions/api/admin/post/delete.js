// /functions/api/admin/post/delete.js
import { getCurrentUserId } from '../../utils/auth';
<<<<<<< HEAD
export async function onRequest(context) {
  const { request, env } = context;
if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
    }
  // ... 方法检查
    const userId = await getCurrentUserId(request, env);
    if (!userId) return new Response(JSON.stringify({ error: '未登录' }), { status: 401 });
}
  const { results: userResults } = await env.DB.prepare(
=======

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
    // 获取当前用户角色
    const { results: userResults } = await env.DB.prepare(
>>>>>>> 13ec8190b9cdf379ca0a14ec490da7131d115ebe
        'SELECT role FROM users WHERE id = ?'
    ).bind(userId).all();
    const isAdmin = userResults[0]?.role === 'admin';

<<<<<<< HEAD
  

  try {
    const formData = await request.formData();
    const slug = formData.get('slug');

    if (!slug) {
      return new Response(JSON.stringify({ error: 'slug 不能为空' }), { status: 400 });
    }
    // 检查文章是否存在及作者
=======
=======
    let role;
>>>>>>> main
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
        const slug = formData.get('slug');

        if (!slug) {
            return new Response(JSON.stringify({ error: 'slug 不能为空' }), { status: 400 });
        }

>>>>>>> 13ec8190b9cdf379ca0a14ec490da7131d115ebe
        const { results } = await env.DB.prepare(
            'SELECT author_id FROM posts WHERE slug = ?'
        ).bind(slug).all();

        if (results.length === 0) {
            return new Response(JSON.stringify({ error: '文章不存在' }), { status: 404 });
        }
<<<<<<< HEAD
=======

>>>>>>> 13ec8190b9cdf379ca0a14ec490da7131d115ebe
        const authorId = results[0].author_id;
        // 允许 admin/superadmin 或作者本人删除
        if (role !== 'superadmin' && authorId !== userId) {
            return new Response(JSON.stringify({ error: '无权删除他人文章' }), { status: 403 });
        }

<<<<<<< HEAD
    await env.DB.prepare(`DELETE FROM posts WHERE slug = ?`).bind(slug).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
=======
        await env.DB.prepare('DELETE FROM posts WHERE slug = ?').bind(slug).run();

        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
>>>>>>> 13ec8190b9cdf379ca0a14ec490da7131d115ebe
}
