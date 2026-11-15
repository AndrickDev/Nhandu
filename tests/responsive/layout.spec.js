import { test, expect } from '@playwright/test';
import { PAGES, WIDTHS, audit, format, openAt } from './helpers';

// Cada página, carregada do zero em cada largura, sem nenhum problema de layout.
for (const { name, path } of PAGES) {
  test.describe(`layout: ${name}`, () => {
    for (const width of WIDTHS) {
      test(`${width}px`, async ({ page }) => {
        await openAt(page, path, width);
        const problems = await audit(page);
        expect(problems, format(problems)).toEqual([]);
      });
    }
  });
}

// Celular deitado: pouca altura, onde cabeçalho fixo e botões fixos mais atrapalham.
test.describe('layout: home deitada', () => {
  for (const [width, height] of [[667, 375], [844, 390], [932, 430]]) {
    test(`${width}x${height}px`, async ({ page }) => {
      await openAt(page, '/', width, height);
      const problems = await audit(page);
      expect(problems, format(problems)).toEqual([]);
    });
  }
});
