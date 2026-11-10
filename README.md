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
3. Em **Settings > Environment Variables**, cadastre as variáveis do arquivo `.env.example`. As principais são `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_CNPJ` e um destino de pedidos (`DIAGNOSTICO_WEBHOOK_URL` ou `RESEND_API_KEY` + `DIAGNOSTICO_EMAIL`).
4. Em **Settings > Domains**, adicione `nhandu.com.br` e siga as instruções de DNS no registro.br.

Depois disso, cada `git push` publica uma nova versão.

## Pedidos de diagnóstico

O formulário envia para `/api/diagnostico` nome, empresa, WhatsApp e segmento, mais os números da calculadora (contatos por mês, % fora do horário, fechamento, valor do cliente, clientes e receita em jogo), a página de origem e os parâmetros UTM. A rota repassa o pedido para o webhook e/ou o e-mail configurados. Sem destino configurado, o pedido aparece só nos logs da Vercel.

## Páginas para vender (fora do Google)

- **`/demo/nutricao`**: landing de demonstração para nutricionistas, com nome, foto e dados de exemplo. O botão no topo alterna entre "Antes do CRN" (lista de espera) e "Agenda aberta". O link "Quero uma assim" usa o `NEXT_PUBLIC_WHATSAPP`.
- **`/briefing/nutricao`** (também `/briefing/clinica` e `/briefing/confeitaria`): formulário que a cliente preenche depois de fechar. O rascunho fica salvo no navegador dela, e o envio vai para `/api/briefing`, que repassa ao `BRIEFING_WEBHOOK_URL`/`BRIEFING_EMAIL` ou, sem eles, aos destinos do diagnóstico. **Sem nenhum destino configurado, o envio falha de propósito**, para o briefing não se perder em silêncio.

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
