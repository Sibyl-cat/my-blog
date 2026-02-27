// /functions/api/login.js
import { verifyPassword } from './utils/auth';  // 稍后定义

export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    console.log('✅ [LOGIN] 收到登录请求');
    const { username, password } = await request.json();
    console.log('✅ [LOGIN] 用户名:', username);

    // 从数据库查询用户
    console.log('✅ [LOGIN] 正在查询用户:', username);
    const { results } = await env.DB.prepare(
      'SELECT id, password_hash, salt FROM users WHERE username = ?'
    ).bind(username).all();
    console.log('✅ [LOGIN] 查询结果数量:', results.length);

    if (results.length === 0) {
      console.log('❌ [LOGIN] 用户不存在');
      return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = results[0];
    console.log('✅ [LOGIN] 找到用户，ID:', user.id);

    const isValid = await verifyPassword(password, user.salt, user.password_hash);
    console.log('✅ [LOGIN] 密码验证结果:', isValid);

    if (!isValid) {
      console.log('❌ [LOGIN] 密码错误');
      return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 创建会话
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天
    console.log('✅ [LOGIN] 生成会话ID:', sessionId);
    console.log('✅ [LOGIN] 过期时间:', expiresAt.toISOString());

    // 插入会话到数据库
    console.log('✅ [LOGIN] 正在插入会话...');
    await env.DB.prepare(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
    ).bind(sessionId, user.id, expiresAt.toISOString()).run();
    console.log('✅ [LOGIN] 会话插入成功');


    // 设置 Cookie
    const headers = new Headers({
      'Set-Cookie': `session_id=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 60 * 60}`,
      'Content-Type': 'application/json'
    });

    console.log('✅ [LOGIN] 登录成功，返回响应')
    return new Response(JSON.stringify({ success: true }), { headers });
  } catch (error) {
    console.error('❌ [LOGIN] 发生错误:', error.message);
    console.error(error.stack); // 打印堆栈信息
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
async function verifyPassword(password, saltHex, storedHash) {
}
