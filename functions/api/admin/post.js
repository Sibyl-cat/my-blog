// /functions/api/admin/post.js
import { getCurrentUserId } from '../utils/auth';
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
  
  // 只接受 POST 请求
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '方法不允许' }), { status: 405 });
  }

  try {
    // 解析请求体（表单数据或 JSON）
    const formData = await request.formData();
    const slug = formData.get('slug');
    const title = formData.get('title');
    const content = formData.get('content');
    const excerpt = formData.get('excerpt');
    const tags = formData.get('tags');

    // 基本验证
    if (!slug || !title) {
      return new Response(JSON.stringify({ error: 'slug 和标题不能为空' }), { status: 400 });
    }

    // 检查文章是否存在（用于决定是插入还是更新）
    const { results } = await env.DB.prepare(`
      SELECT slug FROM posts WHERE slug = ?
    `).bind(slug).all();

    if (results.length > 0) {
      // 更新现有文章
      if (!isAdmin && results[0].author_id !== userId) {
                return new Response(JSON.stringify({ error: '无权修改他人文章' }), { status: 403 });
            }
      await env.DB.prepare(`
        UPDATE posts 
        SET title = ?, content = ?, excerpt = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
        WHERE slug = ?
      `).bind(title, content, excerpt, tags, slug).run();
    } else {
      // 插入新文章
      await env.DB.prepare(`
        INSERT INTO posts (slug, title, content, excerpt, tags)
        VALUES (?, ?, ?, ?, ?)
      `).bind(slug, title, content, excerpt, tags).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
