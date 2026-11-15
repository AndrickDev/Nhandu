# Spec — responsivo-mobile: responsividade mobile e animações fluidas
Status: decidido por delegação em 2026-11-15 (claude-opus-5-5; autorização: invocação `/factory` com a descrição da task)
Jira: — (sem Jira) · Research Brief: .work/responsivo-mobile/04-research-brief.md

## Intenção e porquê
O pedido: "revisão geral do design responsivo e correção" no celular, e animações "bem fluidas". A auditoria de 2026-11-15 (suíte `test:mobile`, capturas a 375px com animação ligada, sondas de DOM e inventário de animações) achou sete problemas de layout (L1–L7) e animações de rolagem que, no celular, escondem conteúdo ou animam propriedades caras de pintar (M1, M3). A correção mantém o desenho e o movimento; muda o mecanismo onde ele quebra no celular.

## Objetivos, não-objetivos, anti-objetivos
- Objetivos: zerar os problemas de layout da auditoria em celular e tablet (home, páginas legais, demo, briefing); nenhuma seção escondida, esmaecida ou encolhida enquanto está na tela no celular; animações de rolagem do celular só em transform/opacity; altura do passo a passo estável quando a barra do navegador do iPhone recolhe; testes que travam tudo isso.
- Não-objetivos: redesenho, texto, desktop (≥1100px fica igual), regerar a página pelo canvas.
- Anti-objetivos: tirar o movimento do celular (as entradas de elementos continuam); editar à mão `app/page.css` ou `components/NhanduPage.jsx` (gerados).

## Restrições
- Arquivos gerados intocados; sem dependência nova; `prefers-reduced-motion` continua desligando tudo.

## Decisões tomadas (do usuário)
- Pediu revisão geral + correção + animações fluidas, sem listar pontos.

## Decisões delegadas (do coordenador, por delegação)
1. **Onde corrigir:** novo `app/mobile.css`, mantido à mão, importado em `app/layout.jsx` depois de `page.css`. `tools/convert.py` só grava os dois gerados, então o arquivo sobrevive a uma reconversão. Protótipo injetado na página: a cascata vence as regras `!important` relevantes (auditoria limpa em 11 tamanhos).
2. **Faixa "celular e tablet" = ≤1099px**, onde o layout já vira uma coluna. Em 1024px a seção `.circ` tem 1.896px (1.114px no desktop): o problema existe até 1099.
3. **CTA do cabeçalho some em ≤640px.** Nessa faixa o CTA fixo `.mcta` já existe e o do cabeçalho não cabe (sai da tela até ~364px).
4. **Efeitos de seção inteira** (`.circ`, `.open`, `.reveal`, `.lift`, `.zi`, `.zo`, `.fold`) desligados em ≤1099: em seções de 2–4 mil px eles deixam centenas de px vazios (`circle()` centrado no meio da seção) ou esmaecem o fim da seção enquanto ainda é lido. Fade da seção inteira foi testado e descartado (bloco escuro acinzentado).
5. **Efeitos de elemento** continuam, com mecanismo composto: palavras (`.wd`) sem `filter: blur` (mantêm subida + opacidade); painel de foto (`.split .sol-r`) e fotos da equipe (`.tmc img`) trocam `clip-path` por subida + opacidade (`rvIn`).
6. **Altura do passo a passo** (`.track`, `.sticky`) em ≤1099 por `clamp(400px, 100svh, 1200px)` em CSS, sem depender de `--vh` (escrita pelo JS gerado a cada `resize`, que no iPhone dispara quando a barra recolhe). Desktop continua com `--vh`. Sem override de JS gerado.
7. **Overrides de animação dentro de `@media (prefers-reduced-motion: no-preference)`**, senão os `!important` religariam animação para quem pediu menos movimento.
8. **CTA fixo some com um campo focado** (`:has(:focus)`), para não cobrir o campo quando o teclado abre.
9. **Demo `/demo/nutricao`:** menu `.nt-nav` some até 1000px (o CTA sai da tela em 768). Correção no próprio `nutricao.css` (não gerado).
10. **Descartados com motivo:** throttle por rAF no scroll do `NutricaoDemo` (eventos de scroll já saem uma vez por frame); `getComputedStyle` por frame e loop rAF dos canvas no JS gerado (custo medido baixo; mexer exigiria sobrescrever `boot()`); loops decorativos pequenos em propriedades não compostas (`scan`, `ring`, `bFill`, `dashF`, `typ`: áreas de poucos px); `backdrop-filter` do cabeçalho (desenho; risco residual).

## Design
- `app/mobile.css` (novo), em blocos comentados por problema:
  - L1 `.fld input,.fld select{font-size:16px}`.
  - L2 `@media (max-width:640px){.hdr .btn-solid{display:none}}`.
  - L3 `@media (max-height:649px){.st-mini{min-height:24px}}`.
  - L4 `@media (max-width:640px){.panel .agc{bottom:62px}}` (as abas `.ptabs` ficam abaixo do cartão).
  - L5 `@media (max-width:640px){.cta-big{white-space:normal;...}}`.
  - L6/M1 `@media (max-width:1099px) and (prefers-reduced-motion:no-preference)` + `@supports (animation-timeline: view())`: seções inteiras sem animação nem clip; `.split .sol-r`, `.tmc img` com `rvIn`; `.wd` com keyframes sem filter.
  - M3 `@media (max-width:1099px)`: `.track`/`.sticky` com `100svh`.
  - CTA fixo: `.nh:has(input:focus,select:focus,textarea:focus) .mcta{display:none}`.
- `app/layout.jsx`: `import './mobile.css'` depois de `./page.css`.
- `app/demo/nutricao/nutricao.css`: `.nt-nav{display:none}` no bloco ≤1000.
- Testes: auditoria ganha a regra `texto-transborda` (texto de link/botão maior que a caixa, mesmo com overflow visível); `PAGES` inclui `/demo/nutricao` e `/briefing/nutricao`; novo `tests/responsive/motion.spec.js` com animação ligada.
- Docs: README (seção de testes de responsividade e onde ficam os ajustes de celular).

## Critérios de aceite
| ID | Critério (observável) | Origem | Verificação |
|---|---|---|---|
| AC-1 | `layout` e `states` sem problemas em todas as larguras e paisagens, no Chrome e no WebKit, para home, privacidade, termos, `/demo/nutricao` e `/briefing/nutricao` (inclui campos ≥16px, CTA do cabeçalho dentro da tela, alvos de toque, demo a 768px) | proposto (G1) ← pedido | `npm run test:mobile` (projetos chrome e safari) |
| AC-2 | Nenhum link ou botão com texto maior que a própria caixa, inclusive o CTA da calculadora com os sliders no máximo e no mínimo | proposto | regra `texto-transborda` em `layout` e `states` |
| AC-3 | Até 640px, as abas de segmento do hero não se sobrepõem ao cartão de agenda | proposto | `motion.spec.js › hero: abas não cobrem o cartão` (320, 360, 390, 430, 640) |
| AC-4 | Até 1099px com animação ligada, durante a rolagem da home, nenhuma seção da página na tela (inclusive `section` aninhada, como `.lift`) fica recortada (clip-path), esmaecida (opacidade < 1) ou encolhida (escala < 1) | proposto | `motion.spec.js › seções inteiras na tela` (375, 768, 1024) |
| AC-5 | Até 1099px com animação ligada, toda animação ligada à rolagem anima só transform/opacity (stroke-dashoffset aceito em traço SVG); e as entradas de elementos continuam existindo (se o navegador suporta `animation-timeline`) | proposto | `motion.spec.js › rolagem só com transform e opacity` |
| AC-6 | Até 1099px, a altura de `.track` e `.sticky` não muda quando `--vh` muda | proposto | `motion.spec.js › passo a passo ignora --vh` (375, 1024) |
| AC-7 | Com `prefers-reduced-motion: reduce`, nenhuma animação CSS roda na home em 375 e 1024 | proposto | `motion.spec.js › reduzir movimento` |
| AC-8 | Desktop (1280px) igual: `.circ` mantém `circC`, `.wd` mantém `wIn`, CTA do cabeçalho visível, `.track` usa `--vh` | proposto | `motion.spec.js › desktop intacto`; `npm run test:seo` verde |
| AC-9 | Até 640px, com um campo do formulário focado, o CTA fixo `.mcta` não aparece | proposto | `motion.spec.js › CTA fixo some com campo focado` |
| AC-10 | README descreve `app/mobile.css`, a suíte de movimento e remove as "falhas conhecidas" resolvidas | proposto | leitura |

## Riscos e mitigação
- Medição no Chromium/WebKit desktop não representa a GPU do celular → AC por mecanismo (propriedades animadas) e por resultado visível (seções inteiras); relatório final declara que nada foi medido em aparelho.
- Renomeação de classes numa reconversão do canvas → os testes de movimento e layout falham e apontam o seletor.
- WebKit do Playwright sem `animation-timeline` → AC-5 condicionado a `CSS.supports`.

## Ajustes depois da revisão do plano (P4, antes do G2)
O plano é a referência de execução. Três pontos do design acima foram refinados nele:
- L3 vale só até 1099px: `@media (max-width:1099px) and (max-height:649px)`, para não mudar o desktop com janela baixa.
- O CTA fixo ignora os sliders da calculadora: `input:not([type=range]):focus`.
- AC-9 é verificado em 375px (o CTA fixo só existe até 640px).
