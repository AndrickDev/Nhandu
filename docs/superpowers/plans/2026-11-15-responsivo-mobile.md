# Plano — responsivo-mobile: responsividade mobile e animações fluidas

> Execução: P7 de docs/workflows/planning-workflow.md (ondas; implementadores não commitam; o controlador commita por tarefa).

Status: decidido por delegação em 2026-11-15 (claude-opus-5-5; autorização: invocação `/factory` com a descrição da task)
Jira: — (sem Jira; KEY responsivo-mobile) · Classificação: projeto
Spec: docs/superpowers/specs/2026-11-15-responsivo-mobile-design.md (decidida por delegação em 2026-11-15)
Risco estimado: 1 ponto (101–400 linhas +1; sem área sensível) → N de review estimado: 3 (o R1 recalcula com o diff real)

**Goal:** zerar os problemas de layout mobile da auditoria e deixar as animações de rolagem do celular sem esconder conteúdo e só em transform/opacity, sem tocar o desktop.
**Architecture:** overrides em `app/mobile.css` (mantido à mão, importado em `app/layout.jsx` depois do `page.css` gerado); ajuste pontual no CSS da demo; a suíte Playwright ganha uma regra de auditoria, duas páginas e uma spec de movimento com animação ligada.
**Tech Stack:** next@15.5.29, react@19.1, @playwright/test@1.65 (Chromium via `PW_CHANNEL=chrome`, WebKit instalado em 2026-11-15); CSS scroll-driven animations (Chrome 115+, Safari 26) — fonte: .work/responsivo-mobile/03-research-docs.md.

## Global Constraints
- Não editar `app/page.css` nem `components/NhanduPage.jsx` (gerados por tools/convert.py).
- Sem dependência nova; sem mudar `playwright.config.js`.
- Toda regra de animação nova em `app/mobile.css` fica dentro de `@media (prefers-reduced-motion: no-preference)`.
- Desktop (≥1100px) sem mudança visual: nenhuma regra de `app/mobile.css` fora de `@media (max-width:1099px)` ou mais estreito, exceto L1 (fonte dos campos, todas as larguras) e o CTA fixo com campo focado (só existe ≤640). L3 usa `(max-width:1099px) and (max-height:649px)`.
- Testes rodam contra o servidor que o controlador mantém em `http://localhost:3100` (`npx next dev -p 3100`; o Playwright reaproveita, `reuseExistingServer`). Implementador não roda build nem sobe servidor. Comando: `PW_CHANNEL=chrome npx playwright test <arquivo> --project=chrome`. WebKit (projeto `safari`): prefixar `PLAYWRIGHT_BROWSERS_PATH=<valor que o controlador passa no briefing>`.

## Critérios de aceite
| ID | Critério (observável) | Origem | Verificação |
|---|---|---|---|
| AC-1 | `layout` e `states` sem problemas em todas as larguras e paisagens, no Chrome e no WebKit, para home, privacidade, termos, `/demo/nutricao` e `/briefing/nutricao` (campos ≥16px, CTA do cabeçalho dentro da tela, alvos de toque, demo a 768px) | proposto (G1) ← pedido | `npm run test:mobile` (projetos chrome e safari) |
| AC-2 | Nenhum link, botão ou summary com texto além da própria caixa, inclusive o CTA da calculadora com os sliders no máximo e no mínimo | proposto | regra `texto-transborda` (helpers.js) em `layout` e `states` |
| AC-3 | Até 640px, as abas de segmento do hero (`.ptabs`) não se sobrepõem ao cartão de agenda (`.panel .agc`) | proposto | `motion.spec.js › hero: abas não cobrem o cartão de agenda` |
| AC-4 | Até 1099px com animação ligada, durante a rolagem da home, nenhuma seção na tela (filho direto de `.nh main` ou `section` dentro de um deles, como `.lift` em `.dk-shell`) fica com clip-path ≠ none, opacidade < 0,99 ou escala < 0,99 | proposto | `motion.spec.js › seções inteiras na tela` |
| AC-5 | Até 1099px com animação ligada, toda animação com timeline de rolagem anima só transform/opacity/translate/scale/rotate (stroke-dashoffset/stroke-dasharray aceitos em elemento SVG); e, se `CSS.supports('animation-timeline: view()')`, o primeiro `.wd` roda `wInM`, `.split .sol-r` e o primeiro `.tmc img` rodam `rvIn`, todos com timeline de rolagem | proposto | `motion.spec.js › rolagem só com transform e opacity` |
| AC-6 | Até 1099px, a altura de `.track` e de `.sticky` não muda quando `--vh` muda em `.nh` | proposto | `motion.spec.js › passo a passo ignora --vh` |
| AC-7 | Com `prefers-reduced-motion: reduce`, nenhuma animação CSS em estado `running` com alvo dentro de `.nh`, em 375 e 1024 | proposto | `motion.spec.js › reduzir movimento` |
| AC-8 | Em 1280px: `animationName` de `.circ` igual a `circC` e do primeiro `.wd` igual a `wIn` (quando há suporte a `animation-timeline`), CTA do cabeçalho visível, altura de `.track` acompanha `--vh`; `npm run test:seo` verde | proposto | `motion.spec.js › desktop intacto`; `npm run test:seo` |
| AC-9 | Em 375px, `.mcta` visível na página e oculto enquanto `#f-nome` tem foco | proposto | `motion.spec.js › CTA fixo some com campo focado` |
| AC-10 | README descreve `app/mobile.css`, a spec de movimento no `test:mobile` e não lista mais como "falhas conhecidas" as que esta task resolve | proposto | leitura (R2/R8) |

## Review Focus
- Cascata: override perdido para regra `!important` ou para bloco `@media` posterior do `page.css` (≤1099 vem depois dos ≤960/≤640) → coberto por `layout`/`motion` em T02.
- Shorthand `animation` em override zerando `animation-timeline`/`animation-range` → AC-5, conferido por alvo (`.wd`, `.split .sol-r`, `.tmc img`) (T01, T02).
- `!important` do override religando animação com reduce → AC-7 (T01, T02).
- Falso positivo da regra `texto-transborda` (glifo girado, ícone) → passo 2 de T01.

## Checks canônicos
Lint: n/a (sem script) · Tipos: n/a (sem script) · Testes: `npm run test:mobile` (chrome + safari) e `npm run test:seo` · Build: `npm run build` · E2E: os próprios Playwright acima.

## Fora de escopo
- Redesenho, texto, desktop; regerar pelo canvas; JS gerado (`boot()`, canvas, `getComputedStyle` por frame); loops decorativos pequenos (`scan`, `ring`, `bFill`, `dashF`, `typ`); `backdrop-filter` do cabeçalho; throttle do scroll da demo; `test:mobile:visual` (referências não versionadas).

## Ondas
| Onda | Tarefas | Por que juntas |
|---|---|---|
| 1 | T01 | Testes primeiro (vermelho na BASE) |
| 2 | T02, T03 | Dependem de T01; Files disjuntos |

## Cobertura
| AC / Review Focus | Tarefas | Teste |
|---|---|---|
| AC-1 | T01 (PAGES), T02 (home), T03 (demo) | layout.spec.js, states.spec.js |
| AC-2 | T01 (regra), T02 (CTA) | helpers.js `texto-transborda` |
| AC-3 | T01, T02 | motion.spec.js › hero |
| AC-4 | T01, T02 | motion.spec.js › seções inteiras |
| AC-5 | T01, T02 | motion.spec.js › rolagem |
| AC-6 | T01, T02 | motion.spec.js › --vh |
| AC-7 | T01, T02 | motion.spec.js › reduzir movimento |
| AC-8 | T01, T02 | motion.spec.js › desktop; test:seo |
| AC-9 | T01, T02 | motion.spec.js › CTA fixo |
| AC-10 | T02 | leitura |
| RF cascata / shorthand / reduce | T02 | layout, motion |
| RF falso positivo | T01 | passo 2 |

### T01 — Testes: regra `texto-transborda`, páginas novas e spec de movimento

ID: T01
Files: tests/responsive/helpers.js, tests/responsive/motion.spec.js, package.json
Depends-on: none
Covers: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9
Capacidade: média
Interfaces:
- Consumes: `openAt(page, path, width, height?)`, `settle(page)`, `audit(page)`, `format(problems)` de tests/responsive/helpers.js (existentes)
- Produces: regra `texto-transborda` em `audit()`; `PAGES` com `demo-nutricao` (`/demo/nutricao`) e `briefing-nutricao` (`/briefing/nutricao`); `tests/responsive/motion.spec.js`; script `test:mobile` = `playwright test layout states motion`

- [ ] Passo 1: em `helpers.js`, acrescentar a `PAGES` `{ name: 'demo-nutricao', path: '/demo/nutricao' }` e `{ name: 'briefing-nutricao', path: '/briefing/nutricao' }`.
- [ ] Passo 2: em `audit()`, nova regra numerada 7, "texto-transborda": para cada `a,button,summary` não ignorado, visível e com `display` ≠ `inline`, percorrer os nós de texto não vazios; pular texto que tenha, entre o nó e o elemento, um ancestral com `transform` ≠ `none` (glifo girado); medir com `Range.selectNodeContents(nó).getBoundingClientRect()`; se o retângulo do texto (largura > 0) passar da caixa do elemento em mais de 1px à direita ou à esquerda, `report('texto-transborda', el, \`texto vai de ${l} a ${r}px e a caixa de ${bl} a ${br}px\`)` e parar no primeiro nó. Comentário curto no estilo das regras existentes.
      Verificação: `PW_CHANNEL=chrome npx playwright test layout --project=chrome -g "layout: home 375px"` falha com `texto-transborda: <a.btn.btn-acc.cta-big>`; `-g "demo-nutricao 1024px"` não acusa `texto-transborda` (o "+" girado do FAQ não conta).
- [ ] Passo 3: criar `motion.spec.js` (imports de `@playwright/test` e `./helpers`), com uma função local `scrollThrough(page, check)` que zera `document.documentElement.style.scrollBehavior = 'auto'` (o page.css liga `scroll-behavior:smooth` sem reduce; sem isso a amostragem acontece num `scrollY` atrasado), rola com `scrollTo({ top: y, behavior: 'instant' })` de 0 até `scrollHeight - innerHeight` em passos de `innerHeight / 2`, garantindo um último passo exatamente em `scrollHeight - innerHeight`, espera dois `requestAnimationFrame` a cada passo e acumula o retorno de `check` (função executada na página via `page.evaluate`) num array, sem repetir texto. Antes de `scrollThrough`, os testes com animação ligada chamam `openAt` e em seguida zeram `scrollBehavior` (o `settle()` de helpers.js rola com `scrollTo` simples). Testes:
  1. `describe('movimento: seções inteiras na tela')` com `test.use({ reducedMotion: 'no-preference' })`, larguras 375, 768, 1024 (altura de `heightFor`): para cada elemento em `.nh main > *, .nh main > * > section` que cruza a tela, falha se `clipPath` ≠ `none`, `opacity` < 0.99 ou a escala da matriz de `transform` (valor `a` de `matrix(a,…)`) < 0.99; mensagem com classe, valor e `scrollY`. `expect(problemas, format(problemas)).toEqual([])`.
  2. `describe('movimento: rolagem só com transform e opacity')`, mesmas larguras e `reducedMotion: 'no-preference'`: em cada passo, `document.getAnimations()` cuja `timeline` existe e não é `document.timeline`; propriedades = chaves de `effect.getKeyframes()` sem `offset`, `easing`, `composite`, `computedOffset`; permitidas `transform`, `opacity`, `translate`, `scale`, `rotate`, e `strokeDashoffset`/`strokeDasharray` quando o alvo é `SVGElement`; reporta `animationName`, seletor e propriedades proibidas. `expect(proibidas).toEqual([])`; se `CSS.supports('animation-timeline: view()')`, para cada alvo (primeiro `.wd`, `.split .sol-r`, primeiro `.tmc img`) `el.getAnimations()` contém uma animação com `timeline` ≠ `document.timeline` e `animationName` esperado: na BASE `wIn`/`wipeR`/`imgUp`; o teste espera `wInM`/`rvIn`/`rvIn` (vermelho na BASE, verde depois de T02).
  3. `test('movimento: passo a passo ignora --vh')` em 375x780 e 1024x1024: altura de `.track` e `.sticky` antes e depois de `document.querySelector('.nh').style.setProperty('--vh', '2000px')` (dois rAF entre a escrita e a leitura); `expect(depois).toEqual(antes)`.
  4. `describe('movimento: reduzir movimento')` com `reducedMotion: 'reduce'`, 375 e 1024: depois de `openAt`, `document.getAnimations().filter(a => a.playState === 'running' && a.effect?.target?.closest?.('.nh')).length` = 0 (mensagem lista nome e alvo).
  5. `test('movimento: desktop intacto')` em 1280x900, `reducedMotion: 'no-preference'`: se há suporte a `animation-timeline`, `getComputedStyle(.circ).animationName === 'circC'` e o do primeiro `.wd` `=== 'wIn'` (igualdade exata); `.hdr .btn-solid` visível; altura de `.track` muda depois de `--vh: 2000px`.
  6. `describe('movimento: hero: abas não cobrem o cartão de agenda')` com `reducedMotion: 'reduce'`, larguras 320, 360, 390, 430, 640 (na BASE vermelho de 320 a 430, onde as abas quebram em 2 linhas; 640 já passa): retângulos de `.panel .agc` e `.ptabs` não se cruzam (`agc.bottom <= ptabs.top` ou sem interseção); mensagem com a sobreposição em px.
  7. `test('movimento: CTA fixo some com campo focado')` em 375x780: `expect(page.locator('.mcta')).toBeVisible()`; `await page.locator('#f-nome').focus()`; `expect(page.locator('.mcta')).toBeHidden()`.
      Verificação: `PW_CHANNEL=chrome npx playwright test motion --project=chrome` — na BASE falham 1 (seção `.circ`/`.fold`/`.lift`/`.open.final`), 2 (`wIn` com `filter`, `circC`/`openIn`/`liftIn`/`wipeR`/`imgUp` com `clipPath`; nomes por alvo), 3, 6 (320–430) e 7; passam 4 e 5. Colar a saída.
- [ ] Passo 4: `package.json`: `"test:mobile": "playwright test layout states motion"`.
      Verificação: `PW_CHANNEL=chrome npx playwright test layout states motion --project=chrome --list | grep -c "movimento:"` > 0.
- [ ] Passo 5: registrar o estado das páginas novas e do WebKit na BASE: `PW_CHANNEL=chrome npx playwright test layout --project=chrome -g "briefing-nutricao|demo-nutricao|privacidade|termos"` e `PLAYWRIGHT_BROWSERS_PATH=<do briefing> npx playwright test layout states motion --project=safari`; listar cada falha (esperado: só demo ≥641 com `.nt-btn-solid`, e no safari as mesmas causas do chrome).
- [ ] Passo 6: reportar status, arquivos alterados e saídas (vermelhos esperados acima; qualquer `texto-transborda` fora do CTA da calculadora deve ser listado) — sem commit.

### T02 — Overrides de celular e tablet em `app/mobile.css`

ID: T02
Files: app/mobile.css, app/layout.jsx, README.md
Depends-on: T01
Covers: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8, AC-9, AC-10
Capacidade: média
Interfaces:
- Consumes: testes de T01; classes do `page.css` gerado: `.fld`, `.hdr .btn-solid`, `.st-mini`, `.panel .agc`, `.ptabs`, `.cta-big`, `.fold`, `.zi`, `.zo`, `.open`, `.circ`, `.reveal`, `.lift`, `.split .sol-r`, `.tmc img`, `.wd`, `.track`, `.sticky`, `.mcta`; keyframes `rvIn` (page.css:21)
- Produces: `app/mobile.css` importado depois de `./page.css`

- [ ] Passo 1: criar primeiro `app/mobile.css` (completo) e só depois, em `app/layout.jsx`, `import './mobile.css';` logo depois de `import './page.css';` (o import antes do arquivo quebra todas as rotas no `next dev`, inclusive a demo de T03). Cabeçalho do arquivo: "Ajustes de celular e tablet mantidos à mão. Não é gerado: tools/convert.py só grava app/page.css e components/NhanduPage.jsx. Vem depois do page.css no layout." Blocos, cada um com comentário de uma linha dizendo o problema:
  - L1: `.fld input,.fld select{font-size:16px}`.
  - L2: `@media (max-width:640px){.hdr .btn-solid{display:none}}` (o CTA fixo `.mcta` cobre a função).
  - L3: `@media (max-width:1099px) and (max-height:649px){.st-mini{min-height:24px}}` (desktop baixo intocado).
  - L4: `@media (max-width:640px){.panel .agc{bottom:62px}}`.
  - L5: `@media (max-width:640px){.cta-big{white-space:normal;text-align:center;line-height:1.25;height:auto;padding-top:12px;padding-bottom:12px}}`.
  - M3: `@media (max-width:1099px){.track{height:calc(clamp(400px,100svh,1200px) - 68px + 2800px)}.sticky{height:calc(clamp(400px,100svh,1200px) - 68px)}}` (mesmo limite 400–1200 do JS).
  - CTA fixo: `.nh:has(input:not([type=range]):focus,select:focus,textarea:focus) .mcta{display:none}` (sliders da calculadora não escondem o CTA).
  - L6/M1: `@media (max-width:1099px) and (prefers-reduced-motion:no-preference){@supports (animation-timeline: view()){ … }}` contendo: `.fold,.zi,.zo,.open,.circ,.reveal,.lift{animation:none!important;clip-path:none!important}`; `.split .sol-r,.tmc img{animation-name:rvIn}` (sem `!important`: vence por ordem/especificidade e não empata com `.nh.still *`; mantém timeline e range do page.css, só troca o keyframe); comentário: `.zi`, `.zo` e `.reveal` não estão no markup atual, entram por precaução contra reconversão; `@keyframes wInM{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}` e `.wd{animation-name:wInM}`.
      Verificação: `PW_CHANNEL=chrome npx playwright test motion --project=chrome` verde (7 grupos); colar a saída.
- [ ] Passo 2: rodar a home em `layout` e `states`.
      Verificação: `PW_CHANNEL=chrome npx playwright test layout states --project=chrome -g "home"` verde, incluindo `texto-transborda` com os sliders no máximo.
- [ ] Passo 3: README, seção "Testes de responsividade mobile": `test:mobile` inclui `motion` (atualizar também o comentário do bloco de comandos e a linha "Para rodar só no Chrome já instalado…" para `layout states motion`) (o que cada teste de movimento cobra, em 1 linha cada); trocar o parágrafo "Falhas conhecidas…" por "Ajustes de celular e tablet ficam em `app/mobile.css`, mantido à mão e importado depois do `app/page.css` gerado: corrija ali o que vier do canvas, sem editar o arquivo gerado."; listar a regra `texto-transborda` entre o que cada teste de layout cobra; páginas cobertas incluem demo e briefing.
      Verificação: leitura; `grep -n "Falhas conhecidas" README.md` sem resultado.
- [ ] Passo 4: reportar status, arquivos e saídas — sem commit.

### T03 — Demo: menu do cabeçalho até 1000px

ID: T03
Files: app/demo/nutricao/nutricao.css
Depends-on: T01
Covers: AC-1
Capacidade: leve
Interfaces:
- Consumes: `PAGES` com `demo-nutricao` (T01)
- Produces: —

- [ ] Passo 1: confirmar o vermelho: `PW_CHANNEL=chrome npx playwright test layout --project=chrome -g "demo-nutricao"` acusa `fora-da-tela: <a.nt-btn.nt-btn-solid>` em 768px (e o que mais aparecer na demo entre 641 e 1000).
- [ ] Passo 2: no bloco `@media (max-width:1000px)` existente de `nutricao.css`, acrescentar `.nt-nav{display:none}`. Se o passo 1 mostrar outra falha da demo que não seja do `.nt-btn-solid`/`.nt-nav`, PARE e reporte (NEEDS_CONTEXT), sem corrigir fora do pedido.
      Verificação: mesmo comando verde.
- [ ] Passo 3: reportar status, arquivos e saídas — sem commit.

## Revisão do plano (P4)
plan-reviewer (claude-opus-5-5, 2026-11-15): aprovado com ressalvas; 1 HIGH (PR-01 rolagem suave na amostragem), 6 MEDIUM (PR-02 a PR-06), 7 LOW (PR-07 a PR-14). Todos incorporados ao texto acima antes do G2.
