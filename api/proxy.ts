export const config = {
  runtime: 'edge',
};

export default async function handler(req: any, res?: any) {
  // 1. Node.js Serverless runtime compatibility (if invoked with res object)
  if (res && typeof res.status === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    const targetUrl = req.headers['x-target-url'] || req.query?.url || req.query?.target;
    if (!targetUrl) {
      return res.status(400).json({ error: 'Missing x-target-url header or url parameter' });
    }

    try {
      const forwardHeaders: Record<string, string> = {};
      const headersToForward = ['authorization', 'content-type', 'accept', 'http-referer', 'x-title', 'user-agent'];
      for (const h of headersToForward) {
        if (req.headers[h]) forwardHeaders[h] = req.headers[h];
      }

      const fetchOptions: RequestInit = {
        method: req.method,
        headers: forwardHeaders,
      };

      if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
        fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      }

      const remoteRes = await fetch(targetUrl, fetchOptions);
      res.status(remoteRes.status);
      remoteRes.headers.forEach((val: string, key: string) => {
        const lk = key.toLowerCase();
        if (lk !== 'content-encoding' && lk !== 'content-length') {
          res.setHeader(key, val);
        }
      });
      res.setHeader('Access-Control-Allow-Origin', '*');

      if (remoteRes.body) {
        const reader = remoteRes.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      } else {
        res.end();
      }
      return;
    } catch (err: any) {
      return res.status(502).json({ error: `Vercel proxy failed: ${err.message}` });
    }
  }

  // 2. Web Standard / Edge runtime compatibility (req is Web Request)
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
