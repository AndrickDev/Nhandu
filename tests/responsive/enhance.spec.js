import { test, expect } from '@playwright/test';
import { openAt } from './helpers';

// Melhorias só de celular (mobile-refino, T03): vídeo vertical da demo no lugar do 16:9 e CTA fixo inteligente.

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

// Estado do vídeo vertical da demo (o que o MobileEnhance monta dentro da .vframe).
const demo = (page) =>
  page.evaluate(() => {
    const v = document.querySelector('.vframe .mdemo-video');
    return v && { paused: v.paused, t: v.currentTime, ready: v.readyState, w: v.videoWidth, h: v.videoHeight, error: v.error ? v.error.code : 0 };
  });

// O vídeo é H.264: um Chromium sem esse codec não o toca (rode com PW_CHANNEL=chrome); Chrome e Safari tocam.
async function needsH264(page) {
  const ok = await page.evaluate(() => document.createElement('video').canPlayType('video/mp4; codecs="avc1.640028"') !== '');
  test.skip(!ok, 'navegador sem H.264 (use PW_CHANNEL=chrome)');
}

const playing = (page) => expect.poll(async () => { const a = await demo(page); await page.waitForTimeout(400); const b = await demo(page); return !b.paused && b.t !== a.t; }, { timeout: 10000 });

test.describe('demo mobile: vídeo vertical no lugar do 16:9', () => {
  test.use({ reducedMotion: 'no-preference' });
  for (const width of [320, 390, 640]) {
    test(`${width}px`, async ({ page }) => {
      await openForScroll(page, width, 844);
      await needsH264(page);
      await centerFrame(page);
      const info = await page.evaluate(() => {
        const f = document.querySelector('.vframe');
        const old = f.querySelector(':scope > video');
        const v = f.querySelector('.mdemo-video');
        const fr = f.getBoundingClientRect();
        const vr = v.getBoundingClientRect();
        return {
          oldShown: getComputedStyle(old).display !== 'none',
          oldPaused: old.paused,
          oldSrc: old.currentSrc,
          oldBtnShown: getComputedStyle(f.querySelector('.vbtn')).display !== 'none',
          frame: [fr.width, fr.height],
          video: [vr.width, vr.height],
          shown: getComputedStyle(v).display !== 'none' && getComputedStyle(v).visibility === 'visible',
          src: v.getAttribute('src'),
          poster: v.getAttribute('poster'),
          attrs: [v.muted, v.loop, v.playsInline, v.preload, v.autoplay],
        };
      });
      expect(info.oldShown, 'vídeo 16:9 visível no celular').toBe(false);
      expect(info.oldBtnShown, 'botão do vídeo 16:9 visível no celular').toBe(false);
      expect(info.oldPaused, 'vídeo 16:9 tocando escondido').toBe(true);
      expect(info.oldSrc, 'vídeo 16:9 carregado no celular').toBe('');
      expect(info.shown, 'vídeo vertical oculto').toBe(true);
      expect(info.src).toBe('/media/demo-mobile.mp4');
      expect(info.poster).toBe('/media/demo-mobile-poster.jpg');
      expect(info.attrs).toEqual([true, true, true, 'metadata', false]);
      // O vídeo ocupa o quadro inteiro e o quadro tem a proporção 9:16 (sem pulo de layout nem faixas).
      expect(Math.abs(info.video[0] - info.frame[0])).toBeLessThanOrEqual(3);
      expect(Math.abs(info.video[1] - info.frame[1])).toBeLessThanOrEqual(3);
      expect(Math.abs(info.frame[0] / info.frame[1] - 9 / 16)).toBeLessThan(0.01);
      expect(info.frame[0]).toBeLessThanOrEqual(width - 40 + 0.5);
      // Toca sozinho com o quadro na tela, e o arquivo é o vertical.
      await playing(page).toBe(true);
      const st = await demo(page);
      expect(st.error).toBe(0);
      expect(st.h, 'vídeo não é vertical').toBeGreaterThan(st.w);
    });
  }
});

// O celular não baixa o vídeo 16:9 (o <source> dele só vale acima de 640 px); o desktop não baixa o vertical (teste abaixo).
test.describe('demo mobile: celular não baixa o vídeo de desktop', () => {
  test.use({ reducedMotion: 'no-preference' });
  for (const width of [320, 390, 640]) {
    test(`${width}px`, async ({ page }) => {
      const media = [];
      page.on('request', (r) => /\/media\/demo[^/]*\.mp4/.test(r.url()) && media.push(new URL(r.url()).pathname));
      await openForScroll(page, width, 844);
      await centerFrame(page);
      await page.waitForTimeout(1500);
      expect(media.filter((u) => u === '/media/demo.mp4'), 'celular pediu o vídeo de desktop').toEqual([]);
      expect(media).toContain('/media/demo-mobile.mp4');
    });
  }
});

test.describe('demo mobile: botão tocável', () => {
  test.use({ reducedMotion: 'no-preference' });
  for (const width of [320, 390, 640]) {
    test(`${width}px`, async ({ page }) => {
      await openAt(page, '/', width);
      const info = await page.evaluate(() => {
        const btn = document.querySelector('.vframe .mdemo-btn');
        const b = btn.getBoundingClientRect();
        const f = document.querySelector('.vframe').getBoundingClientRect();
        return { w: b.width, h: b.height, inside: b.left >= f.left && b.right <= f.right && b.top >= f.top && b.bottom <= f.bottom, label: btn.getAttribute('aria-label') };
      });
      expect(info.w).toBeGreaterThanOrEqual(44);
      expect(info.h).toBeGreaterThanOrEqual(44);
      expect(info.inside, 'botão fora do quadro').toBe(true);
      expect(info.label).toBe('Pausar demonstração');
    });
  }
});

test.describe('demo mobile: toca, pausa e retoma', () => {
  test.use({ reducedMotion: 'no-preference' });
  test('390px', async ({ page }) => {
    await openForScroll(page, 390, 844);
    await needsH264(page);
    await centerFrame(page);
    await playing(page).toBe(true);
    const btn = page.locator('.vframe .mdemo-btn');
    await expect(btn).toHaveAttribute('aria-label', 'Pausar demonstração');
    await btn.click();
    await expect(btn).toHaveAttribute('aria-label', 'Retomar demonstração');
    await expect.poll(async () => (await demo(page)).paused).toBe(true);
    const held = (await demo(page)).t;
    await page.waitForTimeout(1500);
    expect((await demo(page)).t, 'avançou pausado').toBe(held);
    await btn.click();
    await expect(btn).toHaveAttribute('aria-label', 'Pausar demonstração');
    await playing(page).toBe(true);
    expect((await demo(page)).t, 'não retomou de onde parou').toBeGreaterThan(held);
  });
});

test.describe('demo mobile: para fora da tela', () => {
  test.use({ reducedMotion: 'no-preference' });
  test('390px', async ({ page }) => {
    await openForScroll(page, 390, 844);
    await needsH264(page);
    // No topo da página o quadro está fora da tela: não toca.
    await expect.poll(async () => (await demo(page)).paused).toBe(true);
    const still = (await demo(page)).t;
    await page.waitForTimeout(1500);
    expect(await demo(page)).toMatchObject({ paused: true, t: still });
    await centerFrame(page);
    await playing(page).toBe(true);
    // Saiu da tela: pausa; o botão segue em "Pausar" (não foi a pessoa que pausou) e volta a tocar ao retornar.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect.poll(async () => (await demo(page)).paused).toBe(true);
    await expect(page.locator('.vframe .mdemo-btn')).toHaveAttribute('aria-label', 'Pausar demonstração');
    await centerFrame(page);
    await playing(page).toBe(true);
  });
});

test.describe('demo mobile: pausa da pessoa vale ao voltar para a tela', () => {
  test.use({ reducedMotion: 'no-preference' });
  test('390px', async ({ page }) => {
    await openForScroll(page, 390, 844);
    await needsH264(page);
    await centerFrame(page);
    await playing(page).toBe(true);
    await page.locator('.vframe .mdemo-btn').click();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await frames(page, 3);
    await centerFrame(page);
    await page.waitForTimeout(1000);
    expect((await demo(page)).paused, 'voltou a tocar sozinho depois de pausado').toBe(true);
  });
});

// Com movimento reduzido o vídeo não toca sozinho: fica no poster (o estado final da história) e o botão oferece tocar.
test.describe('demo mobile: movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });
  test('390px', async ({ page }) => {
    await openForScroll(page, 390, 844);
    await centerFrame(page);
    await page.waitForTimeout(1500);
    expect(await demo(page)).toMatchObject({ paused: true, t: 0 });
    expect(await page.locator('.vframe .mdemo-video').getAttribute('poster')).toBe('/media/demo-mobile-poster.jpg');
    const poster = await page.evaluate(async () => {
      const img = new Image();
      img.src = document.querySelector('.vframe .mdemo-video').poster;
      await img.decode();
      return [img.naturalWidth, img.naturalHeight];
    });
    expect(poster[1], 'poster não é vertical').toBeGreaterThan(poster[0]);
    const btn = page.locator('.vframe .mdemo-btn');
    await expect(btn).toHaveAttribute('aria-label', 'Retomar demonstração');
    await needsH264(page);
    await btn.click();
    await expect(btn).toHaveAttribute('aria-label', 'Pausar demonstração');
    await playing(page).toBe(true);
  });
});

// Review F-005: o NhanduPage precisa de fato re-renderizar (troca de aba) e a demo seguir no mesmo nó.
test.describe('demo mobile: sobrevive ao re-render', () => {
  test.use({ reducedMotion: 'no-preference' });
  test('390px', async ({ page }) => {
    await openAt(page, '/', 390);
    await expect(page.locator('.vframe .mdemo-video')).toHaveCount(1);
    await page.evaluate(() => {
      window.__mdemo = document.querySelector('.vframe .mdemo-video');
    });
    const tab = page.locator('.ptabs button', { hasText: 'Imobiliária' });
    await expect(tab).toHaveAttribute('aria-pressed', 'false');
    await tab.click();
    await expect(tab, 'aba não mudou: sem re-render').toHaveAttribute('aria-pressed', 'true');
    await frames(page, 3);
    expect(await page.evaluate(() => document.querySelector('.vframe .mdemo-video') === window.__mdemo), 'vídeo remontado ou perdido').toBe(true);
    expect(await page.evaluate(() => window.__mdemo.isConnected)).toBe(true);
    await expect(page.locator('.vframe .mdemo-btn')).toHaveCount(1);
    // O re-render não faz o vídeo 16:9 escondido carregar.
    expect(await page.evaluate(() => document.querySelector('.vframe > video').currentSrc)).toBe('');
  });
});

test.describe('demo mobile: desktop mantém o vídeo 16:9', () => {
  test.use({ reducedMotion: 'no-preference' });
  for (const width of [641, 1280]) {
    test(`${width}px`, async ({ page }) => {
      const mobile = [];
      page.on('request', (r) => /demo-mobile/.test(r.url()) && mobile.push(r.url()));
      await openForScroll(page, width, 900);
      await needsH264(page);
      await centerFrame(page);
      await page.waitForTimeout(800);
      const info = await page.evaluate(() => {
        const f = document.querySelector('.vframe');
        const v = f.querySelector(':scope > video');
        const r = f.getBoundingClientRect();
        const b = f.querySelector('.vbtn');
        return {
          demo: document.querySelectorAll('.mdemo, .mdemo-video, .mdemo-btn, .mdemo-host').length,
          videoShown: v.getBoundingClientRect().width > 0 && getComputedStyle(v).display !== 'none',
          src: new URL(v.currentSrc).pathname,
          ratio: r.width / r.height,
          bg: getComputedStyle(f).backgroundImage,
          btnShown: getComputedStyle(b).display !== 'none',
          label: b.getAttribute('aria-label'),
          paused: v.paused,
        };
      });
      expect(info.demo, 'vídeo vertical montado no desktop').toBe(0);
      expect(mobile, 'desktop baixou arquivo da demo mobile').toEqual([]);
      expect(info.videoShown, 'vídeo sumiu').toBe(true);
      expect(info.src).toBe('/media/demo.mp4');
      expect(Math.abs(info.ratio - 16 / 9)).toBeLessThan(0.01);
      expect(info.bg).toBe('none');
      expect(info.btnShown).toBe(true);
      expect(info.label).toBe('Pausar a demonstração');
      expect(info.paused, 'vídeo 16:9 parado no desktop').toBe(false);
    });
  }
});

test.describe('demo mobile: vídeo e botão coerentes ao cruzar 640 px', () => {
  test.use({ reducedMotion: 'no-preference' });
  test('390px para 1024px e de volta', async ({ page }) => {
    // Aberto no celular, o vídeo 16:9 não carrega (o <source> só vale acima de 640 px): o play() do boot() do
    // NhanduPage falha e ele marca demoPaused = true. Ao passar para desktop o vídeo carrega e toca pelo próprio
    // controle, com o rótulo certo.
    await openAt(page, '/', 390, 844);
    await needsH264(page);
    await page.waitForTimeout(1000);
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect.poll(() => page.evaluate(() => !document.querySelector('.vframe > video').paused), { timeout: 5000 }).toBe(true);
    await expect(page.locator('.vframe .vbtn')).toHaveAttribute('aria-label', 'Pausar a demonstração');
    expect(await page.evaluate(() => new URL(document.querySelector('.vframe > video').currentSrc).pathname)).toBe('/media/demo.mp4');
    await expect(page.locator('.mdemo')).toHaveCount(0);
    // De volta ao celular: o 16:9 para; o vertical volta.
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator('.vframe .mdemo-video')).toHaveCount(1);
    await expect.poll(() => page.evaluate(() => document.querySelector('.vframe > video').paused)).toBe(true);
  });
});

// Com movimento reduzido, cruzar 640 px não põe o vídeo 16:9 para tocar sozinho (como no desktop aberto direto).
test.describe('demo mobile: cruzar 640 px com movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });
  test('390px para 1024px', async ({ page }) => {
    await openAt(page, '/', 390, 844);
    await needsH264(page);
    await page.waitForTimeout(1000);
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.locator('.mdemo')).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => document.querySelector('.vframe > video').readyState), { timeout: 5000 }).toBeGreaterThanOrEqual(2);
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => { const v = document.querySelector('.vframe > video'); return [v.paused, v.currentTime]; })).toEqual([true, 0]);
    const btn = page.locator('.vframe .vbtn');
    await expect(btn).toHaveAttribute('aria-label', 'Reproduzir a demonstração');
    await btn.click();
    await expect(btn).toHaveAttribute('aria-label', 'Pausar a demonstração');
    await expect.poll(() => page.evaluate(() => !document.querySelector('.vframe > video').paused)).toBe(true);
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
