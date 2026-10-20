export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  }

  const reqUrl = new URL(req.url);
  const targetUrl = req.headers.get('x-target-url') || reqUrl.searchParams.get('url') || reqUrl.searchParams.get('target');

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing x-target-url header or url parameter' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const forwardHeaders = new Headers();
    const headersToForward = [
      'authorization',
      'content-type',
      'accept',
      'http-referer',
      'x-title',
      'user-agent',
    ];
    for (const key of headersToForward) {
      const val = req.headers.get(key);
      if (val) forwardHeaders.set(key, val);
    }

    const body = req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined;

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body,
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', '*');

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: `Vercel proxy failed: ${err.message}` }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
