import {createServer} from 'node:http';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {isRelayPath, relay, resolveRelayTarget} from './relay.mjs';

describe('relay paths', () => {
  it('only claims /ingest', () => {
    expect(isRelayPath('/ingest')).toBe(true);
    expect(isRelayPath('/ingest/e/')).toBe(true);
    expect(isRelayPath('/ingestion')).toBe(false);
    expect(isRelayPath('/tools')).toBe(false);
  });

  it('sends events to the API host and static files to the assets host', () => {
    expect(resolveRelayTarget('/ingest/e/', '?ip=0&compression=gzip-js')?.href).toBe('https://eu.i.posthog.com/e/?ip=0&compression=gzip-js');
    expect(resolveRelayTarget('/ingest/i/v0/e/', '')?.href).toBe('https://eu.i.posthog.com/i/v0/e/');
    expect(resolveRelayTarget('/ingest/static/array.js', '')?.href).toBe('https://eu-assets.i.posthog.com/static/array.js');
    expect(resolveRelayTarget('/ingest/array/phc_x/config.js', '')?.href).toBe('https://eu-assets.i.posthog.com/array/phc_x/config.js');
  });

  it('refuses anything that could reach another host or path', () => {
    for (const bad of ['/ingest/../admin', '/ingest//evil.example/x', '/ingest/%2e%2e/x', '/ingest/a b', '/ingest/\\evil', '/ingest/@evil.example']) {
      expect(resolveRelayTarget(bad, '')).toBeNull();
    }
    expect(resolveRelayTarget('/elsewhere', '')).toBeNull();
  });

  it('uses configured hosts', () => {
    expect(resolveRelayTarget('/ingest/e/', '', {apiHost: 'https://us.i.posthog.com'})?.origin).toBe('https://us.i.posthog.com');
  });
});

describe('relay forwarding', () => {
  let upstream;
  let upstreamUrl;
  let seen;
  let respondWith;
  let front;
  let frontUrl;

  beforeEach(async () => {
    seen = null;
    respondWith = {status: 200, headers: {'content-type': 'application/json', 'set-cookie': 'secret=1'}, body: '{"status":1}'};
    upstream = createServer((request, response) => {
      const chunks = [];
      request.on('data', (chunk) => chunks.push(chunk));
      request.on('end', () => {
        seen = {method: request.method, url: request.url, headers: request.headers, body: Buffer.concat(chunks).toString()};
        response.writeHead(respondWith.status, respondWith.headers);
        response.end(respondWith.body);
      });
    });
    await new Promise((done) => upstream.listen(0, '127.0.0.1', done));
    upstreamUrl = `http://127.0.0.1:${upstream.address().port}`;

    front = createServer((request, response) => {
      relay(request, response, new URL(request.url, 'http://localhost'), {apiHost: upstreamUrl, assetsHost: upstreamUrl});
    });
    await new Promise((done) => front.listen(0, '127.0.0.1', done));
    frontUrl = `http://127.0.0.1:${front.address().port}`;
  });

  afterEach(async () => {
    await Promise.all([new Promise((done) => upstream.close(done)), new Promise((done) => front.close(done))]);
  });

  it('forwards a POST with its body, content type and the visitor address, and strips cookies from the reply', async () => {
    const response = await fetch(`${frontUrl}/ingest/e/?ip=0`, {
      method: 'POST',
      body: 'data=abc',
      headers: {'content-type': 'application/x-www-form-urlencoded', cookie: 'tn-session=1', authorization: 'Bearer x', 'x-forwarded-for': '203.0.113.9, 10.0.0.1'},
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({status: 1});
    expect(response.headers.get('set-cookie')).toBeNull();
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(seen.method).toBe('POST');
    expect(seen.url).toBe('/e/?ip=0');
    expect(seen.body).toBe('data=abc');
    expect(seen.headers['content-type']).toBe('application/x-www-form-urlencoded');
    expect(seen.headers['x-forwarded-for']).toBe('203.0.113.9');
    expect(seen.headers.cookie).toBeUndefined();
    expect(seen.headers.authorization).toBeUndefined();
  });

  it('ignores a forwarded address that is not an IP', async () => {
    await fetch(`${frontUrl}/ingest/e/`, {method: 'POST', body: '{}', headers: {'x-forwarded-for': '<script>'}});
    expect(seen.headers['x-forwarded-for']).toMatch(/^[0-9a-f:.]+$/i);
    expect(seen.headers['x-forwarded-for']).not.toContain('script');
  });

  it('passes upstream errors through and answers 502 when the upstream is down', async () => {
    respondWith = {status: 400, headers: {'content-type': 'application/json'}, body: '{"error":"bad"}'};
    const bad = await fetch(`${frontUrl}/ingest/e/`, {method: 'POST', body: '{}'});
    expect(bad.status).toBe(400);

    await new Promise((done) => upstream.close(done));
    const down = await fetch(`${frontUrl}/ingest/e/`, {method: 'POST', body: '{}'});
    expect(down.status).toBe(502);
    upstream = createServer();
    await new Promise((done) => upstream.listen(0, '127.0.0.1', done));
  });

  it('rejects unsupported methods and oversized bodies', async () => {
    expect((await fetch(`${frontUrl}/ingest/e/`, {method: 'DELETE'})).status).toBe(405);
    expect((await fetch(`${frontUrl}/ingest/e/`, {method: 'POST', body: 'x'.repeat(1024 * 1024 + 10)})).status).toBe(413);
    expect(seen).toBeNull();
  });

  it('refuses paths outside the relay', async () => {
    expect((await fetch(`${frontUrl}/ingest/../etc/passwd`)).status).toBe(404);
  });
});
