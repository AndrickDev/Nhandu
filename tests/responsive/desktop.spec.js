import { test, expect, devices } from '@playwright/test';
import { openAt } from './helpers';

// Prova de desktop real (sem isMobile/hasTouch): compara cada seção com referências
// geradas na versão aprovada, antes de mexer em CSS. Gere com: npm run test:desktop:update
test.use({
  isMobile: false,
  hasTouch: false,
  deviceScaleFactor: 1,
  userAgent: devices['Desktop Chrome'].userAgent,
});

// Mesma lista de SECTIONS do visual.spec.js (o Playwright recusa um spec importando outro).
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

for (const [width, height] of [
  [1280, 900],
  [1440, 900],
]) {
  test.describe(`desktop: home ${width}px`, () => {
    for (const [name, selector] of SECTIONS) {
      test(name, async ({ page }) => {
        await openAt(page, '/', width, height);
        const section = page.locator(selector).first();
        await section.scrollIntoViewIfNeeded();
        await expect(section).toHaveScreenshot(`desk-${name}-${width}.png`, {
          animations: 'disabled',
          // Canvas e vídeo mudam a cada quadro; ficam fora da comparação.
          mask: [page.locator('canvas'), page.locator('video')],
          maxDiffPixelRatio: 0.01,
        });
      });
    }
  });
}
