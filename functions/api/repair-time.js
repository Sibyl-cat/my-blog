export async function onRequest(context) {
    const { env } = context;
    const startResult = await env.DB.prepare(
        'SELECT value FROM site_config WHERE key = ?'
    ).bind('maintenance_start_time').first();
    const startTime = startResult?.value ? parseInt(startResult.value) : Math.floor(Date.now() / 1000);
    return new Response(JSON.stringify({ startTime }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
