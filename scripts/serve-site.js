#!/usr/bin/env node
/**
 * Local preview for site/ — mirrors GitHub Pages assembly (site + omakase-skill.zip).
 *
 * Run: npm run site
 */

const fs = require('fs');
const http = require('http');
const path = require('path');

const root = path.resolve(__dirname, '..');
const siteDir = path.resolve(root, 'site');
const zipPath = path.join(root, 'dist', 'omakase-skill.zip');
const port = Number(process.env.PORT) || 4173;

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.zip': 'application/zip',
};

function resolveSitePath(urlPath) {
  const rel = decodeURIComponent(urlPath).replace(/^\/+/, '');
  const file = path.resolve(siteDir, rel || '.');
  const siteRoot = siteDir + path.sep;
  if (file !== siteDir && !file.startsWith(siteRoot)) return null;
  return file;
}

function sendText(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(body);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);
  const pathname = url.pathname;

  if (pathname === '/omakase-skill.zip') {
    if (!fs.existsSync(zipPath)) {
      sendText(res, 404, 'omakase-skill.zip not found — run npm run build first\n');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME['.zip'] });
    fs.createReadStream(zipPath).pipe(res);
    return;
  }

  let file = resolveSitePath(pathname);
  if (!file) {
    sendText(res, 403, 'Forbidden\n');
    return;
  }

  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    file = path.join(file, 'index.html');
  }

  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    sendText(res, 404, 'Not found\n');
    return;
  }

  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Omakase site → http://127.0.0.1:${port}`);
  if (!fs.existsSync(zipPath)) {
    console.log('Note: dist/omakase-skill.zip missing — download link 404s until you run npm run build');
  }
});