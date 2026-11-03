const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../public');
const origin = 'https://outlinego.com';
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const fileFor = route => path.join(root, route.endsWith('/') ? route + 'index.html' : route);
const report = { origin, checkedAt: new Date().toISOString(), resources: [], videoRanges: [] };

async function fetchWithTimeout(route, options = {}) {
  return fetch(origin + route, { ...options, signal: AbortSignal.timeout(60000) });
}
async function verify(route) {
  const response = await fetchWithTimeout(route);
  assert.equal(response.status, 200, route + ' status');
  const actual = Buffer.from(await response.arrayBuffer());
  const expected = fs.readFileSync(fileFor(route));
  assert.equal(hash(actual), hash(expected), route + ' differs from local file');
  if (route.endsWith('.mp4')) assert.equal(response.headers.get('content-type')?.split(';')[0], 'video/mp4', route + ' MIME');
  report.resources.push({ route, status: response.status, bytes: actual.length, sha256: hash(actual) });
}
async function main() {
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  const pages = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => new URL(match[1]).pathname);
  assert.equal(pages.length, 12);
  const resources = new Set([...pages, '/sitemap.xml', '/robots.txt',
    '/privacy.html', '/terms.html', '/measurement-notice.html',
    '/pl/prywatnosc/', '/pl/regulamin/', '/pl/ograniczenia-pomiarow/']);
  for (const route of pages) {
    const html = fs.readFileSync(fileFor(route), 'utf8');
    for (const tag of html.match(/<(?:a|img|source|link|script|video)\b[^>]*>/g) || []) {
      for (const match of tag.matchAll(/\b(?:href|src|poster|srcset)="([^"]+)"/g)) {
        const targets = match[0].startsWith('srcset=') ? match[1].split(',').map(value => value.trim().split(' ')[0]) : [match[1]];
        for (const target of targets) {
          const url = new URL(target.replaceAll('&amp;', '&'), origin + route);
          if (url.origin === origin) resources.add(decodeURIComponent(url.pathname));
        }
      }
    }
  }
  const pending = [...resources];
  await Promise.all(Array.from({ length: 5 }, async () => {
    while (pending.length) await verify(pending.shift());
  }));
  for (const route of resources) if (route.endsWith('.mp4')) {
    const response = await fetchWithTimeout(route, { headers: { Range: 'bytes=0-127' } });
    assert.equal(response.status, 206, route + ' byte range');
    assert.equal(response.headers.get('content-length'), '128');
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(hash(bytes), hash(fs.readFileSync(fileFor(route)).subarray(0, 128)));
    report.videoRanges.push({ route, status: response.status, contentRange: response.headers.get('content-range') });
  }
  assert.equal(report.videoRanges.length, 12);
  for (const route of ['/', '/index.html']) {
    const response = await fetchWithTimeout(route, { redirect: 'manual' });
    assert.equal(response.status, 301);
    assert.equal(new URL(response.headers.get('location'), origin).pathname, '/en/');
  }
  assert.equal((await fetchWithTimeout('/missing-page-test/')).status, 404);
  report.success = true;
  report.pages = pages.length;
  report.resources.sort((a, b) => a.route.localeCompare(b.route));
  const output = path.resolve(__dirname, `../artifacts/www-live-verification-${report.checkedAt.slice(0, 10)}.json`);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
  console.log(`Live verified: ${pages.length} pages, ${resources.size} resources with matching SHA-256, 12 MP4 byte ranges, 301 redirects and 404.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
