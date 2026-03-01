// /functions/api/posts.js
export async function onRequest(context) {
  const { env } = context;
  
  try {
    // 查询所有文章，按更新时间倒序排列
    const { results } = await env.DB.prepare(`
      SELECT slug, title, excerpt, tags, updated_at
      FROM posts
      ORDER BY updated_at DESC
    `).all();
    
    // 返回 JSON
    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
