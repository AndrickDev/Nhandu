import { test, expect } from '@playwright/test';
import { openAt } from './helpers';

// Refino do mobile (mobile-refino, T02): cada teste cobra um ponto apontado nos prints.
const WIDTHS = [320, 344, 360, 390, 430, 640];

// Abre a página e zera o scroll suave (o page.css liga scroll-behavior:smooth sem reduce).
async function openForScroll(page, width, height) {
  await openAt(page, '/', width, height);
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
}

const rects = (page, sels) =>
  page.evaluate((s) => {
    const out = {};
    for (const [k, sel] of Object.entries(s)) {
      const el = document.querySelector(sel);
      if (!el) {
        out[k] = null;
        continue;
      }
      const r = el.getBoundingClientRect();
      out[k] = { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY, left: r.left, right: r.right, width: r.width, height: r.height };
    }
    return out;
  }, sels);

test.describe('hero: fundo ASCII fora do texto', () => {
  for (const width of WIDTHS) {
    test(`${width}px`, async ({ page }) => {
      await openAt(page, '/', width);
      const r = await rects(page, { bg: '.hero-bg', fmini: '.fmini' });
      expect(r.bg.top, '.hero-bg deve começar abaixo do bloco de texto').toBeGreaterThanOrEqual(r.fmini.bottom - 8);
      const mask = await page.evaluate(() => {
        const cs = getComputedStyle(document.querySelector('.hero-bg'));
        return cs.maskImage && cs.maskImage !== 'none' ? cs.maskImage : cs.webkitMaskImage || 'none';
      });
      expect(mask, 'máscara ausente').not.toBe('none');
      // Máscara vertical e lateral: duas camadas de gradiente.
      expect((mask.match(/linear-gradient\(/g) || []).length, `máscara sem componente vertical: ${mask}`).toBeGreaterThanOrEqual(2);
      // Camada lateral: começa transparente e só fica opaca depois de 20%, para nenhuma frase encostar na borda.
      const lateral = mask.split('linear-gradient(').find((p) => p.startsWith('90deg'));
      expect(lateral, `sem camada lateral: ${mask}`).toBeTruthy();
      const first = lateral.match(/rgba\(0, 0, 0, 0\)/);
      expect(first && first.index, 'camada lateral não começa transparente').toBeLessThan(lateral.search(/rgb\(0, 0, 0\)/));
      const opaque = lateral.match(/rgb\(0, 0, 0\) ([\d.]+)%/);
      expect(opaque, `sem trecho opaco: ${lateral}`).toBeTruthy();
      expect(parseFloat(opaque[1]), 'máscara lateral opaca cedo demais').toBeGreaterThanOrEqual(20);
    });
  }
});

test.describe('hero: selo da pílula em 1 linha', () => {
  for (const width of WIDTHS) {
    test(`${width}px`, async ({ page }) => {
      await openAt(page, '/', width);
      const info = await page.evaluate(() => {
        const b = [...document.querySelectorAll('.pill b')].find((el) => /PARA QUEM/i.test(el.textContent));
        if (!b) return null;
        const range = document.createRange();
        range.selectNodeContents(b);
        return { lines: range.getClientRects().length, height: b.getBoundingClientRect().height };
      });
      expect(info, '<b>PARA QUEM</b> ausente').not.toBeNull();
      expect(info.lines, 'texto do selo em mais de uma linha').toBe(1);
      expect(info.height).toBeLessThan(24);
    });
  }
});

test.describe('hero: controle segmentado', () => {
  for (const width of WIDTHS) {
    test(`${width}px`, async ({ page }) => {
      await openAt(page, '/', width);
      const info = await page.evaluate(() => {
        const tabs = document.querySelector('.ptabs');
        const phone = document.querySelector('.panel .phone');
        const btns = [...tabs.querySelectorAll('button')].map((b) => {
          const r = b.getBoundingClientRect();
          return { top: Math.round(r.top), height: r.height, over: b.scrollWidth - b.clientWidth };
        });
        const t = tabs.getBoundingClientRect();
        return { btns, tabsBottom: t.bottom, tabsRight: t.right, phoneTop: phone.getBoundingClientRect().top, vw: document.documentElement.clientWidth };
      });
      expect(info.btns).toHaveLength(4);
      expect(new Set(info.btns.map((b) => b.top)).size, 'abas em mais de uma linha').toBe(1);
      for (const b of info.btns) {
        expect(b.height, 'alvo menor que 44px').toBeGreaterThanOrEqual(44);
        expect(b.over, 'texto da aba maior que o botão').toBeLessThanOrEqual(0);
      }
      expect(info.tabsBottom, '.ptabs deve terminar acima do celular').toBeLessThanOrEqual(info.phoneTop);
      expect(info.tabsRight, '.ptabs passa da tela').toBeLessThanOrEqual(info.vw);
    });
  }
});

test.describe('hero: painel sem vazio', () => {
  for (const width of WIDTHS) {
    test(`${width}px`, async ({ page }) => {
      await openAt(page, '/', width);
      const r = await rects(page, { agc: '.panel .agc', phone: '.panel .phone', panel: '.panel' });
      expect(r.agc.top, 'agenda longe do celular').toBeLessThanOrEqual(r.phone.bottom + 16);
      expect(r.panel.bottom - r.agc.bottom, 'vazio sob a agenda').toBeLessThanOrEqual(24);
    });
  }
});

test.describe('hero: agenda aparece depois da troca', () => {
  test.use({ reducedMotion: 'no-preference' });
  test('390px', async ({ page }) => {
    await openForScroll(page, 390);
    await page.locator('.ptabs button', { hasText: 'Serviços' }).click();
    await page.waitForTimeout(2000);
    const opacity = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.panel .agc')).opacity));
    expect(opacity).toBeGreaterThanOrEqual(0.99);
  });
});

test.describe('calculadora: CTA com seta junto ao texto', () => {
  for (const width of WIDTHS) {
    test(`${width}px`, async ({ page }) => {
      await openAt(page, '/', width);
      const info = await page.evaluate(() => {
        const btn = document.querySelector('.cta-big');
        const arr = btn.querySelector('.arr');
        const tw = document.createTreeWalker(btn, NodeFilter.SHOW_TEXT);
        let last = null;
        for (let n = tw.nextNode(); n; n = tw.nextNode()) {
          if (!n.nodeValue.trim() || arr.contains(n)) continue;
          const range = document.createRange();
          range.selectNodeContents(n);
          const rs = [...range.getClientRects()];
          if (rs.length) last = rs[rs.length - 1];
        }
        const a = arr.getBoundingClientRect();
        return { height: btn.getBoundingClientRect().height, gap: a.left - last.right, sameLine: a.top < last.bottom && a.bottom > last.top };
      });
      expect(info.sameLine, 'seta em outra linha que o texto').toBe(true);
      expect(info.gap, 'seta solta do texto').toBeLessThanOrEqual(16);
      if (width >= 430) expect(info.height, 'botão em mais de 1 linha').toBeLessThanOrEqual(60);
    });
  }
});

test.describe('camadas: título com respiro', () => {
  for (const width of WIDTHS) {
    test(`${width}px`, async ({ page }) => {
      await openAt(page, '/', width);
      const r = await rects(page, { sec: '#camadas', h2: '#camadas .layers-intro h2' });
      expect(r.h2.top - r.sec.top, 'título colado no topo da seção').toBeGreaterThanOrEqual(64);
    });
  }
});

test.describe('camadas: revisão da página sem sobreposição', () => {
  for (const [width, height] of [[390, 664], [375, 553], [320, 568]]) {
    test(`${width}x${height}`, async ({ page }) => {
      await openForScroll(page, width, height);
      await page.evaluate(() => {
        const t = document.querySelector('.track').getBoundingClientRect();
        window.scrollTo({ top: t.top + window.scrollY + 0.22 * t.height, behavior: 'instant' });
      });
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
      await expect(page.locator('.lv.lv1')).toBeVisible();
      const info = await page.evaluate(() => {
        const box = (el) => {
          const r = el.getBoundingClientRect();
          return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
        };
        const lv = document.querySelector('.lv.lv1');
        const hidden = (sel) => {
          const el = lv.querySelector(sel);
          return !el || getComputedStyle(el).display === 'none';
        };
        const pins = [...lv.querySelectorAll('.pin')].map(box);
        const img = box(lv.querySelector('.fin-img'));
        const btn = box(lv.querySelector('.fin-b'));
        const h = box(lv.querySelector('.fin-h'));
        const c = (b) => ({ x: (b.left + b.right) / 2, y: (b.top + b.bottom) / 2 });
        const dist = (p, b) => Math.hypot(Math.max(b.left - p.x, 0, p.x - b.right), Math.max(b.top - p.y, 0, p.y - b.bottom));
        const inter = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        const p1 = c(pins[0]);
        const ok = box(lv.querySelector('.fin > small'));
        return {
          wfHidden: hidden('.wf'),
          toHidden: hidden('.to'),
          pin1In: p1.x >= img.left && p1.x <= img.right && p1.y >= img.top && p1.y <= img.bottom,
          pin2Dist: dist(c(pins[1]), btn),
          pinOnHeading: pins.some((p) => inter(p, h)),
          okOnBtn: inter(ok, btn),
          pinOnOk: pins.some((p) => inter(p, ok)),
          lvBottom: lv.getBoundingClientRect().bottom,
          stickyBottom: document.querySelector('.sticky').getBoundingClientRect().bottom,
        };
      });
      expect(info.wfHidden, 'rascunho .wf visível').toBe(true);
      expect(info.toHidden, 'seta .to visível').toBe(true);
      expect(info.pin1In, 'pino 1 fora da imagem').toBe(true);
      expect(info.pin2Dist, 'pino 2 longe do botão').toBeLessThanOrEqual(12);
      expect(info.pinOnHeading, 'pino sobre o título').toBe(false);
      // Review F-008: rótulo "aprovada" fora do botão e dos pinos (print 7).
      expect(info.okOnBtn, '"aprovada" sobre o botão').toBe(false);
      expect(info.pinOnOk, 'pino sobre "aprovada"').toBe(false);
      expect(info.lvBottom, 'cartão passa do bloco fixo').toBeLessThanOrEqual(info.stickyBottom);
    });
  }
});

test.describe('cartões sem vazio interno', () => {
  for (const width of WIDTHS) {
    test(`${width}px`, async ({ page }) => {
      await openAt(page, '/', width);
      const bad = await page.evaluate(() =>
        [...document.querySelectorAll('.fcard')]
          .map((c) => {
            const h = (sel) => c.querySelector(sel).getBoundingClientRect().height;
            return { h: c.getBoundingClientRect().height, max: h('.t') + h('p') + 48 + 16 + 2, t: c.querySelector('.t').textContent.trim() };
          })
          .filter((c) => c.h > c.max + 0.5)
          .map((c) => `${c.t}: ${Math.round(c.h)}px, máximo ${Math.round(c.max)}px`),
      );
      expect(bad, `\n${bad.join('\n')}\n`).toEqual([]);
    });
  }
});

test.describe('ritmo: seções e títulos', () => {
  test.use({ reducedMotion: 'no-preference' });
  test('390px', async ({ page }) => {
    await openForScroll(page, 390);
    const pads = await page.evaluate(() => ['#compromissos', '#time'].map((s) => getComputedStyle(document.querySelector(s)).paddingTop));
    expect(pads).toEqual(['72px', '72px']);
    const supported = await page.evaluate(() => CSS.supports('animation-timeline: view()'));
    test.skip(!supported, 'navegador sem animation-timeline');
    const opacity = await page.evaluate(async () => {
      const h2 = document.querySelector('#compromissos h2.rv');
      const y = h2.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.75;
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      return parseFloat(getComputedStyle(h2).opacity);
    });
    expect(opacity, 'título ainda esmaecido a 75% da tela').toBeGreaterThanOrEqual(0.95);
  });
});
