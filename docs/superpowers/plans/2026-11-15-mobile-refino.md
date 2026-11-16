# Plano — mobile-refino: refino da responsividade mobile em pontos específicos

> Execução: P7 de docs/workflows/planning-workflow.md (ondas; implementadores não commitam; o controlador commita por tarefa).

Status: decidido por delegação em 2026-11-15 (claude-opus-5-5; autorização: invocação `/factory` com a descrição da task). plan-reviewer: rodada 1 reprovado (5 HIGH, corrigidos), rodada 2 aprovado com ressalvas (N1 MEDIUM corrigido)
Jira: — (sem Jira; KEY `mobile-refino`, branch `feature/responsivo-mobile` a pedido do usuário) · Classificação: projeto
Spec: ver "Descrição aprovada" (G1 decidido por delegação em 2026-11-15)
Risco estimado: 1 ponto → N de review estimado: 3 (o R1 recalcula com o diff real)

**Goal:** corrigir os 12 pontos de mobile apontados nos prints (≤ 640 px), trocando conteúdo onde o desktop não se traduz (vídeo, rascunho da revisão), sem mudar nada no desktop.
**Architecture:** layout em `app/mobile.css` e, para os estilos da demo e do CTA fixo, `app/mobile-enhance.css` (ambos à mão, importados no layout depois do `page.css` gerado, seletores prefixados com `.nh` para não depender da ordem dos chunks). Comportamento novo num componente cliente `components/MobileEnhance.jsx`, renderizado em `app/page.jsx` depois de `<NhanduPage/>`. A demo mobile entra por portal dentro de `figure.vframe`. Os arquivos gerados (`app/page.css`, `components/NhanduPage.jsx`) não são editados (o `.dc.html` do canvas não está no repositório).
**Tech Stack:** next@15.5.29, react@19.1, @playwright/test@1.65 (Chrome e WebKit). Docs: .work/mobile-refino/03-research-docs.md.

## Descrição aprovada
Critérios do pedido (literais): JIRA-AC-1 "melhorias na responsividade mobile em alguns pontos especificos" (os 12 prints); JIRA-AC-2 "talvez tenha que trocar o conteudo"; JIRA-AC-3 "use skill de design como /impeccable e /design-taste-frontend e tbm apple design guidelines"; JIRA-AC-4 "essa parte do video talvez fazer um video a parte somente para o mobile"; JIRA-AC-5 "quero que faça teste visuais tbm responsivos"; JIRA-AC-6 "sem quebrar o que ja existe para desktop".

Pedido (literal): "Quero me faça melhorias na responsividade mobile em alguns pontos especificoes, que talvez tenha que trocar o conteudo. vou mandar prints use skill de design como /impeccable e /design-taste-frontend e tbm apple design guidelines. [...] essa parte do video talvez fazer um video a parte somente para o mobile [...] quero que faça teste visuais tbm responsivos, sem quebrar o que ja existe para desktop."

Decisões (por delegação; evidências em .work/mobile-refino/04-research-brief.md):
- Fundo ASCII do hero restrito à faixa do painel no celular, com máscara vertical e lateral.
- Abas do hero viram controle segmentado de 1 linha acima do celular (HIG: ≤ 5 segmentos, alvo 44 pt); painel em fluxo; cartão da agenda empilhado sob o celular, com entrada mais cedo.
- "Revisão da página" no celular mostra só a versão aprovada (rascunho oculto), com pinos presos à imagem e ao botão.
- Vídeo 16:9 de 3 painéis vira, no ≤ 640, uma **demo vertical nativa** (DOM/CSS) com a mesma história e o mesmo texto do vídeo. Motivo: sem codificador MP4 no ambiente, e texto renderizado fica nítido em qualquer tela. Reversível: o conteúdo do portal pode virar um `<video>` vertical depois.
- CTA fixo `.mcta` some quando um CTA equivalente (link para `#form-diag`/`#comecar`), o formulário, a seção final ou a história fixa de `#camadas` estão na tela.
- Ritmo vertical e cartões ajustados no ≤ 640.

## Global Constraints
- Sem dependência nova. Sem editar `app/page.css`, `components/NhanduPage.jsx`, `tools/convert.py`, `.claude/`.
- Toda regra de layout nova fica dentro de `@media (max-width:640px)` (ou `max-width:1099px` só onde dito); nada novo vale em ≥ 1100 px.
- Animação nova só com `transform`/`opacity`; com `prefers-reduced-motion: reduce`, nada roda e o estado final aparece.
- Override de animação do `page.css`: usar longhands (`animation-name`, `animation-delay`, `animation-range`), nunca o shorthand `animation:` (zera timeline/range).
- Alvos de toque novos ≥ 44 × 44 px; texto novo ≥ 11 px; campos ≥ 16 px.
- Sem travessão longo (—/–) em texto novo visível.
- Testes rodam contra o servidor em :3100 que o controlador mantém (`next dev -p 3100` em P7; build de produção nas rodadas de referência e no R0). Implementador não sobe servidor nem roda build.

## Critérios de aceite
| ID | Critério (observável) | Origem | Verificação |
|---|---|---|---|
| AC-1 | Em 320–640 px, `.hero-bg` começa abaixo do fim do bloco de texto do hero (`top(.hero-bg) ≥ bottom(.fmini) − 8`) e tem `mask-image` diferente de `none` | JIRA-AC-1 (prints 1, 2, 3, 5) | refino.spec › hero: fundo ASCII fora do texto |
| AC-2 | Em 320–640 px, o `<b>PARA QUEM</b>` da `.pill` ocupa 1 linha (`getClientRects().length === 1` e altura < 24 px) | JIRA-AC-1 (print 1) | refino.spec › hero: selo da pílula em 1 linha |
| AC-3 | Em 320, 344, 360, 390, 430, 640 px: os 4 botões de `.ptabs` têm o mesmo `top` e altura ≥ 44 px; `.ptabs` termina acima do topo de `.phone`; `top(.agc) ≤ bottom(.phone) + 16`; `bottom(.panel) − bottom(.agc) ≤ 24`; com animação ligada, 2 s depois de tocar numa aba o `.agc` visível tem opacidade ≥ 0,99 (entrada com `animation-delay` ≤ 1 s + 0,8 s de `slideIn`); cada botão com `scrollWidth ≤ clientWidth` e `right(.ptabs) ≤ largura da tela` | JIRA-AC-1 (prints 3, 4, 5) | refino.spec › hero: controle segmentado; › hero: painel sem vazio; › hero: agenda aparece depois da troca |
| AC-4 | Em 320–640 px, a seta `.arr` do `.cta-big` fica a ≤ 16 px do fim do texto na mesma linha (não solta na borda); em 430 e 640 px o botão tem 1 linha (altura ≤ 60 px); auditoria `texto-transborda` sem ocorrência no `.cta-big` | JIRA-AC-1 (print 6) | refino.spec › calculadora: CTA com seta junto ao texto; layout.spec |
| AC-5 | Em 320–640 px, `top(#camadas .layers-intro h2) − top(#camadas) ≥ 64` | JIRA-AC-1 (print 6) | refino.spec › camadas: título com respiro |
| AC-6 | Em 390×664, 375×553 e 320×568, com a história de `#camadas` no passo 2: `.lv1 .wf` e `.lv1 .to` ocultos; centro do `.pin` 1 dentro de `.fin-img`; centro do `.pin` 2 a ≤ 12 px da caixa de `.fin-b`; nenhum `.pin` intersecta `.fin-h`; `bottom(.lv1) ≤ bottom(.sticky)` | JIRA-AC-1, JIRA-AC-2 (print 7) | refino.spec › camadas: revisão da página sem sobreposição |
| AC-7 | Em 320–640 px: o `<video>` da `.vframe` fica oculto e pausado; `.mdemo` aparece dentro da `.vframe` com altura ≥ 360 px, todo texto ≥ 11 px, botão `.mdemo-btn` ≥ 44×44 com `aria-label` que alterna "Pausar demonstração"/"Retomar demonstração"; a demo avança passos sozinha (laço ≈ 15 s), para fora da tela e com o botão; com reduced-motion mostra o passo final sem animar; `.mdemo` continua no DOM depois de trocar de aba no hero (re-render do NhanduPage). Em 641 px e 1280 px, `.mdemo` não aparece e o vídeo continua visível | JIRA-AC-4 (print 8) | enhance.spec › demo mobile: … (6 testes) |
| AC-8 | Em 375×780: `.mcta` visível com `#pratica` no topo da tela; oculto (opacidade 0 e `pointer-events:none`) com o topo da página, com `#form-diag` na tela, com `.final` na tela e com a história fixa de `#camadas` na tela; some com campo do formulário focado (teste existente adaptado); `bottom` declara `max(12px, env(safe-area-inset-bottom))` (sem efeito até haver `viewport-fit=cover`, limitação registrada) | JIRA-AC-1 (prints 3, 9, 10, 11, 12) | enhance.spec › CTA fixo: …; motion.spec › CTA fixo some com campo focado |
| AC-9 | Em 320–640 px, cada `.fcard` tem altura ≤ altura(`.t`) + altura(`p`) + 48 (padding) + 16 (gap) + 2 (borda) | JIRA-AC-1 (print 11) | refino.spec › cartões sem vazio interno |
| AC-10 | Em 390 px: `padding-top` de `#compromissos` e de `#time` = 72 px; com animação ligada e suporte a `view()`, um `h2.rv` cujo topo está a 75 % da altura da tela tem opacidade ≥ 0,95 | JIRA-AC-1 (prints 11, 12) | refino.spec › ritmo: seções e títulos |
| AC-11 | `visual.spec` cobre também `#camadas .layers-intro` e `.vframe`; referências mobile geradas e a segunda rodada passa | JIRA-AC-5 | `npm run test:mobile:visual` (2ª rodada verde) |
| AC-12 | Em contexto de desktop real (sem `isMobile`, 1280×900 e 1440×900), as seções da home comparadas com referências geradas na BASE passam depois de toda a mudança; `motion.spec › desktop intacto` verde; suítes `layout states motion` e `test:seo` verdes em Chrome e Safari | JIRA-AC-6 | desktop.spec (refs da BASE); suítes completas no R0 |

JIRA-AC-3 (usar /impeccable, /design-taste-frontend e Apple HIG) é atendido no desenho (Research Brief: design read, HIG de alvo/segmentos, WCAG 2.2.2) e conferido no review.

## Review Focus
- Portal dentro da árvore de outro componente: nó sobrevive a re-render do NhanduPage (teste em T03).
- Vídeo escondido no mobile continua tocando e gastando bateria (teste em T03: pausado).
- CTA fixo some e não volta, ou fica clicável invisível (teste em T03: `pointer-events`).
- Canvas ASCII recalcula com o painel em fluxo (convergência no `.phone`): sem frase atrás do texto (teste em T02, AC-1).
- Override que vaza para desktop (teste em T01/T02: desktop.spec contra refs da BASE).

## Checks canônicos
Lint: n/a (sem script) · Tipos: n/a (sem script; JSX) · Testes: `PW_CHANNEL=chrome npx playwright test layout states motion refino enhance --project=chrome` e `--project=safari` (WebKit via `PLAYWRIGHT_BROWSERS_PATH` do scratchpad, ver estado) · Visual: `npx playwright test visual desktop` · SEO: `PW_CHANNEL=chrome npm run test:seo` · Build: `npm run build` · E2E: n/a

`desktop.spec` e `visual.spec` só valem contra build de produção (`npm run build && npx next start -p 3100`): o controlador roda os dois apenas na BASE (referências) e no R0. Em P7 o servidor é `next dev`, e implementadores não rodam desktop/visual.

## Fora de escopo
- Desktop (≥ 641 px) sem mudança visual; tablets 641–1099 só recebem o ajuste de `.rv` (AC-10) já existente na faixa ≤ 1099.
- Cabeçalho translúcido sobre seções escuras; páginas /demo, /briefing, /privacidade, /termos.
- Arquivo de vídeo novo (MP4/WebM); reconversão do canvas.

---

### T01 — Prova de desktop e cobertura visual

ID: T01
Files: tests/responsive/desktop.spec.js, tests/responsive/visual.spec.js, package.json, .gitignore, README.md
Depends-on: none
Covers: AC-11, AC-12
Capacidade: leve
Interfaces:
- Produces: `npm run test:desktop` e `npm run test:desktop:update`; seções `camadas-intro` e `demo` no visual.spec

- [ ] Passo 1: criar `tests/responsive/desktop.spec.js`. No topo: `test.use({ isMobile: false, hasTouch: false, deviceScaleFactor: 1, userAgent: <UA de Chrome desktop de devices['Desktop Chrome'].userAgent> })`. Para `[1280, 900]` e `[1440, 900]`, e para cada seção de `SECTIONS` (as 11 do visual.spec + `['camadas-intro', '#camadas .layers-intro']` + `['demo', '.vframe']`): `openAt(page, '/', w, h)`, `scrollIntoViewIfNeeded`, `expect(locator).toHaveScreenshot('desk-<nome>-<w>.png', { animations: 'disabled', mask: [page.locator('canvas'), page.locator('video')], maxDiffPixelRatio: 0.01 })`. Duplicar a lista de seções no desktop.spec, com comentário apontando o visual.spec (o Playwright recusa um spec importando outro).
      Verificação: `PW_CHANNEL=chrome npx playwright test desktop --project=chrome --list` lista 26 testes
- [ ] Passo 2: em `visual.spec.js`, acrescentar `['camadas-intro', '#camadas .layers-intro']` e `['demo', '.vframe']` a `SECTIONS`; mascarar também `video` (`mask: [page.locator('canvas'), page.locator('video')]`).
      Verificação: `--list` do visual mostra as 2 seções novas
- [ ] Passo 3: `package.json`: scripts `"test:desktop": "playwright test desktop"` e `"test:desktop:update": "playwright test desktop --update-snapshots"`. `.gitignore`: linha `tests/responsive/__screenshots__/` (referências dependem do sistema que as gerou).
      Verificação: `node -e "process.exit(require('./package.json').scripts['test:desktop']?0:1)"` sai 0; `git check-ignore tests/responsive/__screenshots__/x.png` imprime o caminho
- [ ] Passo 4: README, seção "Testes de responsividade mobile": parágrafo sobre `test:desktop` (contexto de desktop real em 1280 e 1440; gere as referências na versão aprovada antes de mexer em CSS e compare depois) e sobre as seções novas do visual.
      Verificação: leitura
- [ ] Passo 5: NÃO gerar referências (o controlador gera na BASE). Reportar status, arquivos e saídas. Sem commit.

### T02 — Ajustes de layout mobile em app/mobile.css

ID: T02
Files: app/mobile.css, tests/responsive/refino.spec.js, tests/responsive/motion.spec.js, README.md
Depends-on: T01
Covers: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-8 (teste do campo focado), AC-9, AC-10
Capacidade: média
Interfaces:
- Consumes: classes do markup gerado (`.hero-bg`, `.fmini`, `.pill b`, `.panel`, `.phone`, `.agc`, `.ptabs`, `.cta-big .arr`, `#camadas .layers-intro`, `.lv1 .wf/.to/.fin/.fin-h/.fin-b/.fin-img/.pin`, `.sticky`, `.track`, `.fcard`, `.sec`, `.rv`)
- Produces: nenhum seletor novo usado por T03

Cada passo: primeiro o teste em `refino.spec.js` (vermelho contra o CSS atual), depois a regra em `app/mobile.css` (verde). Use `openAt` de helpers.js. Testes com animação ligada usam `test.use({ reducedMotion: 'no-preference' })`. Larguras: `[320, 344, 360, 390, 430, 640]` salvo indicação.

- [ ] Passo 1 (AC-1): teste "hero: fundo ASCII fora do texto": `top(.hero-bg) ≥ bottom(.fmini) − 8` e `getComputedStyle(.hero-bg).maskImage` (ou `webkitMaskImage`) ≠ `none`. Teste também que a máscara tem componente vertical (`maskImage` contém `to bottom` ou duas camadas): começa vermelho. Regra ≤ 640: `.hero-bg{top:auto;bottom:0;height:<H>px}`, com H **medido depois do painel em fluxo** e ≤ (fim da hero − fim do `.fmini`) − 8 em todas as larguras 320–640 (o painel em fluxo fica ≈ 52 + 500 + 159 − 40; medidas da BASE em 04-research-brief.md, seção "Medidas do hero"); o teste vermelho primeiro decide; a troca de altura dispara o ResizeObserver do canvas e reposiciona a convergência no `.phone`) e `mask-image: linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent), linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent); mask-composite: intersect` (+ `-webkit-mask-composite: source-in`). Conferir em captura que a convergência continua no celular.
- [ ] Passo 2 (AC-2): teste "hero: selo da pílula em 1 linha". Regra ≤ 640: `.pill b{white-space:nowrap;flex:none}` e `.pill{align-items:center}`.
- [ ] Passo 3 (AC-3): testes "hero: controle segmentado" (mesmo `top`, altura ≥ 44, `bottom(.ptabs) ≤ top(.phone)`) e "hero: painel sem vazio" (`top(.agc) ≤ bottom(.phone) + 16`, `bottom(.panel) − bottom(.agc) ≤ 24`), ambos com reduce; e "hero: agenda aparece depois da troca" (no-preference, 390 px: clicar na aba "Serviços", esperar 2000 ms, opacidade do `.agc` visível ≥ 0,99). Regra ≤ 640: `.panel{height:auto;display:flex;flex-direction:column;align-items:stretch}`; `.panel .ptabs,.panel .phone,.panel .agc{position:relative;inset:auto}`; `.ptabs{order:-1}` como trilho segmentado (fundo `var(--bg3)`, raio 999, padding 4, `display:grid;grid-auto-flow:column;grid-auto-columns:1fr`, `flex-wrap:nowrap`), botões com `min-height:44px`, `padding:0 6px`, `font-size:13px`, `white-space:nowrap`; selecionado mantém `.on`. Abaixo de 360 px: `grid-auto-columns:auto`, botões `padding:0 4px`, `font-size:12px`; o teste exige `scrollWidth ≤ clientWidth` em cada botão e `right(.ptabs) ≤ vw`. Rodar também `PW_CHANNEL=chrome npx playwright test layout --project=chrome -g "320|344"` neste passo. `.phone` centralizado (`align-self:center`), `.agc` com `margin-top:-40px`, largura total e `animation-delay:1s` (longhand; termina em 1,8 s). Remover a regra L4 antiga (`.panel .agc{bottom:62px}`) de mobile.css. Atualizar `motion.spec.js` › "hero: abas não cobrem o cartão de agenda" (continua válido: abas acima, agenda abaixo; manter o teste e ajustar só se a geometria nova exigir).
- [ ] Passo 4 (AC-4): teste "calculadora: CTA com seta junto ao texto" (medir o fim do texto com `Range` sobre os nós de texto do `.cta-big`; distância até `left(.arr)` ≤ 16 e mesma linha; em 430 e 640, altura ≤ 60). Regra ≤ 640: `.cta-big{display:block;text-align:center;font-size:15.5px;text-wrap:balance;padding:15px 20px}` e `.cta-big .arr{display:inline-block;margin-left:6px}` (a seta segue a última palavra; `.btn` é inline-flex e deixaria a seta como item solto); manter o resto do L5.
- [ ] Passo 5 (AC-5): teste "camadas: título com respiro". Regra ≤ 640: `#camadas .layers-intro{padding-top:72px}` (o `padding-top` zera hoje nessa faixa; não tocar no lateral `!important`).
- [ ] Passo 6 (AC-6): teste "camadas: revisão da página sem sobreposição" (usar `.lv.lv1`: `.lv1` também existe na calculadora) em 390×664, 375×553 e 320×568: rolar até `top(.track) + 0,22 × altura(.track)` (passo 2; conferir `.lv1` visível), checar as asserções do AC-6. Regras ≤ 640: `.lv.lv1 .wf,.lv.lv1 .to{display:none}`; `.lv.lv1 .fin{height:auto;min-height:0;padding-bottom:28px}` (o `small` "aprovada" continua no rodapé do cartão sem cobrir o botão); `.lv.lv1 .fin-h{max-width:58%}`; pinos têm `left/top` inline e `margin` no page.css: usar `!important` e `margin:0`. `.lv.lv1 .fin .pin:nth-of-type(2)` (pino 1; o `.fin-b` é o 1º span) em `top:28px;right:4px;left:auto` (canto da `.fin-img`, que é absoluta em right 10/top 34); `.lv.lv1 .fin .pin:nth-of-type(3)` (pino 2) ancorado por `bottom` em px a partir do fundo do `.fin`, colado à direita do botão `.fin-b` ("Falar no WhatsApp", largura fixa); `.fin-h` com `min-height` de 2 linhas para o botão ficar sempre na mesma altura em 320–640. Conferir também em `max-height:799px` e `max-height:649px`.
- [ ] Passo 7 (AC-9): teste "cartões sem vazio interno". Regra ≤ 640: `.fcard{min-height:0;gap:16px;justify-content:flex-start}`; `.fast{padding-bottom:72px}`.
- [ ] Passo 8 (AC-10): teste "ritmo: seções e títulos". Regras: ≤ 640 `.sec{padding:72px 0}` (mantendo o `paddingTop:24px` inline de `#faq`); ≤ 1099 dentro de `@supports (animation-timeline: view())` e `prefers-reduced-motion:no-preference`: `.rv{animation-range:entry 0% entry 70% !important}`.
- [ ] Passo 9: `motion.spec.js` › "CTA fixo some com campo focado": antes das asserções, rolar até `#pratica` no topo (`el.scrollIntoView({block:'start'})` + 2 rAF); focar `#f-nome` e `#c-ticket` com `el.focus({ preventScroll: true })` via `page.evaluate`, para o teste não depender de onde a página para (T03 esconde o CTA perto de outros CTAs). Além de `toBeVisible`, conferir `opacity` > 0,95 e `pointer-events` ≠ `none` quando visível. Em todos os testes novos que rolam com animação ligada, zerar `scroll-behavior` como o `openForScroll` do motion.spec.
- [ ] Passo 10: rodar `PW_CHANNEL=chrome npx playwright test refino motion layout --project=chrome` (servidor :3100 do controlador). README: acrescentar à lista "O que cada teste … cobra" os itens do refino.
- [ ] Passo 11: reportar status, arquivos e saídas. Sem commit.

### T03 — Demo mobile no lugar do vídeo e CTA fixo inteligente

ID: T03
Files: components/MobileEnhance.jsx, app/mobile-enhance.css, app/layout.jsx, app/page.jsx, tests/responsive/enhance.spec.js, README.md
Depends-on: T02
Covers: AC-7, AC-8
Capacidade: média
Interfaces:
- Consumes: `figure.vframe` com `video` e `button.vbtn` (gerado), `.nh`, `.mcta`, `#form-diag`, `.final`, `#camadas .sticky`, `a[href="#form-diag"]`, `a[href="#comecar"]`
- Produces: `export default function MobileEnhance()` ('use client'), renderizado em `app/page.jsx` logo depois de `<NhanduPage />`; classes `.mdemo`, `.mdemo-btn`; atributo `html[data-mcta="off"]`

- [ ] Passo 1 (testes primeiro, `enhance.spec.js`, vermelho):
  - "demo mobile: substitui o vídeo" (320, 390, 640; `test.use({ reducedMotion: 'no-preference' })`, porque com reduce o próprio boot() já pausa): depois de `settle` + 500 ms, `.vframe video` não visível e `paused === true`; `.vframe .mdemo` visível, altura ≥ 360.
  - "demo mobile: legível e tocável" (390): todo elemento com texto dentro de `.mdemo` tem `font-size ≥ 11px`; `.mdemo-btn` ≥ 44×44 com `aria-label`.
  - "demo mobile: avança, pausa e retoma" (390, no-preference): rolar `.vframe` para o centro; `data-step` de `.mdemo` aumenta em 3 s; clicar `.mdemo-btn` → `aria-label` vira "Retomar demonstração" e `data-step` não muda em 2 s; clicar de novo → volta a avançar.
  - "demo mobile: para fora da tela" (390, no-preference): rolar para o topo; `data-step` não muda em 2 s.
  - "demo mobile: movimento reduzido" (390, reduce): `data-step` = último passo; `document.getAnimations()` dentro de `.mdemo` vazio.
  - "demo mobile: sobrevive ao re-render" (390): clicar na aba "Imobiliária" do hero; `.vframe .mdemo` ainda presente.
  - "demo mobile: desktop mantém o vídeo" (641 e 1280): `.mdemo` ausente ou oculto; `.vframe video` visível.
  - "CTA fixo: some perto de CTA equivalente" (375×780): com `#pratica` no topo, `.mcta` com opacidade 1; no topo da página, com `#form-diag` centralizado, com `.final` centralizado e com a história de `#camadas` no passo 2: opacidade < 0,05 (esperar a transição) e `pointer-events` = `none`.
- [ ] Passo 2: `components/MobileEnhance.jsx` ('use client'):
  - CTA fixo: `IntersectionObserver` (sem listener de scroll) sobre `#topo .cta-row`, `.nh main a[href="#form-diag"]`, `.nh main a[href="#comecar"]`, `#form-diag`, `.final`, `#camadas .sticky`; contar alvos com `intersectionRatio > 0` (alvo encostado na borda não conta; `rootMargin:"-1px 0px"`) e alternar `data-mcta="off"` em `document.documentElement` (não mexer no className do `.nh`, que o React controla). Rodar só com `matchMedia('(max-width:640px)')`; limpar no unmount e na troca de faixa.
  - Demo: com `(max-width:640px)`, criar `div` dentro de `figure.vframe` e montar `.mdemo` via `createPortal`; pausar o `<video>` e manter pausado com um listener `play` que pausa de novo enquanto ≤ 640 (o `boot()` do NhanduPage chama `play()` ~80 ms depois do mount); ao passar a > 640, remover o listener e dar `play()` com `.catch(()=>{})` só se o vídeo tocava antes da pausa feita pelo componente (não contrariar a pausa do usuário). Passos com `setTimeout` encadeado (não `setInterval` fixo), pausados pelo botão e por `IntersectionObserver` da `.vframe`; `prefers-reduced-motion: reduce` → passo final fixo, sem timer. `data-step` no `.mdemo`. Botão `.mdemo-btn` com ícones de play/pausa iguais aos do `.vbtn` (mesmos SVGs).
  - Linha do tempo (s → passo), laço de 15 s: 0,5 bolha 1 "Oi! Vocês fazem clareamento?" + ficha "Novo contato" com "Identificando interesse…"; 2 bolha 2 "Fazemos, sim. Você prefere manhã ou tarde?" + ficha título "Clareamento dental", Origem "landing/instagram"; 3,5 bolha 3 "Tarde, depois das 17h" + Preferência "tarde, após 17h" + selo "Qualificado"; 5 bolha 4 "Tenho quinta, 17h30, com a Dra. Helena. Posso reservar?"; 6,5 bolha 5 "Pode!"; 7,5 bolha 6 "Reservado. Um lembrete chega na véspera." + selo "Agendado" + Horário "qui · 17:30" + Responsável "recepção"; 8,5 linha 17:30 da agenda vira "Clareamento · paciente #0481 / via agente no WhatsApp"; 9,5 nota "Recepção avisada, resumo da conversa enviado"; 14 esmaece tudo; 15 recomeça. Cabeçalhos: conversa "Clínica Aurora / Agente Nhandu · online"; ficha "Paciente #0481"; agenda "Agenda · qui, 12 nov" + "sincronizada" e linhas 09:00 Limpeza · Marcos S., 14:00 Retorno · Pedro A., 16:30 livre, 17:30 livre→agendado, 18:30 livre.
  - Composição vertical (Persuade, identidade do site): três blocos empilhados com 12 px entre si: conversa (bolhas claras/escuras como o celular do hero, altura fixa com as bolhas ancoradas embaixo), ficha (cartão `var(--bg2)`, título em Newsreader, linhas chave/valor em Geist 12–13 px, selo em Geist Mono 11 px), agenda (cartão escuro `#1B1815`, linhas em Geist Mono 11–12 px, linha agendada com fundo de acento). Fio fino de ligação entre blocos. Entradas: `opacity` + `translateY(8px)`, 0,45 s `cubic-bezier(.2,.7,.2,1)`. Altura estável (sem pulo de layout entre passos).
      Verificação: `PW_CHANNEL=chrome npx playwright test enhance --project=chrome -g "avança|fora da tela|reduzido|re-render|CTA fixo"` verde
- [ ] Passo 3: `app/mobile-enhance.css`, importado em `app/layout.jsx` logo depois de `./mobile.css` (CSS global só em layout; ordem de import = ordem da cascata): todo seletor prefixado com `.nh`: ≤ 640 `.nh .vframe{aspect-ratio:auto;padding:14px}`, `.nh .vframe video,.nh .vframe .vbtn{display:none}`; estilos `.nh .mdemo*`; `.nh .mcta` com `bottom:max(12px, env(safe-area-inset-bottom))` e `transition:opacity .25s, transform .3s`; `html[data-mcta="off"] .nh .mcta{opacity:0;transform:translateY(16px);pointer-events:none}`; com reduce, sem transição. Nada fora de `@media (max-width:640px)`. Limitação registrada (F17): sem `viewport-fit=cover` no viewport, `env(safe-area-inset-bottom)` vale 0; a regra fica pronta e não muda nada hoje.
      Verificação: `PW_CHANNEL=chrome npx playwright test enhance --project=chrome -g "substitui|desktop"` verde
- [ ] Passo 4: `app/page.jsx`: importar e renderizar `<MobileEnhance />` depois de `<NhanduPage />`. `app/layout.jsx`: `import './mobile-enhance.css'` logo depois de `./mobile.css`.
      Verificação: `PW_CHANNEL=chrome npx playwright test enhance --project=chrome` verde
- [ ] Passo 5: rodar `PW_CHANNEL=chrome npx playwright test enhance motion --project=chrome`. README: parágrafo curto sobre a demo mobile e o CTA fixo (onde fica o texto da demo, como trocar por um vídeo vertical).
- [ ] Passo 6: reportar status, arquivos e saídas. Sem commit.

## Ondas
| Onda | Tarefas | Por que |
|---|---|---|
| 1 | T01 | Referências de desktop precisam ser geradas pelo controlador na BASE, antes de qualquer CSS |
| 2 | T02 | Depende de T01 (README, testes); muda o layout que T03 observa |
| 3 | T03 | Depende de T02 (README; geometria do hero e de `#camadas`) |

Passo do controlador entre T01 e T02: com o servidor de produção da BASE em :3100, `PW_CHANNEL=chrome npx playwright test desktop --project=chrome --update-snapshots` e o mesmo para `--project=safari`; depois rodar de novo sem `--update-snapshots` (verde). Só então trocar para `next dev -p 3100`.

Passo do controlador depois da onda 3: build de produção em :3100; `npx playwright test visual --update-snapshots` (chrome e safari) para as referências mobile novas e depois `npx playwright test visual desktop` sem update (2ª rodada verde = AC-11; desktop contra as refs da BASE = AC-12).

## Cobertura
| AC / Review Focus | Tarefas | Teste |
|---|---|---|
| AC-1 | T02 | refino.spec › hero: fundo ASCII fora do texto |
| AC-2 | T02 | refino.spec › hero: selo da pílula em 1 linha |
| AC-3 | T02 | refino.spec › hero: controle segmentado / painel sem vazio / agenda aparece depois da troca |
| AC-4 | T02 | refino.spec › calculadora: CTA com seta junto ao texto |
| AC-5 | T02 | refino.spec › camadas: título com respiro |
| AC-6 | T02 | refino.spec › camadas: revisão da página sem sobreposição |
| AC-7 | T03 | enhance.spec › demo mobile: … |
| AC-8 | T03, T02 | enhance.spec › CTA fixo; motion.spec › CTA fixo some com campo focado |
| AC-9 | T02 | refino.spec › cartões sem vazio interno |
| AC-10 | T02 | refino.spec › ritmo: seções e títulos |
| AC-11 | T01 | visual.spec (2ª rodada verde) |
| AC-12 | T01 | desktop.spec contra refs da BASE; suítes no R0 |
| RF portal/re-render | T03 | enhance.spec › sobrevive ao re-render |
| RF vídeo escondido | T03 | enhance.spec › substitui o vídeo (paused) |
| RF CTA invisível clicável | T03 | enhance.spec › CTA fixo (pointer-events) |
| RF canvas | T02 | refino.spec › fundo ASCII |
| RF vazamento p/ desktop | T01 | desktop.spec |

## Emenda 1 (2026-11-15, pós-R10, decisão do usuário "e" → F-006 opção b)
- AC-8 ampliado: o CTA fixo também some enquanto qualquer parte do hero (`#topo`) estiver na tela (antes: só `#topo .cta-row`). Motivo: em 320×568 o CTA fixo cobria o texto do hero na abertura e, em qualquer largura, a agenda do celular (prints 3 e 12, F-006).
- Files: `components/MobileEnhance.jsx` (CTA_TARGETS), `tests/responsive/enhance.spec.js` (CTA fixo: some em todo o hero, 320×568 e 390×844).
- Fora: foto de #time (opção c) não entra.
- Ajuste de teste (F-012): `tests/responsive/visual.spec.js` esconde cabeçalho e CTA fixos nas capturas de seção (`tests/responsive/visual-overlays.css`), porque a posição deles dependia da rolagem da captura e 10 casos falhavam já na HEAD 9a493a6.

## Emenda 2 (2026-11-16, decisão do usuário "e" → F-006 opção c)
- AC-8 ampliado: o CTA fixo some enquanto uma foto do time (`#time .tmc img`) passa pela faixa de baixo da tela (15% inferiores, onde o CTA fica); volta entre as fotos.
- Files: `components/MobileEnhance.jsx` (segundo IntersectionObserver com rootMargin -85% no topo), `tests/responsive/enhance.spec.js` (CTA fixo: some sobre as fotos do time, 320×568 e 390×844).
- Ajuste de teste (F-013): `tests/responsive/helpers.js` `openAt` espera a demo mobile montar (hidratação) antes de medir ou capturar; as referências do visual regeneradas no F-012 tinham pegado o quadro da demo vazio.
