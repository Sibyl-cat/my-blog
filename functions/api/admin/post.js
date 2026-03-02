// /functions/api/admin/post.js
import { getCurrentUserId } from '../utils/auth';
import { generateSlug } from '../utils/generateSlug';
export async function onRequest(context) {
  const { request, env } = context;

  
  // 只接受 POST 请求
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '方法不允许' }), { status: 405 });
  }
    // ... 方法检查
    const userId = await getCurrentUserId(request, env);
    if (!userId) {return new Response(JSON.stringify({ error: '未登录' }), { status: 401 });
    }
     // 获取当前用户角色
    const { results: userResults } = await env.DB.prepare(
        'SELECT role FROM users WHERE id = ?'
    ).bind(userId).all();
    const isAdmin = userResults[0]?.role === 'admin';


  try {
    // 解析请求体（表单数据或 JSON）
    const formData = await request.formData();
    let slug = formData.get('slug');
    const title = formData.get('title');
    const content = formData.get('content');
    const excerpt = formData.get('excerpt');
    const tags = formData.get('tags');

    // 基本验证
    if (!title) {
      return new Response(JSON.stringify({ error: '标题不能为空' }), { status: 400 });
    }

      

     // 判断是新增还是更新
        if (!slug) {
          // ⭐ superadmin 禁止新建
            if (role === 'superadmin') {
                return new Response(JSON.stringify({ error: '超级管理员不能创建文章' }), { status: 403 });
            }
            // 新增文章，自动生成 slug
            slug = await generateSlug(env);
            await env.DB.prepare(
                `INSERT INTO posts (slug, title, content, excerpt, tags, author_id)
                    VALUES (?, ?, ?, ?, ?, ?)`
                ).bind(slug, title, content, excerpt, tags, userId).run();
            } else {
                
            // 更新文章，检查权限
            const { results } = await env.DB.prepare(
                'SELECT author_id FROM posts WHERE slug = ?'
            ).bind(slug).all();

            if (results.length === 0) {
                return new Response(JSON.stringify({ error: '文章不存在' }), { status: 404 });
            }
            const authorId = results[0].author_id;
            if (!isAdmin && authorId !== userId) {
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
