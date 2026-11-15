import { test, expect } from '@playwright/test';

test.use({ reducedMotion: 'no-preference', viewport: { width: 390, height: 844 } });

test('hero sem animação de opacidade', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  const els = await page.$$('.hero .h1 span, .hero .hero-p');
  expect(els.length).toBe(3);
  for (const el of els) {
    const r = await el.evaluate((e) => {
      const anims = e.getAnimations();
      return {
        name: getComputedStyle(e).animationName,
        riseIn: anims.filter((a) => a.animationName === 'riseIn').length,
        hasOpacity: anims
          .flatMap((a) => a.effect.getKeyframes())
          .some((k) => 'opacity' in k),
        opacity: getComputedStyle(e).opacity,
      };
    });
    expect(r.name).toBe('riseIn');
    expect(r.riseIn).toBeGreaterThanOrEqual(1);
    expect(r.hasOpacity).toBe(false);
    expect(r.opacity).toBe('1');
  }
});
