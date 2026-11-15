// Fonte única do endereço do site, do e-mail de contato e do Open Graph base.
// ESM puro, sem imports do Next: também é carregado pelo next.config.mjs e pelos testes em Node.

const DEFAULT_SITE = 'https://nhandu.tech';

function toOrigin(raw) {
  const value = typeof raw === 'string' ? raw.trim() : '';
  if (!value) return null;
  try {
    const url = new URL(/^https?:\/\//.test(value) ? value : `https://${value}`);
    return url.hostname.includes('.') ? url.origin : null;
  } catch {
    return null;
  }
}

// Variável própria > domínio de produção da Vercel > domínio final.
export function resolveSiteUrl(env) {
  return toOrigin(env.NEXT_PUBLIC_SITE_URL) || toOrigin(env.VERCEL_PROJECT_PRODUCTION_URL) || DEFAULT_SITE;
}

export function resolveContactEmail(env) {
  const value = typeof env.NEXT_PUBLIC_CONTATO_EMAIL === 'string' ? env.NEXT_PUBLIC_CONTATO_EMAIL.trim() : '';
  return value || 'contato@nhandu.tech';
}

export const SITE = resolveSiteUrl(process.env);
export const SITE_NAME = 'Nhandu';
export const CONTACT_EMAIL = resolveContactEmail(process.env);

export function serializeJsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

export const OG_BASE = {
  siteName: 'Nhandu',
  locale: 'pt_BR',
  type: 'website',
  images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Nhandu — Nenhum cliente sem resposta' }],
};

// Em produção, qualquer host *.vercel.app redireciona (308) para o domínio final.
// Sem regra em preview/dev e quando o próprio site é um *.vercel.app (evita loop).
export function productionRedirects({ vercelEnv, site }) {
  if (vercelEnv !== 'production') return [];
  let host = '';
  try {
    host = new URL(site).hostname;
  } catch {
    return [];
  }
  if (host.endsWith('.vercel.app')) return [];
  return [
    {
      source: '/:path*',
      has: [{ type: 'host', value: '(?<sub>.+)\\.vercel\\.app' }],
      destination: site + '/:path*',
      permanent: true,
    },
  ];
}
