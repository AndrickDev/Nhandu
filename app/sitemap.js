import { SITE } from '../lib/site.mjs';

const ROUTES = [
  ['/', '2026-11-14', 1],
  ['/privacidade', '2026-11-01', 0.3],
  ['/termos', '2026-11-01', 0.3],
];

export default function sitemap() {
  return ROUTES.map(([path, date, priority]) => ({
    url: path === '/' ? SITE : SITE + path,
    lastModified: new Date(date),
    changeFrequency: 'monthly',
    priority,
  }));
}
