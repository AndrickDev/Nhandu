import { test, expect } from '@playwright/test';

test('robots', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  const text = await res.text();
  expect(text).toContain('Allow: /');
  expect(text).toContain('Disallow: /api/');
  expect(text).toContain('Sitemap: https://nhandu.tech/sitemap.xml');
});

test('sitemap', async ({ request }) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).href).sort();
  expect(locs).toEqual(['https://nhandu.tech/', 'https://nhandu.tech/privacidade', 'https://nhandu.tech/termos']);
  for (const loc of locs) {
    expect(loc).not.toMatch(/\/(demo|briefing|api)/);
  }
});
