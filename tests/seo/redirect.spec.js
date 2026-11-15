import { test, expect } from '@playwright/test';
import { request } from 'node:http';
import { productionRedirects } from '../../lib/site.mjs';

function get(path, host) {
  return new Promise((resolve, reject) => {
    const req = request({ host: 'localhost', port: 3200, path, headers: { host } }, (res) => {
      res.resume();
      resolve({ statusCode: res.statusCode, headers: res.headers });
    });
    req.on('error', reject);
    req.end();
  });
}

test('config: sem produção não redireciona', () => {
  expect(productionRedirects({ vercelEnv: 'preview', site: 'https://nhandu.tech' })).toEqual([]);
  expect(productionRedirects({ vercelEnv: undefined, site: 'https://nhandu.tech' })).toEqual([]);
});

test('config: sem loop', () => {
  expect(productionRedirects({ vercelEnv: 'production', site: 'https://nhanduproject.vercel.app' })).toEqual([]);
  expect(productionRedirects({ vercelEnv: 'production', site: 'http://localhost:3000' })).toEqual([]);
});

test('config: produção', () => {
  const rules = productionRedirects({ vercelEnv: 'production', site: 'https://nhandu.tech' });
  expect(rules).toHaveLength(1);
  expect(rules[0].destination).toBe('https://nhandu.tech/:path*');
  expect(rules[0].permanent).toBe(true);
  const re = new RegExp('^' + rules[0].has[0].value + '$');
  expect(re.test('nhanduproject.vercel.app')).toBe(true);
  expect(re.test('nhandu.tech')).toBe(false);
});

test('servidor: host vercel.app recebe 308', async () => {
  const res = await get('/termos?x=1', 'nhanduproject.vercel.app');
  expect(res.statusCode).toBe(308);
  expect(res.headers.location).toBe('https://nhandu.tech/termos?x=1');
});

test('servidor: localhost não redireciona', async () => {
  const res = await get('/termos?x=1', 'localhost:3200');
  expect(res.statusCode).toBe(200);
});
