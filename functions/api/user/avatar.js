// /functions/api/user/avatar.js
import { getCurrentUserId } from '../utils/auth';

export async function onRequest(context) {
    const { request, env } = context;

    if (request.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    const userId = await getCurrentUserId(request, env);
    if (!userId) {
        return new Response(JSON.stringify({ error: '未登录' }), { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('avatar');
        if (!file) {
            return new Response(JSON.stringify({ error: '未提供图片' }), { status: 400 });
        }

        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return new Response(JSON.stringify({ error: '仅支持 JPG、PNG、GIF、WebP 格式' }), { status: 400 });
        }

        // 限制大小（2MB）
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            return new Response(JSON.stringify({ error: '图片大小不能超过 2MB' }), { status: 400 });
        }

        // 将文件转为 Buffer 并编码为 Base64
        const buffer = await file.arrayBuffer();
        const base64 = `data:${file.type};base64,${Buffer.from(buffer).toString('base64')}`;

        // 存入数据库
        await env.DB.prepare('UPDATE users SET avatar = ? WHERE id = ?').bind(base64, userId).run();

        return new Response(JSON.stringify({ success: true, avatar: base64 }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('上传头像失败:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
