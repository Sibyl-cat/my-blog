export async function onRequest(context) {
    const { env } = context;

    const { results } = await env.DB.prepare(
        `SELECT u.id, u.username, COUNT(p.id) as post_count
         FROM users u
         LEFT JOIN posts p ON u.id = p.author_id
         WHERE u.role != 'superadmin'  -- 排除 superadmin
         GROUP BY u.id
         ORDER BY post_count DESC`
    ).all();

    return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' }
    });
}
