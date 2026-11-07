import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

import { parseLiveAndUpcomingFootballMatches } from './src/server/realFootballParser';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'football-api-middleware',
        configureServer(server) {
          server.middlewares.use('/api/matches', async (req, res) => {
            try {
              const reqUrl = new URL(req.url || '/', 'http://localhost');
              const source = (reqUrl.searchParams.get('source') || 'all') as any;
              const matches = await parseLiveAndUpcomingFootballMatches(source);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(matches));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: err?.message || 'Parser error' }));
            }
          });

          server.middlewares.use('/api/telegram/send', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end('Method Not Allowed');
              return;
            }
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
              try {
                const { token, chatId, text } = JSON.parse(body || '{}');
                const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: chatId,
                    text,
                    parse_mode: 'HTML',
                    disable_web_page_preview: true
                  }),
                  signal: AbortSignal.timeout(8000)
                });
                const data = await tgRes.json();
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ ok: false, description: err?.message || 'Telegram proxy error' }));
              }
            });
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
