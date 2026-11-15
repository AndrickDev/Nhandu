import { test, expect } from '@playwright/test';
import { resolveSiteUrl, resolveContactEmail, serializeJsonLd } from '../../lib/site.mjs';

test('fallback without env', () => {
  expect(resolveSiteUrl({})).toBe('https://nhandu.tech');
});

test('uses NEXT_PUBLIC_SITE_URL first', () => {
  expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'https://a.com/x', VERCEL_PROJECT_PRODUCTION_URL: 'b.com' })).toBe('https://a.com');
});

test('uses vercel production url without protocol', () => {
  expect(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'nhandu.tech' })).toBe('https://nhandu.tech');
});

test('invalid url', () => {
  expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'http://' })).toBe('https://nhandu.tech');
  expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: '   ' })).toBe('https://nhandu.tech');
  expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'lixo' })).toBe('https://nhandu.tech');
});

test('json-ld escape', () => {
  const out = serializeJsonLd({ x: '</script><b>' });
  expect(out).not.toContain('<');
  expect(JSON.parse(out)).toEqual({ x: '</script><b>' });
});

test('contact email fallback', () => {
  expect(resolveContactEmail({})).toBe('contato@nhandu.tech');
  expect(resolveContactEmail({ NEXT_PUBLIC_CONTATO_EMAIL: ' x@y.com ' })).toBe('x@y.com');
});
