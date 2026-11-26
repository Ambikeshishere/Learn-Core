#!/usr/bin/env node
/** Tiny zero-dependency static server for local prototype review. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 4173);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml'
};

http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  const relative = url === '/' ? 'index.html' : url.replace(/^\/+/, '');
  const file = path.resolve(root, relative);
  if(!file.startsWith(root)){ res.writeHead(403).end('Forbidden'); return; }
  fs.readFile(file, (error, data) => {
    if(error){ res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(port, () => console.log(`AIR Ladder running at http://localhost:${port}`));
