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

// Texto do hero no celular (L11 do mobile.css): uma margem, uma largura, botão principal na primeira tela.
const heroText = (page) =>
  page.evaluate(() => {
    const box = (el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
    };
    const lines = (el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      // Agrupa por topo com tolerância: a seta do botão fica 0,1px acima do texto no WebKit e não é outra linha.
      const tops = [...range.getClientRects()].map((r) => r.top).sort((x, y) => x - y);
      return tops.filter((t, i) => i === 0 || t - tops[i - 1] > 4).length;
    };
    const hero = document.querySelector('#topo');
    const all = (sel) => [...hero.querySelectorAll(sel)];
    return {
      vw: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      col: box(hero.querySelector('.hero-in > div')),
      // Borda direita do texto do título (não da caixa, que sempre tem a largura da coluna).
      h1Right: Math.max(...all('.h1 span').flatMap((s) => { const range = document.createRange(); range.selectNodeContents(s); return [...range.getClientRects()].map((r) => r.right); })),
      h1Lines: all('.h1 span').reduce((n, s) => n + lines(s), 0),
      // Largura do texto da linha em itálico (a mais longa no celular) e alturas/medidas dos blocos vizinhos.
      italicWidth: (() => { const range = document.createRange(); range.selectNodeContents(all('.h1 span')[1]); const rs = [...range.getClientRects()]; return Math.max(...rs.map((r) => r.right)) - Math.min(...rs.map((r) => r.left)); })(),
      pill: box(hero.querySelector('.pill')),
      pillLines: (() => { const range = document.createRange(); range.selectNodeContents(hero.querySelector('.pill').lastChild); const tops = [...new Set([...range.getClientRects()].map((r) => Math.round(r.top)))]; const words = hero.querySelector('.pill').lastChild.textContent.trim().split(/\s+/); const last = document.createRange(); const node = hero.querySelector('.pill').lastChild; last.setStart(node, node.textContent.lastIndexOf(words.at(-2))); last.setEnd(node, node.textContent.length); return { count: tops.length, lastTwoWordsTogether: new Set([...last.getClientRects()].map((r) => Math.round(r.top))).size === 1 }; })(),
      p: box(hero.querySelector('.hero-p')),
      offer: box(hero.querySelector('.offer')),
      items: all('.offer span').map((s) => ({ ...box(s), lines: lines(s), over: s.scrollWidth - s.clientWidth, bg: getComputedStyle(s).backgroundColor, radius: getComputedStyle(s).borderTopLeftRadius })),
      row: box(hero.querySelector('.cta-row')),
      btns: all('.cta-row .btn').map((b) => ({ ...box(b), lines: lines(b) })),
      proofs: all('.proof span').map(box),
      fmini: box(hero.querySelector('.fmini')),
    };
  });

test.describe('hero: texto alinhado, itens e botões organizados', () => {
  for (const width of [320, 344, 360, 375, 390, 412, 430, 480, 500, 560, 600, 640]) {
    test(`${width}px`, async ({ page }) => {
      await openAt(page, '/', width);
      const h = await heroText(page);
      expect(h.scrollWidth, 'rolagem horizontal').toBeLessThanOrEqual(h.vw);
      expect(h.h1Right, 'texto do título passa da coluna').toBeLessThanOrEqual(h.col.right + 0.5);
      // A linha em itálico cabe em 1 linha em toda largura (3 linhas no total), com folga para diferença de fonte entre navegadores.
      expect(h.h1Lines, 'título com mais de 3 linhas').toBeLessThanOrEqual(3);
      expect(h.italicWidth, 'linha em itálico sem folga na coluna').toBeLessThanOrEqual(h.col.width - 4);

      // Selo "PARA QUEM": alvo de toque >= 44px e a última palavra nunca sozinha na linha.
      expect(h.pill.height, 'selo menor que 44px').toBeGreaterThanOrEqual(44);
      if (h.pillLines.count > 1) expect(h.pillLines.lastTwoWordsTogether, 'última palavra do selo sozinha na linha').toBe(true);

      // Itens "o que a Nhandu instala": 1 linha de 3, mesma altura, sem cara de botão e sem transbordar.
      expect(h.items).toHaveLength(3);
      expect(new Set(h.items.map((i) => Math.round(i.top))).size, 'itens em mais de uma linha').toBe(1);
      expect(new Set(h.items.map((i) => Math.round(i.height))).size, 'itens com alturas diferentes').toBe(1);
      expect(Math.abs(h.items[0].left - h.col.left), 'primeiro item fora da margem do texto').toBeLessThanOrEqual(0.5);
      for (const i of h.items) {
        expect(i.right, 'item passa da faixa').toBeLessThanOrEqual(h.offer.right + 0.5);
        expect(i.over, 'texto do item transborda').toBeLessThanOrEqual(0);
        expect(i.lines, 'rótulo do item em 3 linhas').toBeLessThanOrEqual(3); // ícone + até 2 linhas de texto
        expect(i.bg, 'item com fundo de botão').toBe('rgba(0, 0, 0, 0)');
        expect(i.radius, 'item em forma de pílula').toBe('0px');
      }
      expect(new Set(h.items.map((i) => i.lines)).size, 'rótulos dos itens com número de linhas diferente').toBe(1);

      // Botões: mesma largura, mesma margem, alvo >= 44px (HIG), texto em 1 linha, principal primeiro.
      // Empilhados enquanto os dois não cabem lado a lado (coluna < 534px, tela < 574px); a partir daí, lado a lado.
      expect(h.btns).toHaveLength(2);
      const [primary, secondary] = h.btns;
      const sideBySide = width >= 574;
      expect(Math.abs(primary.width - secondary.width), 'botões com larguras diferentes').toBeLessThanOrEqual(0.5);
      expect(Math.abs(primary.left - h.col.left), 'botões fora da margem do texto').toBeLessThanOrEqual(0.5);
      if (sideBySide) {
        expect(Math.round(primary.top), 'botões empilhados com espaço para ficar lado a lado').toBe(Math.round(secondary.top));
        expect(secondary.left - primary.right, 'botões colados').toBeGreaterThanOrEqual(8);
      } else {
        expect(primary.bottom, 'botões lado a lado sem caber').toBeLessThanOrEqual(secondary.top);
        expect(Math.abs(primary.left - secondary.left), 'botões desalinhados').toBeLessThanOrEqual(0.5);
        expect(secondary.top - primary.bottom, 'botões colados').toBeGreaterThanOrEqual(8);
      }
      for (const b of h.btns) {
        expect(b.height, 'alvo menor que 44px').toBeGreaterThanOrEqual(44);
        expect(b.lines, 'texto do botão quebra').toBe(1);
      }
      // Uma só medida: faixa de itens e linha de botões com a mesma largura, a coluna toda até 540px (a medida do parágrafo).
      expect(Math.abs(secondary.right - h.offer.right), 'botões e faixa de itens com bordas direitas diferentes').toBeLessThanOrEqual(0.5);
      expect(Math.abs(h.row.width - Math.min(h.col.width, 540)), 'botões fora da medida do texto').toBeLessThanOrEqual(0.5);
      expect(Math.abs(h.p.right - h.offer.right), 'parágrafo e faixa de itens com bordas direitas diferentes').toBeLessThanOrEqual(0.5);

      // Provas em lista, uma por linha, na mesma margem; link dos sócios com alvo de 44px.
      expect(new Set(h.proofs.map((p) => Math.round(p.left))).size, 'provas desalinhadas').toBe(1);
      expect(new Set(h.proofs.map((p) => Math.round(p.top))).size, 'provas na mesma linha').toBe(3);
      expect(h.fmini.height, 'link dos sócios menor que 44px').toBeGreaterThanOrEqual(44);
    });
  }

  // iPhone 12 a 16 no Safari com as barras: 390x664 visíveis. Os dois botões cabem sem rolar.
  test('390x664: botões na primeira tela', async ({ page }) => {
    await openAt(page, '/', 390, 664);
    const h = await heroText(page);
    expect(h.btns[0].bottom, 'botão principal abaixo da primeira tela').toBeLessThanOrEqual(664 - 16);
    expect(h.btns[1].bottom, 'botão secundário cortado na primeira tela').toBeLessThanOrEqual(664);
  });

  // Telas baixas: o CTA fixo fica escondido no hero, então o botão principal precisa caber inteiro na primeira tela.
  // 375x553 = iPhone SE no Safari com as barras; 320x568 = iPhone SE antigo; 360x640 = Android compacto (cabem os dois botões).
  for (const [width, height, both] of [[375, 553, false], [320, 568, false], [360, 640, true]]) {
    test(`${width}x${height}: botão principal na primeira tela`, async ({ page }) => {
      await openAt(page, '/', width, height);
      const h = await heroText(page);
      expect(h.btns[0].bottom, 'botão principal cortado na primeira tela').toBeLessThanOrEqual(height - 8);
      if (both) expect(h.btns[1].bottom, 'botão secundário cortado na primeira tela').toBeLessThanOrEqual(height);
      // Os respiros encolhem, mas não somem: nenhum bloco cola no vizinho.
      expect(h.offer.top - h.p.bottom, 'faixa colada no parágrafo').toBeGreaterThanOrEqual(10);
      expect(h.row.top - h.offer.bottom, 'botões colados na faixa').toBeGreaterThanOrEqual(10);
    });
  }

  // Celular da demonstração: em cada aba a conversa cabe inteira (a 1ª mensagem não fica cortada sob o cabeçalho do chat).
  for (const width of [320, 390, 640]) {
    test(`${width}px: conversa inteira em cada aba`, async ({ page }) => {
      await openAt(page, '/', width);
      for (const label of ['Clínica', 'Imobiliária', 'Loja virtual', 'Serviços']) {
        await page.locator('.ptabs button', { hasText: label }).click();
        await expect(page.locator('.ptabs button.on')).toHaveText(label);
        const info = await page.evaluate(() => {
          const chat = document.querySelector('#topo .panel .chat');
          const first = chat.querySelector('.b').getBoundingClientRect();
          const phone = document.querySelector('#topo .panel .phone').getBoundingClientRect();
          return { firstTop: first.top - chat.getBoundingClientRect().top, phoneLeft: phone.left, phoneRight: phone.right, vw: document.documentElement.clientWidth };
        });
        expect(info.firstTop, `aba ${label}: 1ª mensagem cortada no topo da conversa`).toBeGreaterThanOrEqual(0);
        expect(info.phoneLeft, 'celular passa da margem').toBeGreaterThanOrEqual(20 - 0.5);
        expect(info.phoneRight, 'celular passa da margem').toBeLessThanOrEqual(info.vw - 20 + 0.5);
      }
    });
  }

  // Guarda do desktop: em 641px nada disso vale (botões lado a lado, com a largura do texto).
  test('641px: layout de desktop intacto', async ({ page }) => {
    await openAt(page, '/', 641);
    const h = await heroText(page);
    expect(Math.round(h.btns[0].top), 'botões empilhados fora do celular').toBe(Math.round(h.btns[1].top));
    expect(h.btns[0].width, 'botão de largura total fora do celular').toBeLessThan(300);
    expect(h.btns[0].height).toBe(46);
    expect(h.items[0].radius, 'itens sem a pílula fora do celular').not.toBe('0px');
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

// Passo a passo de #camadas no celular (M4 do mobile.css): cada um dos 5 passos cabe inteiro no painel fixo.
// Largura x altura visível: SE 1ª geração, Galaxy S, SE com e sem barras do Safari, iPhone 14/15 com barras e com a barra recolhida,
// iPhone Pro, Pixel/Galaxy grande, Pro Max e tablet em pé.
const CAMADAS_SIZES = [[320, 568], [360, 640], [375, 553], [375, 667], [390, 664], [390, 745], [393, 852], [412, 915], [430, 932], [768, 1024]];
// Folga mínima entre o fim do cartão e o fim do painel.
const CAMADAS_MARGIN = 12;

// Rola até o passo i (0 a 4; NH_STEP = 640 no NhanduPage) e mede o passo visível.
async function camadasStep(page, i, waitMs = 0) {
  await page.evaluate((i) => {
    const t = document.querySelector('.track').getBoundingClientRect();
    window.scrollTo({ top: t.top + window.scrollY - 68 + i * 640 + 40, behavior: 'instant' });
  }, i);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  if (waitMs) await page.waitForTimeout(waitMs);
  return page.evaluate(() => {
    const box = (el) => el.getBoundingClientRect();
    const steps = [...document.querySelectorAll('.steps > .st')];
    const on = document.querySelector('.steps > .st.on .st-full');
    const lv = on.querySelector('.lv');
    const lvR = box(lv);
    const clipped = [];
    let minFont = Infinity;
    let minFontEl = '';
    for (const el of on.querySelectorAll('*')) {
      if (!el.checkVisibility({ checkVisibilityCSS: true })) continue;
      const r = box(el);
      // .scan é a faixa de varredura animada do Raio-x: sai do cartão de propósito.
      if (lv.contains(el) && el !== lv && !el.matches('.scan') && r.width && r.height) {
        const out = Math.max(lvR.top - r.top, r.bottom - lvR.bottom, lvR.left - r.left, r.right - lvR.right);
        if (out > 0.5) clipped.push(`${el.className || el.tagName} ${Math.round(out)}px`);
      }
      // As miniaturas da página (.lv1 .wf/.fin) têm pinos e rótulos ancorados em px (AC-6): ficam fora da conta de 11 px.
      if (el.closest('.lv1 .fin, .lv1 .wf')) continue;
      if ([...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) {
        const f = parseFloat(getComputedStyle(el).fontSize);
        if (f < minFont) [minFont, minFontEl] = [f, el.className || el.tagName];
      }
    }
    const seal = on.querySelector('.seal');
    const intents = [...on.querySelectorAll('.intent')];
    const tested = on.querySelector('.tested');
    return {
      step: steps.findIndex((s) => s.classList.contains('on')),
      vh: window.innerHeight,
      hdr: box(document.querySelector('.hdr')).bottom,
      mprog: box(document.querySelector('.mprog')).bottom,
      num: box(on.querySelector('.st-num')).top,
      sticky: box(document.querySelector('.sticky')).bottom,
      stickyL: box(document.querySelector('.sticky-l')).bottom,
      lv: lvR.bottom,
      clipped,
      minFont,
      minFontEl,
      seal: seal && box(seal),
      lastIntent: intents.length ? box(intents.at(-1)).bottom : null,
      testedText:
        tested && tested.checkVisibility() ? box(tested).right - parseFloat(getComputedStyle(tested).paddingRight) : null,
    };
  });
}

function expectStepFits(m, i, panelBottom) {
  expect(m.step, 'passo errado na rolagem').toBe(i);
  expect(m.num, 'conteúdo sob o cabeçalho ou a barra de passos').toBeGreaterThanOrEqual(Math.max(m.hdr, m.mprog));
  expect(m.lv, `cartão do passo ${i + 1} passa do painel (folga < ${CAMADAS_MARGIN}px)`).toBeLessThanOrEqual(panelBottom - CAMADAS_MARGIN);
  expect(m.clipped, `conteúdo cortado dentro do cartão do passo ${i + 1}`).toEqual([]);
  expect(m.minFont, `texto menor que 11px (${m.minFontEl})`).toBeGreaterThanOrEqual(11);
}

test.describe('camadas: cada passo cabe no painel', () => {
  for (const [width, height] of CAMADAS_SIZES) {
    test(`${width}x${height}`, async ({ page }) => {
      await openForScroll(page, width, height);
      for (let i = 0; i < 5; i++) {
        const m = await camadasStep(page, i);
        expectStepFits(m, i, Math.min(m.sticky, m.stickyL));
        // O painel vai até o fim da tela visível (dvh): sem faixa morta abaixo dele.
        expect(Math.abs(m.sticky - m.vh), 'painel não acompanha a altura da tela').toBeLessThanOrEqual(1);
      }
    });
  }

  // Barra do Safari recolhida no iPhone 14/15: tela visível 745 (dvh/lvh), menor tela 664 (svh). Sem como emular as unidades,
  // o conteúdo recebe a altura svh (664 − 68 = 596) e a tela fica com 745: o conteúdo cabe nos 596 e o painel vai até 745.
  test('390x745 com a barra recolhida (svh 664)', async ({ page }) => {
    await openForScroll(page, 390, 745);
    await page.addStyleTag({ content: '.sticky-l{height:596px !important}' });
    for (let i = 0; i < 5; i++) {
      const m = await camadasStep(page, i);
      expectStepFits(m, i, 68 + 596);
      expect(Math.abs(m.sticky - 745), 'painel não vai até o fim da tela').toBeLessThanOrEqual(1);
    }
  });

  // iPhone SE (svh 553) com a janela das media queries do tamanho da tela grande (667): os níveis de altura do page.css
  // (649/799) não valem, mas o conteúdo segue o contêiner de 485 px e cabe com as barras abertas (painel também em 485).
  test('375x667 com media query da tela grande e painel svh 553', async ({ page }) => {
    await openForScroll(page, 375, 667);
    await page.addStyleTag({ content: '.sticky,.sticky-l{height:485px !important}' });
    for (let i = 0; i < 5; i++) {
      const m = await camadasStep(page, i);
      expectStepFits(m, i, 68 + 485);
    }
  });

  // As unidades são a correção: .track em lvh (comprimento fixo), .sticky em dvh (tela visível), .sticky-l em svh (menor tela).
  // A emulação tem svh = dvh = lvh, então a medida não distingue; confere-se a regra que vale no celular.
  test('unidades do painel no celular', async ({ page }) => {
    await openAt(page, '/', 390, 664);
    const heights = await page.evaluate(() => {
      const out = {};
      const walk = (rules) => {
        for (const r of rules) {
          if (r.cssRules && (!r.media || matchMedia(r.media.mediaText).matches)) walk(r.cssRules);
          if (r.selectorText && ['.track', '.sticky', '.sticky-l'].includes(r.selectorText) && r.style.height) out[r.selectorText] = r.style.height;
        }
      };
      for (const s of document.styleSheets) walk(s.cssRules);
      return out;
    });
    expect(heights['.track']).toContain('100lvh');
    expect(heights['.sticky']).toContain('100dvh');
    expect(heights['.sticky-l']).toContain('100svh');
  });

  // Paisagem 667x375: painel de 332 px não comporta os cartões (limite registrado); só não pode piorar.
  test('667x375 paisagem não piora', async ({ page }) => {
    const before = [1, 96, 125, -18, 216]; // lv.bottom − sticky.bottom antes do M4
    await openForScroll(page, 667, 375);
    for (let i = 0; i < 5; i++) {
      const m = await camadasStep(page, i);
      expect(m.step).toBe(i);
      expect(m.lv - m.sticky, `passo ${i + 1} passa mais do painel que antes`).toBeLessThanOrEqual(before[i] + 1);
    }
  });
});

test.describe('camadas: selo do roteiro inteiro com a animação', () => {
  test.use({ reducedMotion: 'no-preference' });
  for (const [width, height] of [[320, 568], [390, 664], [430, 932]]) {
    test(`${width}x${height}`, async ({ page }) => {
      await openForScroll(page, width, height);
      // O selo gira −12° e termina de entrar em 1,5 s.
      const m = await camadasStep(page, 2, 1800);
      expect(m.step).toBe(2);
      expect(m.clipped, 'selo ou linha do roteiro cortados').toEqual([]);
      expect(m.lv, 'cartão passa do painel').toBeLessThanOrEqual(m.sticky - CAMADAS_MARGIN);
      expect(m.seal.top, 'selo sobre a última intenção').toBeGreaterThanOrEqual(m.lastIntent - 2);
      if (m.testedText !== null) expect(m.seal.left, 'selo sobre a nota "Testado em…"').toBeGreaterThanOrEqual(m.testedText);
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
