import {createReadStream} from 'node:fs';
import {access, stat} from 'node:fs/promises';
import {createServer} from 'node:http';
import {extname, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(fileURLToPath(new URL('./build', import.meta.url)));
const port = Number.parseInt(process.env.PORT ?? '3000', 10);
const host = process.env.HOST ?? '0.0.0.0';

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
};

async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

async function resolveRequest(pathname) {
  const decoded = decodeURIComponent(pathname);
  const requested = resolve(root, `.${decoded}`);

  if (requested !== root && !requested.startsWith(`${root}${sep}`)) return null;

  const clean = requested.endsWith(sep) ? requested.slice(0, -1) : requested;
  const candidates = [
    requested,
    `${clean}.html`,
    resolve(requested, 'index.html'),
  ];

  for (const candidate of candidates) {
    if (await isFile(candidate)) return candidate;
  }

  return null;
}

const server = createServer(async (request, response) => {
  if (!request.url || !['GET', 'HEAD'].includes(request.method ?? 'GET')) {
    response.writeHead(405, {'content-type': 'text/plain; charset=utf-8'});
    response.end('Method not allowed');
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host ?? 'localhost'}`);

  if (url.pathname === '/health') {
    response.writeHead(200, {
      'cache-control': 'no-store',
      'content-type': 'application/json; charset=utf-8',
    });
    response.end(request.method === 'HEAD' ? undefined : JSON.stringify({status: 'ok'}));
    return;
  }

  let file;
  try {
    file = await resolveRequest(url.pathname);
  } catch {
    file = null;
  }

  const status = file ? 200 : 404;
  const selected = file ?? resolve(root, '404.html');

  try {
    await access(selected);
    const extension = extname(selected).toLowerCase();
    const immutable = url.pathname.startsWith('/assets/');
    response.writeHead(status, {
      'cache-control': immutable
        ? 'public, max-age=31536000, immutable'
        : 'public, max-age=0, must-revalidate',
      'content-type': contentTypes[extension] ?? 'application/octet-stream',
      'x-content-type-options': 'nosniff',
    });
    if (request.method === 'HEAD') response.end();
    else createReadStream(selected).pipe(response);
  } catch {
    response.writeHead(404, {'content-type': 'text/plain; charset=utf-8'});
    response.end('Not found');
  }
});

server.listen(port, host, () => {
  console.log(`Trading Notes is listening on http://${host}:${port}`);
});

function shutdown() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
