import { test, expect } from '@playwright/test';

const HOME = 'https://nhandu.tech/';
const PAGES = [
  ['/', HOME],
  ['/privacidade', 'https://nhandu.tech/privacidade'],
  ['/termos', 'https://nhandu.tech/termos'],
];

async function meta(page, sel) {
  const el = page.locator(sel);
  return (await el.getAttribute('content')) ?? (await el.getAttribute('href'));
}

test('home title e description', async ({ page }) => {
  await page.goto('/');
  const title = await page.title();
  expect(title.length).toBeLessThanOrEqual(60);
  expect(title).toContain('WhatsApp');
  expect(title).toMatch(/Nhandu$/);
  const description = await meta(page, 'meta[name="description"]');
  expect(description.length).toBeGreaterThanOrEqual(120);
  expect(description.length).toBeLessThanOrEqual(160);
  expect(description).toContain('WhatsApp');
});

test('canonical', async ({ page }) => {
  for (const [path, expected] of PAGES) {
    await page.goto(path);
    const href = await meta(page, 'link[rel="canonical"]');
    expect(new URL(href).href).toBe(expected);
  }
  for (const path of ['/demo/nutricao', '/briefing/nutricao']) {
    await page.goto(path);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
    expect(await meta(page, 'meta[name="robots"]')).toContain('noindex');
  }
});

test('open graph', async ({ page }) => {
  for (const [path, expected] of PAGES) {
    await page.goto(path);
    expect(new URL(await meta(page, 'meta[property="og:url"]')).href).toBe(expected);
    expect(await meta(page, 'meta[property="og:image"]')).toMatch(/\/og\.png$/);
    expect(await meta(page, 'meta[property="og:image:width"]')).toBe('1200');
    expect(await meta(page, 'meta[property="og:image:height"]')).toBe('630');
  }
});

test('legal descriptions', async ({ page }) => {
  const d = {};
  for (const path of ['/', '/privacidade', '/termos']) {
    await page.goto(path);
    d[path] = await meta(page, 'meta[name="description"]');
  }
  for (const path of ['/privacidade', '/termos']) {
    expect(d[path].length).toBeGreaterThanOrEqual(70);
    expect(d[path].length).toBeLessThanOrEqual(160);
    expect(d[path]).not.toBe(d['/']);
  }
  expect(d['/privacidade']).not.toBe(d['/termos']);
});

test('json-ld', async ({ page, request }) => {
  await page.goto('/');
  const scripts = page.locator('script[type="application/ld+json"]');
  await expect(scripts).toHaveCount(1);
  const data = JSON.parse(await scripts.textContent());
  const graph = data['@graph'];
  const org = graph.find((i) => i['@type'] === 'Organization');
  expect(org.name).toBeTruthy();
  expect(org.url).toBeTruthy();
  expect(org.logo).toBeTruthy();
  const site = graph.find((i) => i['@type'] === 'WebSite');
  expect(site.url).toBeTruthy();
  expect(site.inLanguage).toBe('pt-BR');
  const service = graph.find((i) => i['@type'] === 'Service');
  expect(service.provider['@id']).toBe(org['@id']);

  const html = await (await request.get('/')).text();
  const m = html.match(/application\/ld\+json">([\s\S]*?)<\/script>/);
  expect(m).not.toBeNull();
  expect(m[1]).not.toContain('<');
});
