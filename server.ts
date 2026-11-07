import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseLiveAndUpcomingFootballMatches } from './src/server/realFootballParser';
import { DataSourceType } from './src/types/football';
import { EMBEDDED_FILES } from './src/server/embeddedAssets';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Проверяем несколько возможных путей к папке dist
const CANDIDATE_DIST_DIRS = [
  path.join(__dirname, 'dist'),
  path.join(process.cwd(), 'dist'),
  path.resolve('dist'),
  path.join(__dirname, '..', 'dist')
];

function getExistingDistDir(): string | null {
  for (const dir of CANDIDATE_DIST_DIRS) {
    try {
      if (fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html'))) {
        return dir;
      }
    } catch {}
  }
  return null;
}

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

function serveFile(res: http.ServerResponse, reqPath: string, defaultContentType = 'application/octet-stream') {
  const normalizedKey = reqPath.replace(/^[/\\]+/, '').replace(/\\/g, '/');
  const distDir = getExistingDistDir();

  // 1. Попытка отдать файл с диска
  if (distDir) {
    const diskPath = path.join(distDir, normalizedKey || 'index.html');
    if (fs.existsSync(diskPath) && fs.statSync(diskPath).isFile()) {
      const ext = path.extname(diskPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || defaultContentType;
      res.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': fs.statSync(diskPath).size,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable'
      });
      fs.createReadStream(diskPath).pipe(res);
      return;
    }
  }

  // 2. Если файл есть во встроенном бандле (EMBEDDED_FILES)
  const asset = EMBEDDED_FILES[normalizedKey];
  if (asset) {
    const buf = Buffer.from(asset.content, asset.encoding as BufferEncoding);
    res.writeHead(200, {
      'Content-Type': asset.contentType,
      'Content-Length': buf.length,
      'Cache-Control': normalizedKey.endsWith('.html') ? 'no-cache' : 'public, max-age=31536000, immutable'
    });
    res.end(buf);
    return;
  }

  // 3. SPA Fallback: отдаем index.html (с диска либо встроенный)
  if (distDir) {
    const indexPath = path.join(distDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      fs.createReadStream(indexPath).pipe(res);
      return;
    }
  }

  const embeddedIndex = EMBEDDED_FILES['index.html'];
  if (embeddedIndex) {
    const buf = Buffer.from(embeddedIndex.content, embeddedIndex.encoding as BufferEncoding);
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Length': buf.length,
      'Cache-Control': 'no-cache'
    });
    res.end(buf);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('MatchPulse: Файл не найден.');
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

  // 4. Статические файлы (с диска dist или встроенные)
  serveFile(res, reqUrl.pathname);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    const nextPort = PORT === 3000 ? 3001 : PORT + 1;
    console.warn(`\n[Внимание] Порт ${PORT} уже занят. Запуск на резервном порту ${nextPort}...`);
    server.listen(nextPort, '0.0.0.0', () => {
      echoRunningBanner(nextPort);
    });
  } else {
    console.error('Ошибка запуска сервера:', err);
  }
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
