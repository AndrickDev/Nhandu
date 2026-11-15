import { test, expect } from '@playwright/test';
import { KEY_WIDTHS, openAt } from './helpers';

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
          // Desenhos animados em canvas mudam a cada quadro; ficam fora da comparação.
          mask: [page.locator('canvas')],
          maxDiffPixelRatio: 0.01,
        });
      });
    }
  });
}
