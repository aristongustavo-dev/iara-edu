import { app, BrowserWindow, shell } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import { createReadStream } from 'node:fs';
import os from 'node:os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = app.isPackaged ? process.resourcesPath : path.resolve(__dirname, 'dist');
const PORT = 4180;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.map': 'application/json',
};

async function startServer() {
  let indexHtml = '';
  try {
    indexHtml = await fs.readFile(path.join(ROOT, 'index.html'));
  } catch (e) {
    // se nao tem dist, mostra erro
  }
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      let pathname = decodeURIComponent(url.pathname).replace(/\/+/g, '/').replace(/^\/+/, '');
      const filePath = path.join(ROOT, pathname || 'index.html');
      let stat;
      try { stat = await fs.stat(filePath); } catch { stat = null; }
      if (stat && stat.isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        createReadStream(filePath).pipe(res);
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(indexHtml || '<h1>Build nao encontrado. Execute "npm run build" antes.</h1>');
    } catch {
      res.writeHead(500);
      res.end('Erro');
    }
  });
  await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
  return server;
}

let mainWindow = null;

app.whenReady().then(async () => {
  const server = await startServer();
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'IARA EDU',
    backgroundColor: '#f8f9fc',
    icon: path.join(ROOT, 'icons', 'icon-512.png'),
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // abrir links externos no navegador do sistema
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url);
    return { action: 'deny' };
  });

  await mainWindow.loadURL(`http://localhost:${PORT}/`);
  server.unref();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      app.emit('ready-readd');
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// se o app foi "reativado" no mac (evita duplicacao), apenas cria a janela de novo via whenReady nao disparando - simplificado para demo
app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    if (!navigationUrl.startsWith('http://localhost')) {
      event.preventDefault();
      if (navigationUrl.startsWith('http')) shell.openExternal(navigationUrl);
    }
  });
});