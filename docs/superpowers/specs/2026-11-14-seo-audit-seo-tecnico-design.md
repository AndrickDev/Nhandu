# Spec — seo-audit: SEO técnico no domínio nhandu.tech

Status: decidido por delegação em 2026-11-14 (autorização: invocação `/factory` do usuário; domínio informado pelo usuário: "nosso dominio é nhandu.tech")
Jira: — (sem Jira) · Research Brief: .work/seo-audit/04-research-brief.md · Audit: .work/seo-audit/01-audit.md

## Intenção e porquê

O audit mostrou que o site não tem robots.txt, sitemap, canonical nem dados estruturados. Ele também aparece em duas URLs (`nhandu.tech` e `nhanduproject.vercel.app`), e o código ainda aponta para `nhandu.com.br`, que é de outra empresa. Esta fase corrige a base técnica para o Google rastrear, indexar e entender o site no domínio certo. Ela é a pré-condição das fases de conteúdo (páginas por segmento) e de autoridade.

## Objetivos, não-objetivos, anti-objetivos

- **Objetivos:** domínio canônico único (`https://nhandu.tech`); robots e sitemap; canonical, description e `og:url` próprios por página indexável; JSON-LD de organização, site e serviço; LCP do hero sem atraso de opacidade; testes automáticos que travam tudo isso.
- **Não-objetivos:** páginas por segmento, blog, mudança de texto visível (H1, headings), imagens WebP/lazy no JSX gerado, ações em contas (Search Console, Vercel, DNS).
- **Anti-objetivos:** editar `components/NhanduPage.jsx` ou `app/page.css` (gerados); dependência nova; FAQPage (rich result descontinuado pelo Google em 2026-05-07).

## Restrições

- Next 15.5.29 App Router em `.jsx/.js`; sem TypeScript, sem lint/typecheck no `package.json`.
- `next.config.mjs` roda como ESM nativo: o módulo de URL do site é `lib/site.mjs`.
- Builds compartilham `.next`: tarefas que rodam build vão em ondas separadas.

## Decisões tomadas (do usuário)

- Domínio canônico: `nhandu.tech` (chat, 2026-11-14).
- Auditar primeiro e melhorar depois (pedido original).

## Decisões delegadas (do coordenador, marcadas como tal)

1. **`lib/site.mjs`** é a fonte única: `SITE` = origem de `NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → `https://nhandu.tech`; exporta também `SITE_NAME = 'Nhandu'`, `OG_BASE` (siteName, locale, type, images) e `CONTACT_EMAIL` (`NEXT_PUBLIC_CONTATO_EMAIL` → `contato@nhandu.tech`).
2. **Metadata por página:** o layout mantém só os padrões globais (sem canonical). Home, privacidade e termos declaram `description`, `alternates.canonical` e `openGraph: { ...OG_BASE, url, title, description }`. Demo e briefing ficam como estão (noindex, sem canonical).
3. **Copy de metadata da home** (derivada do texto atual): title `Agente de IA no WhatsApp para atender e agendar 24h | Nhandu` (60); description `A Nhandu instala em até 14 dias um agente de IA que atende, qualifica e agenda pelo WhatsApp 24h, com página de conversão e automação até o CRM.` (144).
4. **robots:** `allow: '/'`, `disallow: '/api/'`, `sitemap: SITE + '/sitemap.xml'`. Briefing e demo continuam rastreáveis para o Google ler o `noindex`.
5. **sitemap:** `/`, `/privacidade`, `/termos`, com `lastModified` fixo por rota (constante no arquivo, não `new Date()`, para não mentir data a cada build).
6. **JSON-LD** na home (`app/page.jsx`), um `<script>` com `@graph`: `Organization` (`@id SITE#org`, name, legalName "Nhandu Tecnologia", url, logo `SITE/apple-icon.png`, email), `WebSite` (url, name, inLanguage pt-BR, publisher → org), `Service` (name, serviceType, description, areaServed Brasil, provider → org). Escape de `<`.
7. **Redirect** em `next.config.mjs`: quando `VERCEL_ENV === 'production'` no build e `SITE` não é `*.vercel.app`, todo host `*.vercel.app` recebe 308 para `SITE/:path*`. Previews (`VERCEL_ENV=preview`) não mudam (a Vercel já manda noindex neles).
8. **LCP:** override em `app/fonts.css` (arquivo de ajustes de produção que já existe) com especificidade maior que `app/page.css`: `.hero .h1 span` e `.hero .hero-p` animam só `transform` (`@keyframes riseIn`). O bloco `prefers-reduced-motion: reduce` do `page.css` continua desligando tudo.
9. **Testes:** suíte nova `tests/seo/` com config própria (`playwright.seo.config.js`, porta 3200, `reuseExistingServer: false`, build com `VERCEL_ENV=production`) e script `npm run test:seo`. A suíte mobile não muda.
10. **E-mail padrão** passa para `contato@nhandu.tech` (hipótese: a caixa existe; produção pode definir `NEXT_PUBLIC_CONTATO_EMAIL`). Exemplo de remetente no `.env.example`: `site@nhandu.tech`.

## Design

- **Componentes:** `lib/site.mjs` (novo) → importado por `app/layout.jsx`, `app/page.jsx`, `app/privacidade/page.jsx`, `app/termos/page.jsx`, `app/robots.js` (novo), `app/sitemap.js` (novo), `components/Legal.jsx`, `next.config.mjs` (novo).
- **Contratos públicos:** `GET /robots.txt`, `GET /sitemap.xml`, 308 de `*.vercel.app` em produção.
- **Erros:** `SITE` inválido cai no fallback (`new URL` em try/catch, como hoje).
- **Segurança:** JSON-LD só com constantes e env públicas; escape de `<`. Redirect com regex ancorada de host, sem loop (destino fora de `vercel.app`).

## Critérios de aceite

| ID | Critério (observável) | Origem | Verificação |
|---|---|---|---|
| AC-1 | Home: `<title>` com ≤ 60 caracteres, contém "WhatsApp" e termina com "Nhandu"; `meta description` com 120–160 caracteres e contém "WhatsApp" | proposto (G1) | `tests/seo/metadata.spec.js` |
| AC-2 | Canonical: `/` → `https://nhandu.tech` (com ou sem `/` final), `/privacidade` → `https://nhandu.tech/privacidade`, `/termos` → `https://nhandu.tech/termos`; `/demo/nutricao` e `/briefing/nutricao` seguem `noindex` e sem canonical | proposto (G1) | `metadata.spec.js` |
| AC-3 | Em `/`, `/privacidade` e `/termos`, `og:url` = canonical e `og:image` presente (1200×630) | proposto (G1) | `metadata.spec.js` |
| AC-4 | `/privacidade` e `/termos` têm descriptions próprias (diferentes entre si e da home, 70–160 caracteres) | proposto (G1) | `metadata.spec.js` |
| AC-5 | `GET /robots.txt` → 200 com `Allow: /`, `Disallow: /api/` e `Sitemap: https://nhandu.tech/sitemap.xml` | proposto (G1) | `tests/seo/crawl.spec.js` |
| AC-6 | `GET /sitemap.xml` → 200 com exatamente as URLs `https://nhandu.tech`, `/privacidade`, `/termos`; sem `/demo`, `/briefing`, `/api` | proposto (G1) | `crawl.spec.js` |
| AC-7 | Home tem exatamente um `script[type="application/ld+json"]` que faz `JSON.parse`, com `@graph` contendo `Organization` (name, url, logo), `WebSite` (url, inLanguage `pt-BR`) e `Service` (provider → `@id` da Organization); o HTML bruto não contém `</` dentro do JSON | proposto (G1) | `metadata.spec.js` |
| AC-8 | Sem env, `SITE` = `https://nhandu.tech` e e-mail padrão = `contato@nhandu.tech`; `git grep -n "nhandu.com.br" -- . ':!docs/superpowers'` sem resultados | pedido (domínio) | `tests/seo/domain.spec.js` + comando |
| AC-9 | Build de produção (`VERCEL_ENV=production`): request com host `nhanduproject.vercel.app` → 308 para `https://nhandu.tech/<mesmo caminho>`; host `localhost` → 200. Config com `VERCEL_ENV=preview` ou sem env → nenhum redirect | proposto (G1) | `tests/seo/redirect.spec.js` (+ `curl -H Host` no R8 se o Playwright não aceitar Host) |
| AC-10 | Hero: animações de `.hero .h1 span` e `.hero .hero-p` não alteram `opacity` (opacidade 1 no primeiro frame, com `prefers-reduced-motion: no-preference`); Lighthouse mobile local com LCP < 2,5 s | audit T5 | `tests/seo/hero.spec.js` + Lighthouse no R8 |
| AC-11 | Sem regressão: `npm run build` verde; `test:mobile` (layout + states, Chrome) verde; `test:seo` verde | proposto (G1) | comandos |
| AC-12 | README: domínio `nhandu.tech`, `npm run test:seo`, e os passos manuais pós-deploy (Search Console + sitemap, `www` na Vercel, `NEXT_PUBLIC_WHATSAPP`/`NEXT_PUBLIC_CNPJ`/`NEXT_PUBLIC_CONTATO_EMAIL` em produção) | proposto (G1) | leitura |

## Riscos e mitigação

- **Redirect quebra testes contra produção** (`BASE_URL=https://nhanduproject.vercel.app`): README passa a usar `https://nhandu.tech`.
- **`VERCEL_PROJECT_PRODUCTION_URL` mudar para outro domínio:** `NEXT_PUBLIC_SITE_URL` vence; documentado.
- **E-mail `contato@nhandu.tech` inexistente:** sinalizado no relatório; env sobrescreve.
- **LCP de laboratório ≠ campo:** só o Search Console (CrUX) confirma depois do deploy.
