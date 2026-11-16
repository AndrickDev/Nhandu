import { test, expect } from '@playwright/test';
import { openAt } from './helpers';

// Melhorias só de celular (mobile-refino, T03): demo vertical no lugar do vídeo e CTA fixo inteligente.

// Abre a página e zera o scroll suave (o page.css liga scroll-behavior:smooth sem reduce).
async function openForScroll(page, width, height) {
  await openAt(page, '/', width, height);
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
}

const frames = (page, n = 2) =>
  page.evaluate(async (k) => {
    for (let i = 0; i < k; i++) await new Promise((r) => requestAnimationFrame(r));
  }, n);

const centerFrame = async (page) => {
  await page.evaluate(() => {
    const v = document.querySelector('.vframe');
    const r = v.getBoundingClientRect();
    window.scrollTo({ top: r.top + window.scrollY - (window.innerHeight - r.height) / 2, behavior: 'instant' });
  });
  await frames(page);
};

const step = (page) => page.locator('.vframe .mdemo').getAttribute('data-step').then(Number);

test.describe('demo mobile: substitui o vídeo', () => {
  test.use({ reducedMotion: 'no-preference' });
  for (const width of [320, 390, 640]) {
    test(`${width}px`, async ({ page }) => {
      await openAt(page, '/', width);
      await page.waitForTimeout(500);
      const info = await page.evaluate(() => {
        const v = document.querySelector('.vframe video');
        const d = document.querySelector('.vframe .mdemo');
        return {
          videoShown: !!v && v.getBoundingClientRect().width > 0 && getComputedStyle(v).display !== 'none',
          paused: v.paused,
          demoH: d ? d.getBoundingClientRect().height : 0,
        };
      });
      expect(info.videoShown, 'vídeo visível').toBe(false);
      expect(info.paused, 'vídeo tocando escondido').toBe(true);
      expect(info.demoH).toBeGreaterThanOrEqual(360);
    });
  }
});

test.describe('demo mobile: legível e tocável', () => {
  test('390px', async ({ page }) => {
    await openAt(page, '/', 390);
    const info = await page.evaluate(() => {
      const d = document.querySelector('.vframe .mdemo');
      const small = [];
      const tw = document.createTreeWalker(d, NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        if (!n.nodeValue.trim()) continue;
        const size = parseFloat(getComputedStyle(n.parentElement).fontSize);
        if (size < 11) small.push(`${n.nodeValue.trim().slice(0, 20)} ${size}px`);
      }
      const b = document.querySelector('.vframe .mdemo-btn').getBoundingClientRect();
      return { small, w: b.width, h: b.height, label: document.querySelector('.vframe .mdemo-btn').getAttribute('aria-label') };
    });
    expect(info.small).toEqual([]);
    expect(info.w).toBeGreaterThanOrEqual(44);
    expect(info.h).toBeGreaterThanOrEqual(44);
    expect(info.label).toBeTruthy();
  });
});

test.describe('demo mobile: avança, pausa e retoma', () => {
  test.use({ reducedMotion: 'no-preference' });
  test('390px', async ({ page }) => {
    await openForScroll(page, 390, 844);
    await centerFrame(page);
    const first = await step(page);
    await page.waitForTimeout(3000);
    expect(await step(page), 'não avançou em 3 s').toBeGreaterThan(first);
    const btn = page.locator('.vframe .mdemo-btn');
    await expect(btn).toHaveAttribute('aria-label', 'Pausar demonstração');
    await btn.click();
    await expect(btn).toHaveAttribute('aria-label', 'Retomar demonstração');
    const held = await step(page);
    await page.waitForTimeout(2000);
    expect(await step(page), 'avançou pausada').toBe(held);
    await btn.click();
    await expect(btn).toHaveAttribute('aria-label', 'Pausar demonstração');
    await page.waitForTimeout(3000);
    expect(await step(page), 'não retomou').not.toBe(held);
  });
});

test.describe('demo mobile: para fora da tela', () => {
  test.use({ reducedMotion: 'no-preference' });
  test('390px', async ({ page }) => {
    await openForScroll(page, 390, 844);
    await page.waitForTimeout(300);
    const before = await step(page);
    await page.waitForTimeout(2000);
    expect(await step(page), 'avançou fora da tela').toBe(before);
  });
});

test.describe('demo mobile: movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });
  test('390px', async ({ page }) => {
    await openForScroll(page, 390, 844);
    await centerFrame(page);
    await page.waitForTimeout(500);
    const last = await page.evaluate(() => Number(document.querySelector('.vframe .mdemo').dataset.last));
    expect(last).toBeGreaterThan(0);
    expect(await step(page)).toBe(last);
    const running = await page.evaluate(() => document.querySelector('.vframe .mdemo').getAnimations({ subtree: true }).length);
    expect(running).toBe(0);
  });
});

test.describe('demo mobile: sobrevive ao re-render', () => {
  test('390px', async ({ page }) => {
    await openAt(page, '/', 390);
    await expect(page.locator('.vframe .mdemo')).toHaveCount(1);
    await page.locator('.ptabs button', { hasText: 'Imobiliária' }).click();
    await page.waitForTimeout(400);
    await expect(page.locator('.vframe .mdemo')).toHaveCount(1);
    await expect(page.locator('.vframe .mdemo-btn')).toHaveCount(1);
  });
});

test.describe('demo mobile: desktop mantém o vídeo', () => {
  test.use({ reducedMotion: 'no-preference' });
  for (const width of [641, 1280]) {
    test(`${width}px`, async ({ page }) => {
      await openAt(page, '/', width, 900);
      const info = await page.evaluate(() => {
        const d = document.querySelector('.vframe .mdemo');
        const v = document.querySelector('.vframe video');
        return {
          demoShown: !!d && d.getBoundingClientRect().width > 0 && getComputedStyle(d).display !== 'none',
          videoShown: v.getBoundingClientRect().width > 0 && getComputedStyle(v).display !== 'none',
        };
      });
      expect(info.demoShown, 'demo aparece no desktop').toBe(false);
      expect(info.videoShown, 'vídeo sumiu').toBe(true);
    });
  }
});

test.describe('CTA fixo: some perto de CTA equivalente', () => {
  test.use({ reducedMotion: 'no-preference' });
  test('375x780', async ({ page }) => {
    await openForScroll(page, 375, 780);
    const state = () =>
      page.locator('.mcta').evaluate((el) => ({ opacity: parseFloat(getComputedStyle(el).opacity), pe: getComputedStyle(el).pointerEvents }));
    const goTo = async (fn) => {
      await page.evaluate(fn);
      await frames(page, 3);
      await page.waitForTimeout(700);
    };
    const expectOff = async (what) => {
      const s = await state();
      expect(s.opacity, `${what}: opacidade`).toBeLessThan(0.05);
      expect(s.pe, `${what}: pointer-events`).toBe('none');
    };

    await goTo(() => document.querySelector('#pratica').scrollIntoView({ block: 'start' }));
    const on = await state();
    expect(on.opacity, 'em #pratica').toBe(1);
    expect(on.pe).not.toBe('none');
    expect(await page.evaluate(() => document.documentElement.dataset.mcta)).not.toBe('off');

    await goTo(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expectOff('topo da página');

    await goTo(() => document.querySelector('#form-diag').scrollIntoView({ block: 'center' }));
    await expectOff('formulário');

    await goTo(() => document.querySelector('.final').scrollIntoView({ block: 'center' }));
    await expectOff('seção final');

    await goTo(() => {
      const t = document.querySelector('.track').getBoundingClientRect();
      window.scrollTo({ top: t.top + window.scrollY + 0.22 * t.height, behavior: 'instant' });
    });
    await expectOff('história de #camadas');

    await goTo(() => document.querySelector('#pratica').scrollIntoView({ block: 'start' }));
    expect((await state()).opacity, 'voltou a aparecer').toBe(1);
  });
});
