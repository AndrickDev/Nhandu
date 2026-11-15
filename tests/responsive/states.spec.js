import { test, expect } from '@playwright/test';
import { KEY_WIDTHS, audit, format, openAt, settle } from './helpers';

// O layout também precisa aguentar a página em uso, não só recém-carregada.
for (const width of KEY_WIDTHS) {
  test.describe(`estados: home ${width}px`, () => {
    test.beforeEach(async ({ page }) => {
      await openAt(page, '/', width);
    });

    test('perguntas frequentes todas abertas', async ({ page }) => {
      await page.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
      await settle(page);
      const problems = await audit(page);
      expect(problems, format(problems)).toEqual([]);
    });

    test('cada painel de soluções aberto', async ({ page }) => {
      const tabs = page.locator('button[aria-expanded]');
      const count = await tabs.count();
      for (let i = 0; i < count; i++) {
        const tab = tabs.nth(i);
        if (!(await tab.isVisible())) continue;
        await tab.click();
        const problems = await audit(page);
        expect(problems, `painel ${i + 1}` + format(problems)).toEqual([]);
      }
    });

    test('calculadora nos valores extremos', async ({ page }) => {
      const sliders = page.locator('input[type=range]');
      const count = await sliders.count();
      expect(count).toBeGreaterThan(0);
      for (const edge of ['max', 'min']) {
        for (let i = 0; i < count; i++) {
          const value = await sliders.nth(i).getAttribute(edge);
          await sliders.nth(i).fill(value);
        }
        const problems = await audit(page);
        expect(problems, `sliders no ${edge}` + format(problems)).toEqual([]);
      }
    });

    test('formulário com textos longos', async ({ page }) => {
      const long = 'Clínica Odontológica e Estética Avançada Doutora Maria Aparecida dos Santos Ltda';
      await page.locator('#f-nome').fill(long);
      await page.locator('#f-emp').fill(long);
      await page.locator('#f-wa').fill('(14) 99999-0000');
      const options = page.locator('#f-seg option');
      await page.locator('#f-seg').selectOption({ index: (await options.count()) - 1 });
      const problems = await audit(page);
      expect(problems, format(problems)).toEqual([]);
    });
  });
}
