# Plano — seo-audit: SEO técnico no domínio nhandu.tech

> Execução: P7 de docs/workflows/planning-workflow.md (ondas; implementadores não commitam; o controlador commita por tarefa).

Status: decidido por delegação em 2026-11-14 (invocação `/factory`; ver `.work/seo-audit/00-state.md`). plan-reviewer: 0 CRITICAL/HIGH; 3 MEDIUM + 7 LOW procedentes, todos incorporados antes do G2.
Jira: — (sem Jira) · Classificação: projeto
Spec: docs/superpowers/specs/2026-11-14-seo-audit-seo-tecnico-design.md (decidida por delegação em 2026-11-14)
Risco estimado: 3 → N de review estimado: 4 (o R1 recalcula com o diff real)

**Goal:** Tornar o site rastreável, indexável e consistente em `https://nhandu.tech`, com testes automáticos de SEO.
**Architecture:** `lib/site.mjs` é a fonte única da URL do site, do e-mail de contato e do Open Graph base; páginas declaram a própria metadata a partir dele; `app/robots.js`/`app/sitemap.js` são metadata routes estáticas; `next.config.mjs` redireciona `*.vercel.app` em produção; um override em `app/fonts.css` tira a opacidade das animações do hero.
**Tech Stack:** next@15.5.29 (Metadata API, metadata routes, `redirects()` — doc 15.5.28 via Context7), react@19.1, @playwright/test@1.65.

## Global Constraints
- Sem dependência nova. Não editar `components/NhanduPage.jsx` nem `app/page.css` (gerados por `tools/convert.py`).
- Toda URL absoluta do site vem de `lib/site.mjs` (nada de domínio escrito à mão fora dele, do README, do `.env.example`, de `playwright.seo.config.js` e de `tests/seo/**`, onde os literais são as expectativas dos testes).
- `lib/site.mjs` é ESM puro sem imports do Next (é carregado pelo `next.config.mjs` em Node).
- Imports de `lib/site.mjs` usam caminho relativo ao arquivo, com extensão: `'../lib/site.mjs'` em `app/layout.jsx`, `app/page.jsx`, `app/robots.js`, `app/sitemap.js` e `components/Legal.jsx`; `'../../lib/site.mjs'` em `app/privacidade/page.jsx`, `app/termos/page.jsx` e `tests/seo/*.spec.js`; `'./lib/site.mjs'` em `next.config.mjs`.
- Custo aceito: cada `npm run test:seo` faz `next build` (webServer), inclusive para specs unitários.
- Nenhum teste existente é alterado, pulado ou relaxado.

## Critérios de aceite
| ID | Critério (observável) | Origem | Verificação |
|---|---|---|---|
| AC-1 | Home: `<title>` ≤ 60 caracteres, contém "WhatsApp", termina com "Nhandu"; description 120–160 caracteres com "WhatsApp" | proposto (G1) | metadata.spec.js › home title e description |
| AC-2 | Canonical `/` → `https://nhandu.tech` (barra final opcional), `/privacidade`, `/termos` → URL própria; demo e briefing com noindex e sem canonical | proposto (G1) | metadata.spec.js › canonical |
| AC-3 | `/`, `/privacidade`, `/termos`: `og:url` = canonical e `og:image` presente com 1200×630 | proposto (G1) | metadata.spec.js › open graph |
| AC-4 | `/privacidade` e `/termos`: descriptions próprias (distintas entre si e da home; 70–160) | proposto (G1) | metadata.spec.js › legal descriptions |
| AC-5 | `/robots.txt` 200 com `Allow: /`, `Disallow: /api/`, `Sitemap: https://nhandu.tech/sitemap.xml` | proposto (G1) | crawl.spec.js › robots |
| AC-6 | `/sitemap.xml` 200 com exatamente 3 `<loc>`: `https://nhandu.tech` (ou com `/`), `https://nhandu.tech/privacidade`, `https://nhandu.tech/termos` | proposto (G1) | crawl.spec.js › sitemap |
| AC-7 | Home: exatamente 1 JSON-LD válido com `@graph` contendo Organization (name, url, logo), WebSite (url, inLanguage pt-BR), Service (provider.@id = Organization.@id); conteúdo do script sem `<` literal | proposto (G1) | metadata.spec.js › json-ld |
| AC-8 | Sem env: `resolveSiteUrl({})` = `https://nhandu.tech`, `resolveContactEmail({})` = `contato@nhandu.tech`; `git grep -n "nhandu.com.br" -- . ':!docs/superpowers'` vazio | pedido (domínio) | domain.spec.js + comando |
| AC-9 | `VERCEL_ENV=production`: host `nhanduproject.vercel.app` → 308 `https://nhandu.tech/<caminho>`; host `localhost` → 200; `productionRedirects` com preview/sem env → `[]` | proposto (G1) | redirect.spec.js |
| AC-10 | Hero: animações de `.hero .h1 span` e `.hero .hero-p` sem keyframe de `opacity`, opacidade computada `1`; Lighthouse mobile local LCP < 2,5 s | audit T5 | hero.spec.js + Lighthouse (R8) |
| AC-11 | `npm run build`, `npm run test:mobile` (Chrome) e `npm run test:seo` verdes | proposto (G1) | comandos |
| AC-12 | README atualizado: domínio, `test:seo`, passos manuais pós-deploy | proposto (G1) | leitura (R2/R8) |

## Review Focus
- Redirect por host: regex de host ancorada e escapada; sem loop quando `SITE` é `*.vercel.app`; previews intactos (teste em T04).
- Merge raso da Metadata API: páginas que definem `openGraph` não podem perder `images` (teste em T02 › open graph).
- JSON-LD: escape de `<` (teste em T02 › json-ld).
- Fallback de URL inválida (`NEXT_PUBLIC_SITE_URL=lixo`) cai em `https://nhandu.tech` (teste em T01).

## Checks canônicos
Lint: n/a (sem script) · Tipos: n/a (sem script) · Testes: `npm run test:seo` e `PW_CHANNEL=chrome npx playwright test layout states --project=chrome` · Build: `npm run build` · E2E: as próprias suítes Playwright · Lighthouse: `npx -y lighthouse@12.8.2 http://localhost:3200/ --form-factor=mobile --only-categories=performance` (R8, servidor de produção local)

## Fora de escopo
- Páginas por segmento, blog, copy visível (H1/headings), WebP/lazy no JSX gerado, FAQPage.
- Search Console, Bing, Business Profile, domínio `www` e env vars na Vercel (passos manuais documentados no README).

## Ondas
| Onda | Tarefas | Por que assim |
|---|---|---|
| 1 | T01 | Base (`lib/site.mjs`, config da suíte) de que todas dependem |
| 2 | T02 | Depende de T01; roda `next build` |
| 3 | T03 | Toda suíte roda `next build` no mesmo `.next`: implementadores em paralelo corromperiam o build → série |
| 4 | T04 | Idem; README por último, descreve o estado final |

## Cobertura
| AC / Review Focus | Tarefas | Teste |
|---|---|---|
| AC-1, AC-2, AC-3, AC-4, AC-7 | T02 | tests/seo/metadata.spec.js |
| AC-5, AC-6 | T02 | tests/seo/crawl.spec.js |
| AC-8 | T01 (código), T04 (README) | tests/seo/domain.spec.js + `git grep … ':!docs/superpowers'` |
| AC-9 | T04 | tests/seo/redirect.spec.js |
| AC-10 | T03 | tests/seo/hero.spec.js + Lighthouse |
| AC-11 | T04 (e checks de cada onda) | comandos de checks |
| AC-12 | T04 | leitura |
| RF redirect/loop/preview | T04 | redirect.spec.js |
| RF merge raso openGraph | T02 | metadata.spec.js › open graph |
| RF escape JSON-LD | T01 (helper), T02 (uso) | domain.spec.js › json-ld escape |
| RF URL inválida | T01 | domain.spec.js › invalid url |

---

### T01 — Fonte única de domínio e suíte de SEO

ID: T01
Files: lib/site.mjs, app/layout.jsx, components/Legal.jsx, .env.example, playwright.seo.config.js, package.json, tests/seo/domain.spec.js
Depends-on: none
Covers: AC-8, RF URL inválida, RF escape JSON-LD
Capacidade: leve
Interfaces:
- Produces (lib/site.mjs):
  - `export function resolveSiteUrl(env)` → string origem (`https://host`), ordem `env.NEXT_PUBLIC_SITE_URL` → `env.VERCEL_PROJECT_PRODUCTION_URL` → `'https://nhandu.tech'`; aceita valor sem protocolo (prefixa `https://`); valor inválido (não parseável, ou hostname sem ponto, ex.: `lixo`) → `'https://nhandu.tech'`; ignora strings vazias/espaços.
  - `export function resolveContactEmail(env)` → `env.NEXT_PUBLIC_CONTATO_EMAIL` (trim, não vazio) ou `'contato@nhandu.tech'`.
  - `export const SITE = resolveSiteUrl(process.env)`; `export const SITE_NAME = 'Nhandu'`; `export const CONTACT_EMAIL = resolveContactEmail(process.env)`.
  - `export function serializeJsonLd(obj)` → `JSON.stringify(obj).replace(/</g, '\\u003c')`.
  - `export const OG_BASE = { siteName: 'Nhandu', locale: 'pt_BR', type: 'website', images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Nhandu — Nenhum cliente sem resposta' }] }`.
  - `lib/site.mjs` só é importado por server components, metadata routes, `next.config.mjs` e testes (Node); nenhum client component o importa.

- [ ] Passo 1: criar `playwright.seo.config.js`: `testDir: 'tests/seo'`, `reporter: [['list']]`, `use: { baseURL: 'http://localhost:3200', locale: 'pt-BR' }`, um projeto `{ name: 'chrome', use: { browserName: 'chromium', channel: process.env.PW_CHANNEL } }`, `webServer: { command: 'npm run build && npx next start -p 3200', url: 'http://localhost:3200', reuseExistingServer: false, timeout: 240_000, env: { VERCEL_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://nhandu.tech' } }`. Em `package.json`, script `"test:seo": "playwright test -c playwright.seo.config.js"`.
      Verificação: `PW_CHANNEL=chrome npm run test:seo` termina com "No tests found" (ou equivalente), sem erro de config.
- [ ] Passo 2: `tests/seo/domain.spec.js` com `import { resolveSiteUrl, resolveContactEmail } from '../../lib/site.mjs'` e os testes:
  - `fallback without env`: `expect(resolveSiteUrl({})).toBe('https://nhandu.tech')`
  - `uses NEXT_PUBLIC_SITE_URL first`: `resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'https://a.com/x', VERCEL_PROJECT_PRODUCTION_URL: 'b.com' })` → `'https://a.com'`
  - `uses vercel production url without protocol`: `resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: 'nhandu.tech' })` → `'https://nhandu.tech'`
  - `invalid url`: `resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: 'http://' })`, `({ NEXT_PUBLIC_SITE_URL: '   ' })` e `({ NEXT_PUBLIC_SITE_URL: 'lixo' })` → `'https://nhandu.tech'`
  - `json-ld escape`: `serializeJsonLd({ x: '</script><b>' })` não contém `<` e `JSON.parse` do resultado devolve `{ x: '</script><b>' }`
  - `contact email fallback`: `resolveContactEmail({})` → `'contato@nhandu.tech'`; `resolveContactEmail({ NEXT_PUBLIC_CONTATO_EMAIL: ' x@y.com ' })` → `'x@y.com'`
      Verificação: `PW_CHANNEL=chrome npm run test:seo -- domain` falha (módulo inexistente).
- [ ] Passo 3: criar `lib/site.mjs` conforme Interfaces.
      Verificação: mesmo comando passa.
- [ ] Passo 4: `app/layout.jsx` remove a função `siteUrl()` local e usa `SITE` e `OG_BASE` de `'../lib/site.mjs'`: `metadataBase: new URL(SITE)`, `openGraph: { ...OG_BASE, title: 'Nhandu — Nenhum cliente sem resposta', description: <a atual> }` (sem `url` no layout), demais campos iguais. `components/Legal.jsx`: `EMAIL` vem de `CONTACT_EMAIL` (import `'../lib/site.mjs'`), CNPJ sem mudança. `.env.example`: `NEXT_PUBLIC_SITE_URL=https://nhandu.tech`, `NEXT_PUBLIC_CONTATO_EMAIL=contato@nhandu.tech`, `DIAGNOSTICO_EMAIL_FROM=Nhandu <site@nhandu.tech>`; comentário da l.3 passa a "Endereço final do site (canonical, sitemap, Open Graph e redirect de *.vercel.app)".
      Verificação: `npm run build` verde; `git grep -n "nhandu.com.br" -- app components lib .env.example` vazio.
- [ ] Passo 5: reportar status, arquivos alterados e saídas — sem commit.

### T02 — Metadata por página, JSON-LD, robots e sitemap

ID: T02
Files: app/page.jsx, app/privacidade/page.jsx, app/termos/page.jsx, app/robots.js, app/sitemap.js, tests/seo/metadata.spec.js, tests/seo/crawl.spec.js
Depends-on: T01
Covers: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, RF merge raso
Capacidade: média
Interfaces:
- Consumes: `SITE`, `SITE_NAME`, `CONTACT_EMAIL`, `OG_BASE`, `serializeJsonLd` de `lib/site.mjs` (T01).
- Produces: `GET /robots.txt`, `GET /sitemap.xml`; metadata exports das 3 páginas.

- [ ] Passo 1: `tests/seo/metadata.spec.js` (usa `page`, helper `meta(page, sel)` lendo `content`/`href`):
  - `home title e description`: title `.length <= 60`, `toContain('WhatsApp')`, `toMatch(/Nhandu$/)`; description length entre 120 e 160 e `toContain('WhatsApp')`.
  - `canonical`: para `[['/', 'https://nhandu.tech/'], ['/privacidade', 'https://nhandu.tech/privacidade'], ['/termos', 'https://nhandu.tech/termos']]`, `new URL(href).href` igual ao esperado (normalize a home: aceitar `https://nhandu.tech` ou `https://nhandu.tech/`). Para `/demo/nutricao` e `/briefing/nutricao`: `link[rel=canonical]` com count 0 e `meta[name=robots]` contém `noindex`.
  - `open graph`: nas 3 páginas, `og:url` igual ao canonical (mesma normalização), `og:image` termina com `/og.png`, `og:image:width` = `1200`, `og:image:height` = `630`.
  - `legal descriptions`: descriptions de `/privacidade` e `/termos` com 70–160 caracteres, diferentes entre si e da home.
  - `json-ld`: home com `script[type="application/ld+json"]` count 1; `JSON.parse(textContent)`; `@graph` tem itens com `@type` `Organization` (com `name`, `url`, `logo`), `WebSite` (`url`, `inLanguage: 'pt-BR'`) e `Service` com `provider['@id']` igual ao `@id` da Organization; `request.get('/')` → texto do HTML entre `application/ld+json">` e `</script>` não contém `<`.
      Verificação: `PW_CHANNEL=chrome npm run test:seo -- metadata` falha (title atual 72 caracteres, sem canonical, sem JSON-LD).
- [ ] Passo 2: `app/page.jsx`: `export const metadata = { title: { absolute: 'Agente de IA no WhatsApp para atender e agendar 24h | Nhandu' }, description: 'A Nhandu instala em até 14 dias um agente de IA que atende, qualifica e agenda pelo WhatsApp 24h, com página de conversão e automação até o CRM.', alternates: { canonical: '/' }, openGraph: { ...OG_BASE, url: '/', title: <title>, description: <description> } }`. Renderizar `<><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(JSON_LD) }} /><NhanduPage /></>`, com `JSON_LD = { '@context': 'https://schema.org', '@graph': [ { '@type': 'Organization', '@id': SITE + '/#org', name: SITE_NAME, legalName: 'Nhandu Tecnologia', url: SITE, logo: SITE + '/apple-icon.png', email: CONTACT_EMAIL }, { '@type': 'WebSite', '@id': SITE + '/#site', url: SITE, name: SITE_NAME, inLanguage: 'pt-BR', publisher: { '@id': SITE + '/#org' } }, { '@type': 'Service', name: 'Agente de IA no WhatsApp, página de conversão e automação', serviceType: 'Atendimento automatizado com IA no WhatsApp', description: <description da home>, areaServed: { '@type': 'Country', name: 'Brasil' }, provider: { '@id': SITE + '/#org' } } ] }`.
      Verificação: `PW_CHANNEL=chrome npm run test:seo -- metadata -g "home title|json-ld"` passa (canonical, open graph e legal descriptions só ficam verdes no Passo 3).
- [ ] Passo 3: `app/privacidade/page.jsx` e `app/termos/page.jsx`: mesmo `title` de hoje; `description` própria (privacidade: "Como a Nhandu trata os dados pessoais coletados no site e nos atendimentos, conforme a LGPD, e como exercer os seus direitos."; termos: "Regras de uso do site da Nhandu: calculadora, exemplos, limites do agente de IA, propriedade intelectual e contato."); `alternates: { canonical: '/privacidade' | '/termos' }`; `openGraph: { ...OG_BASE, url: <mesmo caminho>, title: <title>, description: <description> }`.
      Verificação: `PW_CHANNEL=chrome npm run test:seo -- metadata` passa inteiro.
- [ ] Passo 4: `tests/seo/crawl.spec.js` (usa `request`):
  - `robots`: `GET /robots.txt` status 200; texto contém `Allow: /`, `Disallow: /api/`, `Sitemap: https://nhandu.tech/sitemap.xml`.
  - `sitemap`: `GET /sitemap.xml` status 200; extrair `<loc>` por regex; normalizar a home; resultado ordenado igual a `['https://nhandu.tech/', 'https://nhandu.tech/privacidade', 'https://nhandu.tech/termos']`; nenhum contém `/demo`, `/briefing`, `/api`.
      Verificação: `PW_CHANNEL=chrome npm run test:seo -- crawl` falha (404).
- [ ] Passo 5: `app/robots.js`: `export default function robots() { return { rules: { userAgent: '*', allow: '/', disallow: '/api/' }, sitemap: SITE + '/sitemap.xml' }; }`. `app/sitemap.js`: constante `ROUTES = [['/', '2026-11-14', 1], ['/privacidade', '2026-11-01', 0.3], ['/termos', '2026-11-01', 0.3]]` → `{ url: SITE + path (home = SITE), lastModified: new Date(data), changeFrequency: 'monthly', priority }`.
      Verificação: `PW_CHANNEL=chrome npm run test:seo` (suíte inteira) passa.
- [ ] Passo 6: reportar status, arquivos alterados e saídas — sem commit.

### T03 — LCP do hero sem animação de opacidade

ID: T03
Files: app/fonts.css, tests/seo/hero.spec.js
Depends-on: T01
Covers: AC-10
Capacidade: leve
Interfaces:
- Consumes: classes `.hero`, `.h1`, `.hero-p` de `components/NhanduPage.jsx`/`app/page.css` (somente leitura).

- [ ] Passo 1: `tests/seo/hero.spec.js` com `test.use({ reducedMotion: 'no-preference', viewport: { width: 390, height: 844 } })`, teste `hero sem animação de opacidade`: `page.goto('/', { waitUntil: 'load' })`; para cada elemento de `.hero .h1 span, .hero .hero-p` (exatamente 3 elementos): `getComputedStyle(el).animationName === 'riseIn'`; `el.getAnimations()` tem ≥ 1 animação com `animationName === 'riseIn'`; `el.getAnimations().flatMap(a => a.effect.getKeyframes()).some(k => 'opacity' in k)` é `false`; `getComputedStyle(el).opacity === '1'`.
      Verificação: `PW_CHANNEL=chrome npm run test:seo -- hero` falha (`animationName` é `pop`/`fadeUp`).
- [ ] Passo 2: em `app/fonts.css`, ao final, bloco comentado ("LCP: o hero aparece já opaco; só desliza"): `@keyframes riseIn{from{transform:translateY(12px)}to{transform:none}}` e `.hero .h1 span,.hero .hero-p{animation-name:riseIn}` (só `animation-name`; duração, atraso e easing de `page.css` ficam).
      Verificação: mesmo comando passa; `PW_CHANNEL=chrome npx playwright test layout states --project=chrome` continua verde.
- [ ] Passo 3: reportar status, arquivos alterados e saídas — sem commit.

### T04 — Redirect de *.vercel.app em produção e README

ID: T04
Files: lib/site.mjs, next.config.mjs, tests/seo/redirect.spec.js, README.md
Depends-on: T01, T02, T03
Covers: AC-9, AC-11, AC-12, AC-8 (README), RF redirect/loop/preview
Capacidade: média
Interfaces:
- Consumes: `SITE` (T01).
- Produces (lib/site.mjs, acréscimo): `export function productionRedirects({ vercelEnv, site })` → `[]` se `vercelEnv !== 'production'` ou se o host de `site` termina com `.vercel.app`; senão `[{ source: '/:path*', has: [{ type: 'host', value: '(?<sub>.+)\\.vercel\\.app' }], destination: site + '/:path*', permanent: true }]`. `next.config.mjs`: `import { SITE, productionRedirects } from './lib/site.mjs'; export default { async redirects() { return productionRedirects({ vercelEnv: process.env.VERCEL_ENV, site: SITE }); } };`

- [ ] Passo 1: `tests/seo/redirect.spec.js`:
  - `config: sem produção não redireciona`: `productionRedirects({ vercelEnv: 'preview', site: 'https://nhandu.tech' })` e `({ vercelEnv: undefined, site: 'https://nhandu.tech' })` → `[]`.
  - `config: sem loop`: `productionRedirects({ vercelEnv: 'production', site: 'https://nhanduproject.vercel.app' })` → `[]`.
  - `config: produção`: com `site: 'https://nhandu.tech'` → 1 regra, `destination` `'https://nhandu.tech/:path*'`, `permanent: true`, regex do `has` casa `nhanduproject.vercel.app` e não casa `nhandu.tech` (testar com `new RegExp('^' + value + '$')`).
  - `servidor: host vercel.app recebe 308`: com `node:http` `request({ host: 'localhost', port: 3200, path: '/termos?x=1', headers: { host: 'nhanduproject.vercel.app' } })` → `statusCode` 308 e `headers.location` = `https://nhandu.tech/termos?x=1`.
  - `servidor: localhost não redireciona`: mesma request com host `localhost:3200` → 200.
      Verificação: `PW_CHANNEL=chrome npm run test:seo -- redirect` falha (função inexistente).
- [ ] Passo 2: acrescentar `productionRedirects` em `lib/site.mjs` e criar `next.config.mjs` conforme Interfaces.
      Verificação: mesmo comando passa; `npm run test:seo` inteira passa; `PW_CHANNEL=chrome npx playwright test layout states --project=chrome` passa.
- [ ] Passo 3: README: "Publicar na Vercel" passo 4 → domínio `nhandu.tech` (e `www.nhandu.tech` redirecionando para ele em Settings > Domains); exemplo de `BASE_URL` → `https://nhandu.tech`; seção nova "SEO" com: o que existe (robots, sitemap, canonical, JSON-LD, redirect de `*.vercel.app` em produção, `lib/site.mjs` como fonte da URL), `npm run test:seo`, e "Depois de publicar" (Search Console com o domínio + envio de `https://nhandu.tech/sitemap.xml`; Bing Webmaster Tools; `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_CNPJ`, `NEXT_PUBLIC_CONTATO_EMAIL` e, se usar outro domínio, `NEXT_PUBLIC_SITE_URL` na Vercel).
      Verificação: `git grep -n "nhandu.com.br" -- . ':!docs/superpowers'` vazio; `git grep -n "nhanduproject.vercel.app" -- README.md` vazio; leitura.
- [ ] Passo 4: reportar status, arquivos alterados e saídas — sem commit.

## Emendas
| # | Data | Tipo | Mudança | Motivo | Aprovação |
|---|---|---|---|---|---|
