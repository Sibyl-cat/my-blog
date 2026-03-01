// /functions/api/login.js
export async function onRequest(context) {
  const { request, env } = context;

  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { username, password } = await request.json();
    // 从数据库查询用户
    const { results } = await env.DB.prepare(
      'SELECT id, password_hash, salt,role FROM users WHERE username = ?'
    ).bind(username).all();
    if (results.length === 0) {
      return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const user = results[0];
    const isValid = await verifyPassword(password, user.salt, user.password_hash);
    if (!isValid) {
      return new Response(JSON.stringify({ error: '用户名或密码错误' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 创建会话
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7天
    // 插入会话到数据库
    await env.DB.prepare(
      'INSERT INTO sessions (id, user_id, role, expires_at) VALUES (?, ?, ?, ?)'
    ).bind(sessionId, user.id, user.role, expiresAt.toISOString()).run();


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
// 密码验证函数（务必包含）
async function verifyPassword(password, saltHex, storedHash) {
    const salt = new Uint8Array(saltHex.match(/.{2}/g).map(byte => parseInt(byte, 16)));
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(password);
    const keyMaterial = await crypto.subtle.importKey('raw', passwordData, { name: 'PBKDF2' }, false, ['deriveBits']);
    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: 100000,
            hash: 'SHA-256'
        },
        keyMaterial,
        256
    );
    const hashArray = Array.from(new Uint8Array(derivedBits));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex === storedHash;
}
