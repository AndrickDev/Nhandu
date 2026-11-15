import { test, expect } from '@playwright/test';
import { format, heightFor, openAt } from './helpers';

// Percorre a página de cima a baixo, em meia tela por vez, e junta o que `check` achar em cada passo.
// O page.css liga scroll-behavior:smooth sem reduce; sem zerar, a amostra sairia num scrollY atrasado.
async function scrollThrough(page, check, arg) {
  return page.evaluate(async ({ checkSource, arg }) => {
    const fn = new Function(`return (${checkSource})`)();
    document.documentElement.style.scrollBehavior = 'auto';
    const raf = () => new Promise((r) => requestAnimationFrame(r));
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ys = [];
    for (let y = 0; y < max; y += window.innerHeight / 2) ys.push(y);
    ys.push(max);
    const found = [];
    for (const y of ys) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await raf();
      await raf();
      for (const item of fn(Math.round(window.scrollY), arg)) if (!found.includes(item)) found.push(item);
    }
    return found;
  }, { checkSource: check.toString(), arg });
}

// Abre a página e zera o scroll suave (o settle() de helpers.js rola com scrollTo simples).
async function openForScroll(page, path, width, height = heightFor(width)) {
  await openAt(page, path, width, height);
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
}

const MOBILE_WIDTHS = [375, 768, 1024];

test.describe('movimento: seções inteiras na tela', () => {
  test.use({ reducedMotion: 'no-preference' });
  for (const width of MOBILE_WIDTHS) {
    test(`${width}px`, async ({ page }) => {
      test.setTimeout(120_000);
      await openForScroll(page, '/', width);
      const problems = await scrollThrough(page, (scrollY) => {
        const out = [];
        for (const el of document.querySelectorAll('.nh main > *, .nh main > * > section')) {
          const r = el.getBoundingClientRect();
          if (r.bottom <= 0 || r.top >= window.innerHeight) continue;
          const cs = getComputedStyle(el);
          const cls = '.' + String(el.className).trim().split(/\s+/).join('.');
          if (cs.clipPath !== 'none') out.push(`${cls} com clip-path ${cs.clipPath} em scrollY ${scrollY}`);
          if (parseFloat(cs.opacity) < 0.99) out.push(`${cls} com opacidade ${cs.opacity} em scrollY ${scrollY}`);
          if (cs.transform !== 'none') {
            const m = cs.transform.match(/^matrix\(([^,]+),/);
            if (m && parseFloat(m[1]) < 0.99) out.push(`${cls} com escala ${m[1]} em scrollY ${scrollY}`);
          }
        }
        return out;
      });
      expect(problems, format(problems)).toEqual([]);
    });
  }
});

test.describe('movimento: rolagem só com transform e opacity', () => {
  test.use({ reducedMotion: 'no-preference' });
  const ALLOWED = ['transform', 'opacity', 'translate', 'scale', 'rotate'];
  const SVG_ONLY = ['strokeDashoffset', 'strokeDasharray'];
  const SKIP = ['offset', 'easing', 'composite', 'computedOffset'];
  for (const width of MOBILE_WIDTHS) {
    test(`${width}px`, async ({ page }) => {
      test.setTimeout(120_000);
      await openForScroll(page, '/', width);
      const forbidden = await scrollThrough(
        page,
        (_y, { allowed, svgOnly, skip }) => {
          const found = [];
          for (const a of document.getAnimations()) {
            if (!a.timeline || a.timeline === document.timeline) continue;
            const t = a.effect?.target;
            const props = new Set();
            for (const kf of a.effect?.getKeyframes?.() ?? []) for (const k of Object.keys(kf)) if (!skip.includes(k)) props.add(k);
            const bad = [...props].filter((p) => !allowed.includes(p) && !(svgOnly.includes(p) && t instanceof SVGElement));
            if (!bad.length) continue;
            const sel = t ? t.tagName.toLowerCase() + (t.className && typeof t.className === 'string' ? '.' + t.className.trim().split(/\s+/).join('.') : '') : '?';
            found.push(`${a.animationName} em ${sel} anima ${bad.join(', ')}`);
          }
          return found;
        },
        { allowed: ALLOWED, svgOnly: SVG_ONLY, skip: SKIP },
      );
      expect(forbidden, `\npropriedades proibidas em animações de rolagem:\n  ${forbidden.join('\n  ')}\n`).toEqual([]);

      const supported = await page.evaluate(() => CSS.supports('animation-timeline: view()'));
      if (!supported) return;
      const targets = [
        { sel: '.wd', expected: 'wInM' },
        { sel: '.split .sol-r', expected: 'rvIn' },
        { sel: '.tmc img', expected: 'rvIn' },
      ];
      const missing = [];
      for (const { sel, expected } of targets) {
        const names = await page.evaluate((s) => {
          const el = document.querySelector(s);
          if (!el) return null;
          return el
            .getAnimations()
            .filter((a) => a.timeline && a.timeline !== document.timeline)
            .map((a) => a.animationName);
        }, sel);
        if (!names || !names.includes(expected)) missing.push(`${sel} deveria rodar ${expected} com timeline de rolagem; roda: ${JSON.stringify(names)}`);
      }
      expect(missing, `\n${missing.join('\n')}\n`).toEqual([]);
    });
  }
});

test('movimento: passo a passo ignora --vh', async ({ page }) => {
  for (const [width, height] of [[375, 780], [1024, 1024]]) {
    await openAt(page, '/', width, height);
    const read = () =>
      page.evaluate(() => ({
        track: document.querySelector('.track')?.getBoundingClientRect().height,
        sticky: document.querySelector('.sticky')?.getBoundingClientRect().height,
      }));
    const antes = await read();
    expect(antes.track, `${width}px: .track ausente`).toBeGreaterThan(0);
    expect(antes.sticky, `${width}px: .sticky ausente`).toBeGreaterThan(0);
    await page.evaluate(async () => {
      document.querySelector('.nh').style.setProperty('--vh', '2000px');
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    });
    const depois = await read();
    expect(depois, `${width}px: altura de .track/.sticky mudou com --vh`).toEqual(antes);
  }
});

test.describe('movimento: reduzir movimento', () => {
  test.use({ reducedMotion: 'reduce' });
  for (const width of [375, 1024]) {
    test(`${width}px`, async ({ page }) => {
      await openAt(page, '/', width);
      const running = await page.evaluate(() =>
        document
          .getAnimations()
          .filter((a) => a.playState === 'running' && a.effect?.target?.closest?.('.nh'))
          .map((a) => `${a.animationName || a.transitionProperty || '?'} em ${a.effect.target.tagName.toLowerCase()}.${String(a.effect.target.className).trim().split(/\s+/).join('.')}`),
      );
      expect(running, `\nanimações em execução com reduce:\n  ${running.join('\n  ')}\n`).toEqual([]);
    });
  }
});

test('movimento: desktop intacto', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openAt(page, '/', 1280, 900);
  const info = await page.evaluate(() => ({
    supported: CSS.supports('animation-timeline: view()'),
    circ: document.querySelector('.circ') && getComputedStyle(document.querySelector('.circ')).animationName,
    wd: document.querySelector('.wd') && getComputedStyle(document.querySelector('.wd')).animationName,
  }));
  if (info.supported) {
    expect(info.circ).toBe('circC');
    expect(info.wd).toBe('wIn');
  }
  await expect(page.locator('.hdr .btn-solid').first()).toBeVisible();
  const read = () => page.evaluate(() => document.querySelector('.track').getBoundingClientRect().height);
  const antes = await read();
  await page.evaluate(async () => {
    document.querySelector('.nh').style.setProperty('--vh', '2000px');
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  expect(await read()).not.toBe(antes);
});

test.describe('movimento: hero: abas não cobrem o cartão de agenda', () => {
  test.use({ reducedMotion: 'reduce' });
  for (const width of [320, 360, 390, 430, 640]) {
    test(`${width}px`, async ({ page }) => {
      await openAt(page, '/', width);
      const overlap = await page.evaluate(() => {
        const a = document.querySelector('.panel .agc')?.getBoundingClientRect();
        const t = document.querySelector('.ptabs')?.getBoundingClientRect();
        if (!a || !t) return `elemento ausente (agc: ${!!a}, ptabs: ${!!t})`;
        const w = Math.min(a.right, t.right) - Math.max(a.left, t.left);
        const h = Math.min(a.bottom, t.bottom) - Math.max(a.top, t.top);
        if (w <= 0 || h <= 0) return null;
        return `.ptabs cobre .panel .agc em ${Math.round(w)}x${Math.round(h)}px`;
      });
      expect(overlap).toBeNull();
    });
  }
});

test('movimento: CTA fixo some com campo focado', async ({ page }) => {
  await openAt(page, '/', 375, 780);
  await expect(page.locator('.mcta')).toBeVisible();
  await page.locator('#f-nome').focus();
  await expect(page.locator('.mcta')).toBeHidden();
});
