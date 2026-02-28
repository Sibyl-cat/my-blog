// /functions/api/admin/post/delete.js
import { getCurrentUserId } from '../../utils/auth';
// 新增：获取用户角色
async function getUserRole(userId, env) {
    const { results } = await env.DB.prepare(
        'SELECT role FROM users WHERE id = ?'
    ).bind(userId).all();
    return results.length ? results[0].role : 'author';
}

export async function onRequest(context) {
  const { request, env } = context;
  // ... 方法检查
    const userId = await getCurrentUserId(request, env);
    if (!userId) return new Response(JSON.stringify({ error: '未登录' }), { status: 401 });

    const role = await getUserRole(userId, env);
    const isAdmin = role === 'admin';

  
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '方法不允许' }), { status: 405 });
  }
    if (!userId) {
        return new Response(JSON.stringify({ error: '未登录' }), { status: 401 });
    }

  try {
    const formData = await request.formData();
    const slug = formData.get('slug');

    if (!slug) {
      return new Response(JSON.stringify({ error: 'slug 不能为空' }), { status: 400 });
    }
    // 检查文章是否存在及作者
        const { results } = await env.DB.prepare(
            'SELECT author_id FROM posts WHERE slug = ?'
        ).bind(slug).all();

        if (results.length === 0) {
            return new Response(JSON.stringify({ error: '文章不存在' }), { status: 404 });
        }
        if (!isAdmin && results[0].author_id !== userId) {
            return new Response(JSON.stringify({ error: '无权删除他人文章' }), { status: 403 });
        }

    await env.DB.prepare(`DELETE FROM posts WHERE slug = ?`).bind(slug).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
