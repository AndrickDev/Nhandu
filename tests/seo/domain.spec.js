import { test, expect } from '@playwright/test';
import { resolveSiteUrl, resolveContactEmail, resolveLegalName, serializeJsonLd } from '../../lib/site.mjs';

test('accepts localhost', () => {
  expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'http://localhost:3000' })).toBe('http://localhost:3000');
});

test('scheme is case-insensitive', () => {
  expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'HTTPS://nhandu.tech/x' })).toBe('https://nhandu.tech');
  // host diferente do fallback, para o teste não passar por coincidência
  expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'HTTP://a.com/x' })).toBe('http://a.com');
});

test('legal name only when configured', () => {
  expect(resolveLegalName({})).toBeNull();
  expect(resolveLegalName({ NEXT_PUBLIC_RAZAO_SOCIAL: '   ' })).toBeNull();
  expect(resolveLegalName({ NEXT_PUBLIC_RAZAO_SOCIAL: '  X Ltda ' })).toBe('X Ltda');
});

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
