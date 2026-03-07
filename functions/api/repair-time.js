// /functions/api/repair-time.js
export async function onRequest(context) {
    const { env } = context;
    // 从环境变量获取开始时间，若没有则返回当前时间
    const startTime = env.MAINTENANCE_START_TIME || Math.floor(Date.now() / 1000);
    return new Response(JSON.stringify({ startTime }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
