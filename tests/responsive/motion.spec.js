import { test, expect } from '@playwright/test';
import { heightFor, openAt } from './helpers';

// Mensagem de falha dos testes de movimento (o format() de helpers.js fala em "layout").
function formatMotion(problems) {
  return problems.length ? `\n${problems.length} problema(s) de movimento:\n  ${problems.join('\n  ')}\n` : '';
}

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
          const cls = '.' + (el.getAttribute('class') || '').trim().split(/\s+/).join('.');
          if (cs.clipPath !== 'none') out.push(`${cls} com clip-path ${cs.clipPath} em scrollY ${scrollY}`);
          if (parseFloat(cs.opacity) < 0.99) out.push(`${cls} com opacidade ${cs.opacity} em scrollY ${scrollY}`);
          if (cs.transform !== 'none') {
            const m = new DOMMatrix(cs.transform);
            if (m.a < 0.99 || m.d < 0.99) out.push(`${cls} com escala ${m.a}x${m.d} em scrollY ${scrollY}`);
          }
          if (cs.scale !== 'none' && cs.scale.split(/\s+/).some((v) => parseFloat(v) < 0.99)) {
            out.push(`${cls} com escala (propriedade scale) ${cs.scale} em scrollY ${scrollY}`);
          }
        }
        return out;
      });
      expect(problems, formatMotion(problems)).toEqual([]);
    });
  }
});

test.describe('movimento: entradas não saem da tela', () => {
  test.use({ reducedMotion: 'no-preference' });
  for (const width of MOBILE_WIDTHS) {
    test(`${width}px`, async ({ page }) => {
      test.setTimeout(120_000);
      await openForScroll(page, '/', width);
      const problems = await scrollThrough(page, (scrollY) => {
        const out = [];
        const vw = document.documentElement.clientWidth;
        const scrollsX = (el) => {
          for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
            const ox = getComputedStyle(a).overflowX;
            if ((ox === 'auto' || ox === 'scroll') && a.scrollWidth > a.clientWidth) return true;
          }
          return false;
        };
        for (const el of document.querySelectorAll('.nh main h1,.nh main h2,.nh main h3,.nh main h4,.nh main p,.nh main li,.nh main a,.nh main button')) {
          if (!el.checkVisibility({ checkVisibilityCSS: true })) continue;
          const r = el.getBoundingClientRect();
          if (r.width <= 0 || r.height <= 0) continue;
          if (r.bottom <= 0 || r.top >= window.innerHeight) continue;
          if (el.closest('.mq,[aria-hidden="true"]') || scrollsX(el)) continue;
          if (r.left < -1 || r.right > vw + 1) {
            const cls = '.' + (el.getAttribute('class') || '').trim().split(/\s+/).join('.');
            const sec = el.closest('section');
            const secCls = sec ? (sec.getAttribute('class') || '').trim().split(/\s+/).join('.') : '?';
            out.push(`${el.tagName.toLowerCase()}${cls} (em section.${secCls}) x ${Math.round(r.left)}..${Math.round(r.right)} (vw ${vw}) em scrollY ${scrollY}`);
          }
        }
        return out;
      });
      expect(problems, formatMotion(problems)).toEqual([]);
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
      const supported = await page.evaluate(() => CSS.supports('animation-timeline: view()'));
      test.skip(!supported, 'navegador sem animation-timeline');
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
            const sel = t ? t.tagName.toLowerCase() + '.' + (t.getAttribute('class') || '').trim().split(/\s+/).join('.') : '?';
            found.push(`${a.animationName} em ${sel} anima ${bad.join(', ')}`);
          }
          return found;
        },
        { allowed: ALLOWED, svgOnly: SVG_ONLY, skip: SKIP },
      );
      expect(forbidden, `\npropriedades proibidas em animações de rolagem:\n  ${forbidden.join('\n  ')}\n`).toEqual([]);

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

// A rolagem dentro de .track é o que troca o passo (640 px por passo, NH_STEP no NhanduPage.jsx).
// Falha também quando o JS da página não roda (servidor antigo servindo um build trocado): o passo fica no 01.
test.describe('movimento: passo a passo avança com a rolagem', () => {
  for (const [width, height, motion] of [[320, 568, 'reduce'], [390, 844, 'no-preference'], [390, 664, 'reduce'], [768, 1024, 'reduce'], [1024, 1024, 'no-preference']]) {
    test(`${width}x${height}px (${motion})`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: motion });
      await openAt(page, '/', width, height);
      const read = () =>
        page.evaluate(() => {
          const sticky = document.querySelector('.track .sticky');
          const steps = [...document.querySelectorAll('.track .steps > .st')];
          const on = steps.filter((s) => s.classList.contains('on'));
          const bar = [...document.querySelectorAll('.track .mprog i')].map((i) => (i.classList.contains('on') ? '1' : '0')).join('');
          return {
            position: getComputedStyle(sticky).position,
            top: Math.round(sticky.getBoundingClientRect().top),
            active: on.map((s) => steps.indexOf(s)),
            title: on[0]?.querySelector('.st-full h3')?.textContent.trim() ?? null,
            bar,
          };
        });
      const titles = [];
      // Ida e volta: o passo acompanha a rolagem nos dois sentidos. 120 px dentro de cada passo (o 5º só dura 240 px).
      for (const i of [0, 1, 2, 3, 4, 2, 0]) {
        await page.evaluate((i) => {
          document.documentElement.style.scrollBehavior = 'auto';
          const track = document.querySelector('.track');
          window.scrollTo({ top: window.scrollY + track.getBoundingClientRect().top - 68 + i * 640 + 120, behavior: 'instant' });
        }, i);
        await expect.poll(async () => (await read()).active, { message: `${width}px: passo ativo 120 px dentro do passo ${i + 1}` }).toEqual([i]);
        const now = await read();
        expect(now.position, `${width}px: .sticky deixou de ser sticky`).toBe('sticky');
        expect(now.top, `${width}px: .sticky não está preso sob o cabeçalho no passo ${i + 1}`).toBe(68);
        expect(now.bar, `${width}px: barra 01..05 fora de sincronia no passo ${i + 1}`).toBe('00000'.slice(0, i) + '1' + '00000'.slice(i + 1));
        expect(now.title, `${width}px: passo ${i + 1} sem título`).toBeTruthy();
        titles.push(now.title);
      }
      expect(new Set(titles).size, `${width}px: os 5 passos deveriam mostrar 5 títulos diferentes`).toBe(5);
    });
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
          .map((a) => `${a.animationName || a.transitionProperty || '?'} em ${a.effect.target.tagName.toLowerCase()}.${(a.effect.target.getAttribute('class') || '').trim().split(/\s+/).join('.')}`),
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
  await openForScroll(page, '/', 375, 780);
  // Parte do topo de #pratica: longe de outros CTAs, para o teste não depender de onde a página para.
  await page.evaluate(async () => {
    document.querySelector('#pratica').scrollIntoView({ block: 'start' });
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  const cta = page.locator('.mcta');
  await expect(cta).toBeVisible();
  const state = () => cta.evaluate((el) => ({ opacity: parseFloat(getComputedStyle(el).opacity), pe: getComputedStyle(el).pointerEvents }));
  const visible = await state();
  expect(visible.opacity).toBeGreaterThan(0.95);
  expect(visible.pe).not.toBe('none');
  await page.evaluate(() => document.querySelector('#f-nome').focus({ preventScroll: true }));
  await expect(cta).toBeHidden();
  // Campo fora do formulário de diagnóstico (calculadora) não esconde o CTA.
  await page.evaluate(() => document.querySelector('#c-ticket').focus({ preventScroll: true }));
  await expect(cta).toBeVisible();
});
