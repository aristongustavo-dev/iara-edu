import http from 'node:http';
import { promises as fs } from 'node:fs';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, 'dist');
const PORT = Number(process.env.PORT) || 4173;
const HOST = process.env.HOST || '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json',
};

const indexPath = path.join(ROOT, 'index.html');

let indexCache = { mtime: 0, html: '' };
const getIndexHtml = async () => {
  try {
    const st = await fs.stat(indexPath);
    if (st.mtimeMs !== indexCache.mtime) {
      indexCache = { mtime: st.mtimeMs, html: await fs.readFile(indexPath, 'utf8') };
    }
  } catch {
    // fallback para o Ãºltimo conteÃºdo conhecido
  }
  return indexCache.html;
};

// ===== API de sincronizaÃ§Ã£o (backend leve, sem dependÃªncias) =====
// Guarda a versÃ£o "remota" das contas (users) num arquivo JSON no servidor.
// Os aparelhos fazem merge por e-mail, vencendo a versÃ£o mais recente.

const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.resolve(__dirname, 'server-data');
const DATA_FILE = path.join(DATA_DIR, 'api-db.json');
await fs.mkdir(DATA_DIR, { recursive: true });

const stamp = (u) => Number(u.updated_at) || 0;

const mergeUsers = (local = [], remote = []) => {
  const map = new Map();
  local.forEach((u) => map.set(u.email, u));
  remote.forEach((ru) => {
    const cur = map.get(ru.email);
    if (!cur || stamp(ru) > stamp(cur)) map.set(ru.email, ru);
  });
  return Array.from(map.values());
};

let writeQueue = Promise.resolve();
const writeRemote = (data) => {
  writeQueue = writeQueue.then(async () => {
    const tmp = `${DATA_FILE}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data));
    await fs.rename(tmp, DATA_FILE);
  });
  return writeQueue;
};

const readRemote = async () => {
  try {
    return JSON.parse(await fs.readFile(DATA_FILE, 'utf8'));
  } catch {
    return { users: [], updatedAt: 0 };
  }
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let pathname = decodeURIComponent(url.pathname);

    // ===== API =====
    if (pathname.startsWith('/api/')) {
      if (req.method === 'OPTIONS') {
        res.writeHead(204, CORS);
        res.end();
        return;
      }
      if (pathname === '/api/db' && req.method === 'GET') {
        const remote = await readRemote();
        res.writeHead(200, { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify(remote));
        return;
      }
      if (pathname === '/api/sync' && req.method === 'POST') {
        let body = '';
        for await (const chunk of req) body += chunk;
        try {
          const payload = JSON.parse(body || '{}');
          const remote = await readRemote();
          const merged = mergeUsers(remote.users, payload.users || []);
          const updatedAt = Date.now();
          await writeRemote({ users: merged, updatedAt });
          res.writeHead(200, { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
          res.end(JSON.stringify({ users: merged, updatedAt }));
        } catch (e) {
          res.writeHead(400, { ...CORS, 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ error: 'requisiÃ§Ã£o invÃ¡lida' }));
        }
        return;
      }
      res.writeHead(404, { ...CORS, 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('api 404');
      return;
    }

    // evita path traversal
    if (pathname.includes('..')) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    // remove barras duplicadas
    pathname = pathname.replace(/\/+/g, '/');

    let filePath = path.join(ROOT, pathname);
    let ext = path.extname(filePath).toLowerCase();

    // se Ã© um diretÃ³rio, procura index.html
    let stat;
    try {
      stat = await fs.stat(filePath);
    } catch {
      stat = null;
    }

    if (stat && stat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      ext = '.html';
      try {
        stat = await fs.stat(filePath);
      } catch {
        stat = null;
      }
    }

    if (stat && stat.isFile() && ext) {
      const mime = MIME[ext] || 'application/octet-stream';
      const cache = ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable';
      res.writeHead(200, {
        'Content-Type': mime,
        'Cache-Control': cache,
        'Service-Worker-Allowed': '/',
      });
      createReadStream(filePath).pipe(res);
      return;
    }

    // fallback SPA: serve index.html para qualquer rota (rotas do react-router)
    if (!ext || !pathname.includes('.')) {
      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Service-Worker-Allowed': '/',
      });
      res.end(await getIndexHtml());
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 - Not Found');
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('500 - Erro interno');
  }
});

server.listen(PORT, HOST, () => {
  const nets = os.networkInterfaces();
  const addresses = [];
  Object.keys(nets).forEach((name) => {
    (nets[name] || []).forEach((net) => {
      if (net.family === 'IPv4' && !net.internal) addresses.push(net.address);
    });
  });
  console.log('');
  console.log('   ðŸ¦Š  IARA EDU â€” servidor pronto!');
  console.log('   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€');
  console.log(`   âžœ Local:    http://localhost:${PORT}`);
  addresses.forEach((ip) => {
    console.log(`   âžœ Rede:     http://${ip}:${PORT}`);
  });
  console.log('');
  console.log('   Na rede, abra o endereÃ§o "Rede" em qualquer');
  console.log('   celular/tablet para acessar. Para instalar como app,');
  console.log('   abra em um navegador (Chrome/Edge) e toque em "Instalar".');
  console.log('');
});
