// /functions/api/utils/generateSlug.js
export async function generateSlug(env) {
    // 获取所有文章，提取 slug 中的数字后缀
    const { results } = await env.DB.prepare('SELECT slug FROM posts').all();
    let maxNum = 0;
    for (const row of results) {
        const match = row.slug.match(/\d+$/); // 匹配末尾数字
        if (match) {
            const num = parseInt(match[0], 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
        }
    }
    return `post${maxNum + 1}`;
}
