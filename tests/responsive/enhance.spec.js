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
  test.use({ reducedMotion: 'no-preference' });
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

// Review F-005: o NhanduPage precisa de fato re-renderizar (troca de aba) e a demo seguir no mesmo nó.
test.describe('demo mobile: sobrevive ao re-render', () => {
  test.use({ reducedMotion: 'no-preference' });
  test('390px', async ({ page }) => {
    await openAt(page, '/', 390);
    await expect(page.locator('.vframe .mdemo')).toHaveCount(1);
    await page.evaluate(() => {
      window.__mdemo = document.querySelector('.vframe .mdemo');
    });
    const tab = page.locator('.ptabs button', { hasText: 'Imobiliária' });
    await expect(tab).toHaveAttribute('aria-pressed', 'false');
    await tab.click();
    await expect(tab, 'aba não mudou: sem re-render').toHaveAttribute('aria-pressed', 'true');
    await frames(page, 3);
    expect(await page.evaluate(() => document.querySelector('.vframe .mdemo') === window.__mdemo), 'demo remontada ou perdida').toBe(true);
    expect(await page.evaluate(() => window.__mdemo.isConnected)).toBe(true);
    await expect(page.locator('.vframe .mdemo-btn')).toHaveCount(1);
  });
});

// Review F-003: com movimento reduzido a demo é estática; o botão de pausa não aparece.
test.describe('demo mobile: sem botão de pausa com movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });
  test('390px', async ({ page }) => {
    await openAt(page, '/', 390);
    await expect(page.locator('.vframe .mdemo')).toHaveCount(1);
    await expect(page.locator('.vframe .mdemo-btn')).toHaveCount(0);
  });
});

// Review F-007: pausar no esmaecimento do fim do laço não deixa o quadro vazio nem esconde o botão.
test.describe('demo mobile: pausa no fim do laço', () => {
  test.use({ reducedMotion: 'no-preference' });
  test('390px', async ({ page }) => {
    test.setTimeout(45000);
    await openForScroll(page, 390, 844);
    await centerFrame(page);
    await expect.poll(() => step(page), { timeout: 20000, intervals: [50] }).toBe(9);
    const btn = page.locator('.vframe .mdemo-btn');
    await page.waitForTimeout(500);
    // Opacidade efetiva: produto da do botão com a de todos os ancestrais.
    const effective = await btn.evaluate((el) => {
      let o = 1;
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= parseFloat(getComputedStyle(n).opacity);
      return o;
    });
    expect(effective, 'botão esmaecido junto com a demo').toBe(1);
    await btn.click();
    await expect(btn).toHaveAttribute('aria-label', 'Retomar demonstração');
    const last = Number(await page.locator('.vframe .mdemo').getAttribute('data-last'));
    expect(await step(page), 'pausada fora do passo final').toBe(last);
    await page.waitForTimeout(700);
    const cards = await page.evaluate(() =>
      [...document.querySelectorAll('.vframe .mdemo > .m-card')].map((el) => parseFloat(getComputedStyle(el).opacity)),
    );
    expect(cards.every((o) => o === 1), `cartões visíveis: ${cards}`).toBe(true);
    await btn.click();
    await expect(btn).toHaveAttribute('aria-label', 'Pausar demonstração');
    await expect.poll(() => step(page), { timeout: 8000, intervals: [100] }).not.toBe(last);
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

test.describe('demo mobile: vídeo e botão coerentes ao passar para desktop', () => {
  test.use({ reducedMotion: 'no-preference' });
  test('390px para 1024px', async ({ page }) => {
    // O boot() do NhanduPage chama play() uma vez; o `hold` do celular o aborta e o catch dele marca
    // demoPaused = true. A corrida depende de tempo, então o 1º play() é rejeitado de forma determinística.
    await page.addInitScript(() => {
      const play = HTMLMediaElement.prototype.play;
      let first = true;
      HTMLMediaElement.prototype.play = function () {
        if (first) {
          first = false;
          return Promise.reject(new DOMException('aborted by pause()', 'AbortError'));
        }
        return play.call(this);
      };
    });
    await openAt(page, '/', 390, 844);
    await page.waitForTimeout(1000);
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect
      .poll(() => page.evaluate(() => !document.querySelector('.vframe video').paused), { timeout: 3000 })
      .toBe(true);
    await expect(page.locator('.vframe .vbtn')).toHaveAttribute('aria-label', 'Pausar a demonstração');
  });
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

// Review F-006: o CTA fixo não cobre nada do hero (texto na abertura em telas baixas, agenda do celular).
test.describe('CTA fixo: some em todo o hero', () => {
  test.use({ reducedMotion: 'no-preference' });
  for (const [w, h] of [[320, 568], [390, 844]]) {
    test(`${w}x${h}`, async ({ page }) => {
      await openForScroll(page, w, h);
      const opacity = () => page.locator('.mcta').evaluate((el) => parseFloat(getComputedStyle(el).opacity));
      const settle = async () => {
        await frames(page, 3);
        await page.waitForTimeout(700);
      };
      await settle();
      expect(await opacity(), 'abertura').toBeLessThan(0.05);
      for (const sel of ['#topo .phone', '#topo .agc']) {
        await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), sel);
        await settle();
        expect(await opacity(), sel).toBeLessThan(0.05);
      }
      // Fim do hero colado na base da tela: ainda escondido.
      await page.evaluate(() => {
        const r = document.querySelector('#topo').getBoundingClientRect();
        window.scrollTo({ top: r.bottom + window.scrollY - window.innerHeight + 4, behavior: 'instant' });
      });
      await settle();
      expect(await opacity(), 'fim do hero').toBeLessThan(0.05);
    });
  }
});

// Review F-006 (c): o CTA fixo não cobre as fotos do time, mas volta entre elas.
test.describe('CTA fixo: some sobre as fotos do time', () => {
  test.use({ reducedMotion: 'no-preference' });
  for (const [w, h] of [[320, 568], [390, 844]]) {
    test(`${w}x${h}`, async ({ page }) => {
      await openForScroll(page, w, h);
      const opacity = () => page.locator('.mcta').evaluate((el) => parseFloat(getComputedStyle(el).opacity));
      const settle = async () => {
        await frames(page, 3);
        await page.waitForTimeout(700);
      };
      const n = await page.locator('#time .tmc img').count();
      expect(n).toBeGreaterThan(0);
      let back = 0;
      for (let i = 0; i < n; i++) {
        // Meio da foto na altura do CTA fixo.
        await page.evaluate((k) => {
          const img = document.querySelectorAll('#time .tmc img')[k];
          const cta = document.querySelector('.mcta').getBoundingClientRect();
          const r = img.getBoundingClientRect();
          const ctaMid = (cta.top + cta.bottom) / 2;
          window.scrollTo({ top: r.top + window.scrollY + r.height / 2 - ctaMid, behavior: 'instant' });
        }, i);
        await settle();
        expect(await opacity(), `foto ${i + 1}`).toBeLessThan(0.05);
        // Sem foto e sem outro alvo sob o CTA: o CTA volta (texto do cartão abaixo da foto).
        const free = await page.evaluate((k) => {
          const img = document.querySelectorAll('#time .tmc img')[k];
          const tb = img.closest('.tmc').querySelector('.tb').getBoundingClientRect();
          const cta = document.querySelector('.mcta').getBoundingClientRect();
          window.scrollTo({ top: tb.bottom + window.scrollY - cta.bottom + 4, behavior: 'instant' });
          const band = window.innerHeight * 0.15;
          const imgs = [...document.querySelectorAll('#time .tmc img')].map((x) => x.getBoundingClientRect());
          return imgs.every((r) => r.bottom <= window.innerHeight - band || r.top >= window.innerHeight);
        }, i);
        if (free) {
          await settle();
          expect(await opacity(), `texto do cartão ${i + 1}`).toBe(1);
          back++;
        }
      }
      expect(back, 'o CTA volta entre as fotos ao menos uma vez').toBeGreaterThan(0);
    });
  }
});

// Review F-001: texto de 11 px dos chips da ficha precisa de contraste WCAG AA (4,5:1).
test.describe('demo mobile: contraste dos chips da ficha', () => {
  test.use({ reducedMotion: 'reduce' });
  test('390px', async ({ page }) => {
    await openForScroll(page, 390, 844);
    const chips = await page.evaluate(() => {
      const parse = (s) => {
        const m = s.match(/[\d.]+/g).map(Number);
        return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 };
      };
      const over = (top, bot) => ({
        r: top.r * top.a + bot.r * (1 - top.a),
        g: top.g * top.a + bot.g * (1 - top.a),
        b: top.b * top.a + bot.b * (1 - top.a),
        a: 1,
      });
      const lum = ({ r, g, b }) => {
        const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
        return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
      };
      const el = document.querySelector('.vframe .m-chip');
      const saved = el.className;
      const out = ['m-n', 'm-q', 'm-ok'].map((state) => {
        el.className = `m-chip on ${state}`;
        const cs = getComputedStyle(el);
        const card = parse(getComputedStyle(el.closest('.m-ficha')).backgroundColor);
        const bg = over(parse(cs.backgroundColor), card);
        const fg = parse(cs.color);
        const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
        return { cls: state, size: parseFloat(cs.fontSize), ratio: (a + 0.05) / (b + 0.05) };
      });
      el.className = saved;
      return out;
    });
    expect(chips.length).toBeGreaterThanOrEqual(3);
    for (const c of chips) expect(c.ratio, `${c.cls} (${c.size}px) razão ${c.ratio.toFixed(2)}`).toBeGreaterThanOrEqual(4.5);
  });
});

// Review F-002: com o CTA fixo escondido, o foco por teclado não pode cair num controle invisível.
test.describe('CTA fixo: foco por teclado revela o CTA escondido', () => {
  test.use({ reducedMotion: 'no-preference' });
  test('375x780', async ({ page }) => {
    await openForScroll(page, 375, 780);
    await page.waitForTimeout(700);
    expect(await page.evaluate(() => document.documentElement.dataset.mcta), 'precisa estar escondido no topo').toBe('off');
    await page.locator('.mcta').focus();
    await page.waitForTimeout(700);
    expect(await page.evaluate(() => document.documentElement.dataset.mcta), 'segue escondido ao focar').toBe('off');
    const s = await page.locator('.mcta').evaluate((el) => ({
      focused: document.activeElement === el,
      opacity: parseFloat(getComputedStyle(el).opacity),
      pe: getComputedStyle(el).pointerEvents,
    }));
    expect(s.focused).toBe(true);
    expect(s.opacity, 'opacidade com foco').toBeGreaterThanOrEqual(0.95);
    expect(s.pe).not.toBe('none');
  });
});
