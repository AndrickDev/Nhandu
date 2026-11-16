import { test, expect } from '@playwright/test';
import path from 'node:path';
import { KEY_WIDTHS, openAt } from './helpers';

const OVERLAYS_CSS = path.join(__dirname, 'visual-overlays.css');

// Comparação de imagem, seção por seção, contra a referência salva.
// Gere ou atualize as referências com: npm run test:mobile:update
const SECTIONS = [
  ['cabecalho', 'header.hdr'],
  ['hero', '#topo'],
  ['calculadora', '#calculadora'],
  ['pratica', '#pratica'],
  ['solucoes', '#solucoes'],
  ['produtos', '#produtos'],
  ['comecar', '#comecar'],
  ['compromissos', '#compromissos'],
  ['time', '#time'],
  ['faq', '#faq'],
  ['rodape', 'footer.foot'],
  ['camadas-intro', '#camadas .layers-intro'],
  ['demo', '.vframe'],
];

const VIEWPORTS = [...KEY_WIDTHS.map((w) => [w, undefined]), [1024, undefined], [667, 375]];

for (const [width, height] of VIEWPORTS) {
  const label = height ? `${width}x${height}` : `${width}`;
  test.describe(`visual: home ${label}px`, () => {
    for (const [name, selector] of SECTIONS) {
      test(name, async ({ page }) => {
        await openAt(page, '/', width, height);
        const section = page.locator(selector).first();
        await section.scrollIntoViewIfNeeded();
        await expect(section).toHaveScreenshot(`${name}-${label}.png`, {
          animations: 'disabled',
          // Desenhos em canvas e o vídeo mudam a cada quadro; ficam fora da comparação.
          mask: [page.locator('canvas'), page.locator('video')],
          maxDiffPixelRatio: 0.01,
          // Overlays fixos fora da captura das seções (o próprio cabeçalho segue capturado).
          ...(name === 'cabecalho' ? {} : { stylePath: OVERLAYS_CSS }),
        });
      });
    }
  });
}
