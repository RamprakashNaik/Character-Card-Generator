import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import http from 'node:http'
import https from 'node:https'
import { URL } from 'node:url'

/**
 * Built-in CORS Proxy Middleware for Local Dev Server
 * Allows connecting to local LLMs (LM Studio, Ollama) and remote APIs without browser CORS blocking.
 */
function corsProxyPlugin(): Plugin {
  return {
    name: 'cors-proxy-plugin',
    configureServer(server) {
      server.middlewares.use('/api/proxy', (req, res) => {
        // Handle CORS preflight
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        const reqUrl = new URL(req.url || '', 'http://localhost');
        const targetUrlStr = (req.headers['x-target-url'] as string) || reqUrl.searchParams.get('url') || reqUrl.searchParams.get('target');
        if (!targetUrlStr) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing x-target-url header or url parameter' }));
          return;
        }

        try {
          const parsedUrl = new URL(targetUrlStr);
          const isHttps = parsedUrl.protocol === 'https:';
          const client = isHttps ? https : http;

          const forwardHeaders: Record<string, any> = { ...req.headers };
          delete forwardHeaders['host'];
          delete forwardHeaders['x-target-url'];
          forwardHeaders['host'] = parsedUrl.host;

          const proxyReq = client.request(
            parsedUrl,
            {
              method: req.method,
              headers: forwardHeaders,
            },
            proxyRes => {
              res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
              proxyRes.pipe(res);
            }
          );

          proxyReq.on('error', err => {
            if (!res.headersSent) {
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: `Proxy connection failed: ${err.message}` }));
            }
          });

          req.pipe(proxyReq);
        } catch (err: any) {
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true, // Exposes on all network interfaces (e.g. 192.168.1.4)
    port: 5173,
  },
  plugins: [
    tailwindcss(),
    react(),
    corsProxyPlugin(),
  ],
})
