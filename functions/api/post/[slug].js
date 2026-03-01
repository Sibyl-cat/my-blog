// /functions/api/post/[slug].js
export async function onRequest(context) {
  const { env, params } = context;
  const slug = params.slug;  // 从 URL 路径中获取 slug，例如 post1

  try {
    // 查询文章，包括所有字段
    const { results } = await env.DB.prepare(`
      SELECT slug, title, content, excerpt, tags, updated_at
      FROM posts
      WHERE slug = ?
    `).bind(slug).all();

    // 如果没有找到文章，返回 404
    if (results.length === 0) {
      return new Response(JSON.stringify({ error: '文章不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 返回文章数据
    return new Response(JSON.stringify(results[0]), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
