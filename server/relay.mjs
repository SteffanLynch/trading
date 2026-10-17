import {Buffer} from 'node:buffer';

/**
 * A small same-origin relay to PostHog, mounted at /ingest by server.mjs.
 *
 * The browser talks to this site instead of posthog.com, so tracking blockers that match PostHog's hostnames do not
 * silently drop the events. It forwards to fixed PostHog hosts only (never a host taken from the request), passes
 * through the few request headers PostHog needs, adds the visitor's IP so the country can be worked out, and never
 * passes cookies in either direction.
 *
 * Paths: /ingest/static/* and /ingest/array/* go to the assets host; everything else goes to the API host.
 */
export const RELAY_PREFIX = '/ingest';

const DEFAULT_API_HOST = 'https://eu.i.posthog.com';
const DEFAULT_ASSETS_HOST = 'https://eu-assets.i.posthog.com';
const MAX_BODY_BYTES = 1024 * 1024;
const TIMEOUT_MS = 10_000;
const FORWARDED_HEADERS = ['content-type', 'content-encoding', 'accept', 'accept-language', 'user-agent'];
const METHODS = new Set(['GET', 'HEAD', 'POST']);

export function isRelayPath(pathname) {
  return pathname === RELAY_PREFIX || pathname.startsWith(`${RELAY_PREFIX}/`);
}

/** The PostHog URL a relay path maps to, or null if the path is not one the relay should forward. */
export function resolveRelayTarget(pathname, search = '', hosts = {}) {
  if (!isRelayPath(pathname)) return null;
  const rest = pathname.slice(RELAY_PREFIX.length) || '/';
  if (!/^\/[A-Za-z0-9_\-./]*$/.test(rest) || rest.includes('//') || rest.split('/').includes('..')) return null;
  const assets = rest.startsWith('/static/') || rest.startsWith('/array/');
  const origin = assets ? hosts.assetsHost ?? DEFAULT_ASSETS_HOST : hosts.apiHost ?? DEFAULT_API_HOST;
  const target = new URL(`${rest}${search}`, origin);
  return target.origin === new URL(origin).origin ? target : null;
}

function clientAddress(request) {
  // Behind Cloud Run's load balancer the visitor is the first address in X-Forwarded-For; otherwise it is the socket.
  const candidates = [String(request.headers['x-forwarded-for'] ?? '').split(',')[0].trim(), request.socket.remoteAddress ?? ''];
  return candidates.find((candidate) => /^[0-9a-fA-F:.]{3,45}$/.test(candidate)) ?? null;
}

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) return null;
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function reply(response, status, body) {
  response.writeHead(status, {'cache-control': 'no-store', 'content-type': 'application/json; charset=utf-8'});
  response.end(JSON.stringify(body));
}

/** Forwards one request. Never throws. `options.fetchImpl` and the host overrides exist for tests and local setups. */
export async function relay(request, response, url, options = {}) {
  const method = request.method ?? 'GET';
  const target = resolveRelayTarget(url.pathname, url.search, options);
  if (!target) return reply(response, 404, {error: 'not_found'});
  if (!METHODS.has(method)) return reply(response, 405, {error: 'method_not_allowed'});

  const headers = {};
  for (const name of FORWARDED_HEADERS) if (request.headers[name]) headers[name] = String(request.headers[name]);
  const address = clientAddress(request);
  if (address) headers['x-forwarded-for'] = address;

  let body;
  if (method === 'POST') {
    body = await readBody(request);
    if (body === null) return reply(response, 413, {error: 'payload_too_large'});
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const upstream = await (options.fetchImpl ?? fetch)(target, {method, headers, body, signal: controller.signal, redirect: 'manual'});
    const payload = Buffer.from(await upstream.arrayBuffer());
    const assets = target.pathname.startsWith('/static/') || target.pathname.startsWith('/array/');
    response.writeHead(upstream.status, {
      'content-type': upstream.headers.get('content-type') ?? 'application/octet-stream',
      'cache-control': assets && upstream.ok ? upstream.headers.get('cache-control') ?? 'public, max-age=3600' : 'no-store',
      'x-content-type-options': 'nosniff',
    });
    response.end(method === 'HEAD' ? undefined : payload);
  } catch (error) {
    console.error(`PostHog relay failed: ${error instanceof Error ? error.name : 'error'}`);
    if (!response.headersSent) reply(response, 502, {error: 'relay_unavailable'});
    else response.end();
  } finally {
    clearTimeout(timer);
  }
}
