// /functions/api/utils/generateSlug.js
export async function generateSlug(env) {
    // 查询所有以 "post" 开头的 slug
    const { results } = await env.DB.prepare("SELECT slug FROM posts WHERE slug LIKE 'post%'").all();
    
    let maxNum = 0;
    for (const row of results) {
        const num = parseInt(row.slug.replace('post', ''), 10);
        if (!isNaN(num) && num > maxNum) {
            maxNum = num;
        }
    }
    return `post${maxNum + 1}`;
}
