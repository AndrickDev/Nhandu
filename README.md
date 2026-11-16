# Site da Nhandu

Landing page da Nhandu em Next.js, pronta para a Vercel.

## Rodar no computador

```bash
npm install
npm run dev        # http://localhost:3000
```

## Publicar na Vercel

1. Suba esta pasta para um repositório no GitHub.
2. Em vercel.com, clique em **Add New > Project** e importe o repositório. A Vercel detecta o Next.js sozinha.
3. Em **Settings > Environment Variables**, cadastre as variáveis do arquivo `.env.example`. As principais são `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_CNPJ` e um destino de pedidos (`DIAGNOSTICO_WEBHOOK_URL` ou `RESEND_API_KEY` + `DIAGNOSTICO_EMAIL`). Cadastre também `NEXT_PUBLIC_SITE_URL=https://nhandu.tech` em **Production**: é ela que define a URL canônica, o sitemap, o JSON-LD e o destino do redirecionamento.
4. Em **Settings > Domains**, adicione `nhandu.tech` e siga as instruções de DNS no registro do domínio. Adicione também `www.nhandu.tech` configurado para redirecionar para `nhandu.tech`.

Depois disso, cada `git push` publica uma nova versão.

## SEO

O que existe no site:
- `robots.txt` e `sitemap.xml` gerados pelo Next (`app/robots.js`, `app/sitemap.js`).
- Título, descrição, URL canônica e Open Graph em cada página.
- Dados estruturados (JSON-LD) na página inicial.
- Endereços `*.vercel.app` redirecionam (308) para o domínio final, mantendo caminho e parâmetros, mas só em builds de produção (`VERCEL_ENV=production`) e só quando a URL do site (`NEXT_PUBLIC_SITE_URL`) não é um `*.vercel.app`. Em preview e no computador não há redirecionamento. O 308 é permanente e os navegadores o guardam em cache, então o domínio final precisa estar ativo antes do deploy que o usa. Para reverter: a regra é calculada no build; para desligar, defina `NEXT_PUBLIC_SITE_URL` com um endereço `*.vercel.app` (ou remova a regra de `lib/site.mjs`) e faça novo deploy de produção. Navegadores que já guardaram o 308 continuam redirecionando até limpar o cache.
- A URL única de cada deploy de produção (`<projeto>-<hash>.vercel.app`) também redireciona para o domínio final. Para inspecionar um deploy específico, use um deploy de preview.
- `lib/site.mjs` é a fonte única da URL do site, do e-mail de contato e do Open Graph base.

Testes: `npm run test:seo` (compila o site e sobe um servidor local na porta 3200). Para usar o Chrome já instalado: `PW_CHANNEL=chrome npm run test:seo`.

Depois de publicar:
- Cadastre o domínio no Google Search Console e envie `https://nhandu.tech/sitemap.xml`.
- Cadastre também no Bing Webmaster Tools.
- Na Vercel, confirme `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_CNPJ`, `NEXT_PUBLIC_RAZAO_SOCIAL`, `NEXT_PUBLIC_CONTATO_EMAIL` e `NEXT_PUBLIC_SITE_URL` (em Production, com `https://nhandu.tech`).

## Pedidos de diagnóstico

O formulário envia para `/api/diagnostico` nome, empresa, WhatsApp e segmento, mais os números da calculadora (contatos por mês, % fora do horário, fechamento, valor do cliente, clientes e receita em jogo), a página de origem e os parâmetros UTM. A rota repassa o pedido para o webhook e/ou o e-mail configurados. Sem destino configurado, o pedido aparece só nos logs da Vercel.

## Páginas para vender (fora do Google)

- **`/demo/nutricao`**: landing de demonstração para nutricionistas, com nome, foto e dados de exemplo. O botão no topo alterna entre "Antes do CRN" (lista de espera) e "Agenda aberta". O link "Quero uma assim" usa o `NEXT_PUBLIC_WHATSAPP`.
- **`/briefing/nutricao`** (também `/briefing/clinica` e `/briefing/confeitaria`): formulário que a cliente preenche depois de fechar. O rascunho fica salvo no navegador dela, e o envio vai para `/api/briefing`, que grava na tabela `briefings` do Supabase (`SUPABASE_URL` + `SUPABASE_SECRET_KEY`; criar a tabela com `supabase/briefings.sql`) e avisa no `BRIEFING_WEBHOOK_URL`/`BRIEFING_EMAIL` ou, sem eles, nos destinos do diagnóstico. **Sem nenhum destino configurado, o envio falha de propósito**, para o briefing não se perder em silêncio.

As perguntas ficam em `lib/briefing.js`: para um nicho novo, adicione um bloco em `NICHOS`.

## Como a página é gerada

A página foi desenhada no canvas de design (artboard `Main.dc.html`). O arquivo `tools/convert.py` converte esse artboard em `components/NhanduPage.jsx` e `app/page.css`. Ajustes que só existem em produção (WhatsApp, formulário, CNPJ, links legais) ficam em `tools/convert.py` e `lib/prod.js`.

Para trazer uma nova versão do canvas:

```bash
python3 tools/convert.py caminho/para/Main.dc.html .
npm run build
```

## Pendências

- Trocar a faixa de segmentos pelas logos dos clientes piloto.
- Revisar Privacidade e Termos com um advogado antes de anunciar.
- Adicionar o Pixel da Meta e o Google Analytics quando começarem os anúncios (com aviso de cookies).

## Testes de responsividade mobile

Suíte em Playwright (`tests/responsive/`) que confere o site em telas de celular e tablet, no Chrome e no Safari (WebKit).

```bash
npx playwright install chromium webkit   # uma vez, baixa os navegadores
npm run test:mobile          # layout em cada largura + página em uso (perguntas abertas, calculadora, formulário) + movimento na rolagem
npm run test:mobile:sweep    # varredura contínua de 320 a 480 px, de 2 em 2
npm run test:mobile:update   # gera ou atualiza as imagens de referência
npm run test:mobile:visual   # compara cada seção com a imagem de referência
npm run test:desktop         # compara as seções no desktop real (1280 e 1440 px) com as referências
npm run test:desktop:update  # gera as referências de desktop
```

O `test:desktop` roda em contexto de desktop real (sem emulação de celular) em 1280 e 1440 px. Gere as referências na versão aprovada, antes de mexer em CSS, e compare depois: qualquer diferença no desktop aparece como falha. O visual também cobre a introdução de `#camadas` (`camadas-intro`) e o quadro do vídeo (`demo`). As referências ficam fora do git (dependem do sistema que as gerou); gere-as localmente.

Por padrão a suíte compila o site e sobe um servidor local. Para testar um endereço publicado, use `BASE_URL`:

```bash
BASE_URL=https://nhandu.tech npm run test:mobile
```

Para rodar só no Chrome já instalado, sem baixar navegadores: `PW_CHANNEL=chrome npx playwright test layout states motion --project=chrome`.

Ajustes de celular e tablet ficam em `app/mobile.css`, mantido à mão e importado depois do `app/page.css` gerado: corrija ali o que vier do canvas, sem editar o arquivo gerado.

O que cada teste de layout cobra, em cada largura:

- a página não rola para os lados;
- nenhum botão, link, título ou texto passa da borda da tela;
- nenhum texto de botão ou título é cortado;
- alvos de toque com 24 px ou mais, ou com folga até o vizinho;
- nenhuma fonte abaixo de 10 px;
- campos de formulário com 16 px ou mais (abaixo disso o Safari do iPhone dá zoom ao focar);
- nenhum botão, link ou resumo com texto além da própria caixa (`texto-transborda`).

Páginas cobertas: home, privacidade, termos, demo (`/demo/nutricao`) e briefing (`/briefing/nutricao`).

O que cada teste de movimento (`motion`) cobra, com a animação ligada:

- seções inteiras na tela: até 1099 px nenhuma seção visível fica cortada, transparente ou reduzida durante a rolagem;
- entradas não saem da tela: nenhum título, texto, link ou botão passa da borda lateral enquanto entra com a animação;
- rolagem só com transform e opacity: as animações ligadas à rolagem não animam propriedades que forçam repintura, e os alvos conhecidos usam os keyframes leves;
- passo a passo ignora `--vh`: a altura do bloco fixo não muda quando `--vh` muda, até 1099 px;
- reduzir movimento: com `prefers-reduced-motion: reduce` nenhuma animação roda dentro da página;
- desktop intacto: em 1280 px as animações e o comportamento originais continuam;
- hero: as abas de segmento não cobrem o cartão de agenda;
- CTA fixo some com campo focado, em 375 px.

Larguras, páginas e limites ficam em `tests/responsive/helpers.js`. As imagens de referência ficam em `tests/responsive/__screenshots__/` e valem só para o sistema que as gerou. O relatório com imagens e passo a passo de cada falha abre com `npx playwright show-report`.
