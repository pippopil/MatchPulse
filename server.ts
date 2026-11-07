import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseLiveAndUpcomingFootballMatches } from './src/server/realFootballParser';
import { DataSourceType } from './src/types/football';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');

const PORT = parseInt(process.env.PORT || '3000', 10);

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function serveFile(res: http.ServerResponse, filePath: string, defaultContentType = 'application/octet-stream') {
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // SPA Fallback: отдаем dist/index.html
      const indexPath = path.join(DIST_DIR, 'index.html');
      fs.readFile(indexPath, (indexErr, indexData) => {
        if (indexErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('MatchPulse: Файл не найден. Соберите проект через npm run build');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(indexData);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || defaultContentType;

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  // CORS заголовки для локальной работы
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost:3000'}`);

  // 1. API endpoint: /api/matches
  if (reqUrl.pathname === '/api/matches') {
    try {
      const source = (reqUrl.searchParams.get('source') as DataSourceType) || 'all';
      const matches = await parseLiveAndUpcomingFootballMatches(source);
      const jsonStr = JSON.stringify(matches);

      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      });
      res.end(jsonStr);
    } catch (err: any) {
      console.error('[API Error]', err);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: err?.message || 'Parser failure' }));
    }
    return;
  }

  // 2. API endpoint: /api/telegram/send
  if (reqUrl.pathname === '/api/telegram/send' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const { token, chatId, text } = JSON.parse(body || '{}');
        if (!token || !chatId || !text) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, description: 'Missing token, chatId, or text' }));
          return;
        }

        const telegramRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
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

        const telegramData = await telegramRes.json();
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(telegramData));
      } catch (err: any) {
        console.error('[Telegram API Proxy Error]', err);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, description: err?.message || 'Telegram proxy error' }));
      }
    });
    return;
  }

  // 3. Healthcheck / Ping
  if (reqUrl.pathname === '/api/ping') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('pong');
    return;
  }

  // 3. Статические файлы из папки dist
  let safePath = path.normalize(decodeURIComponent(reqUrl.pathname)).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(DIST_DIR, safePath);
  serveFile(res, filePath);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  echoRunningBanner(PORT);
});

function echoRunningBanner(port: number) {
  console.log(`   ⚡ MatchPulse Standalone Server успешно запущен!`);
  console.log(`   🌐 Адрес в браузере: http://localhost:${port}`);
  console.log(`   📡 Без сторонних зависимостей (100% встроенный Node)`);
  console.log(`======================================================\n`);
}

export default server;
