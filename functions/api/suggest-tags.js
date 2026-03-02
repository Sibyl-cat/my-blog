// /functions/api/suggest-tags.js
export async function onRequest(context) {
    const { request, env } = context;
    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { title, content } = await request.json();
        const text = (title + ' ' + (content || '')).toLowerCase();

        // 从数据库中获取所有已有的标签
        const { results } = await env.DB.prepare("SELECT tags FROM posts").all();
        const allTags = new Set();
        results.forEach(row => {
            if (row.tags) {
                row.tags.split(',').forEach(t => allTags.add(t.trim().toLowerCase()));
            }
        });

        // 过滤出出现在文本中的标签
        const suggestions = Array.from(allTags).filter(tag => text.includes(tag));
        return new Response(JSON.stringify(suggestions), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
