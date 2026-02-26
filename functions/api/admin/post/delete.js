// /functions/api/admin/post/delete.js
export async function onRequest(context) {
  const { request, env } = context;
  
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '方法不允许' }), { status: 405 });
  }

  try {
    const formData = await request.formData();
    const slug = formData.get('slug');

    if (!slug) {
      return new Response(JSON.stringify({ error: 'slug 不能为空' }), { status: 400 });
    }

    await env.DB.prepare(`
      DELETE FROM posts WHERE slug = ?
    `).bind(slug).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
