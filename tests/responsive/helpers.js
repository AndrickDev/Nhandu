// Larguras, páginas e a auditoria de layout usadas por toda a suíte.

export const PAGES = [
  { name: 'home', path: '/' },
  { name: 'privacidade', path: '/privacidade' },
  { name: 'termos', path: '/termos' },
  { name: 'demo-nutricao', path: '/demo/nutricao' },
  { name: 'briefing-nutricao', path: '/briefing/nutricao' },
];

// Larguras de tela (CSS px) dos aparelhos em uso: iPhone SE antigo, Galaxy Fold fechado,
// Galaxy S, iPhones 12 a 17 (normal, Pro e Max), Pixel, e tablets em pé e deitados.
const DEVICE_WIDTHS = [320, 344, 360, 375, 390, 393, 402, 412, 430, 440, 480, 600, 744, 768, 820, 1024];

// Um pixel antes e um depois de cada breakpoint de largura do app/page.css.
const BREAKPOINT_EDGES = [640, 641, 899, 900, 960, 961];

// SWEEP=1 troca a lista de aparelhos por uma varredura contínua de 320 a 480 px.
const SWEEP = Array.from({ length: 81 }, (_, i) => 320 + i * 2);

export const WIDTHS = [...new Set([...(process.env.SWEEP ? SWEEP : DEVICE_WIDTHS), ...BREAKPOINT_EDGES])].sort(
  (a, b) => a - b,
);

// Larguras em que os estados interativos e as imagens de referência são conferidos.
export const KEY_WIDTHS = [320, 360, 390, 430, 768];

export const heightFor = (width) => (width < 600 ? 780 : 1024);

// Elementos decorativos que saem da tela de propósito (a faixa de segmentos em movimento).
const IGNORE = ['.mq', '[aria-hidden="true"]'];

// Abre a página já no tamanho pedido e espera fontes e conteúdo revelado na rolagem.
export async function openAt(page, path, width, height = heightFor(width)) {
  await page.setViewportSize({ width, height });
  await page.goto(path, { waitUntil: 'load' });
  // No celular, a demo do vídeo só existe depois da hidratação: medir ou capturar antes dela pega o quadro vazio.
  await page.waitForFunction(
    () => !document.querySelector('.vframe') || !matchMedia('(max-width:640px)').matches || document.querySelector('.vframe .mdemo'),
    null,
    { timeout: 15000 },
  );
  await settle(page);
}

export async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const step = window.innerHeight;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => requestAnimationFrame(r));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

// Mede o layout dentro da página e devolve a lista de problemas encontrados.
export async function audit(page) {
  return page.evaluate((ignore) => {
    const vw = document.documentElement.clientWidth;
    const problems = [];
    const seen = new Set();

    const describe = (el) => {
      const cls = typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).join('.') : '';
      const text = (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
      return `<${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${cls}>${text ? ` "${text}"` : ''}`;
    };
    const report = (rule, el, detail) => {
      const key = `${rule}|${describe(el)}|${detail}`;
      if (seen.has(key)) return;
      seen.add(key);
      problems.push(`${rule}: ${describe(el)} ${detail}`);
    };

    const ignored = (el) => ignore.some((sel) => el.closest(sel));
    const visible = (el) => {
      if (el.checkVisibility && !el.checkVisibility({ checkVisibilityCSS: true })) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    };
    // Dentro de uma área com rolagem horizontal própria, passar da borda é esperado.
    const inScroller = (el) => {
      for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) {
        const o = getComputedStyle(p).overflowX;
        if ((o === 'auto' || o === 'scroll') && p.scrollWidth > p.clientWidth) return true;
      }
      return false;
    };

    // 1. A página não pode rolar para os lados.
    const sw = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    if (sw > vw) problems.push(`rolagem-horizontal: página com ${sw}px em tela de ${vw}px`);

    // 2. Nenhum conteúdo pode passar da borda da tela, mesmo que um contêiner o esconda.
    const content = 'a,button,input,select,textarea,summary,label,h1,h2,h3,h4,h5,h6,p,li,img,video,table';
    for (const el of document.querySelectorAll(content)) {
      if (ignored(el) || !visible(el) || inScroller(el)) continue;
      const r = el.getBoundingClientRect();
      // Só conta o que aparece em parte: o que está inteiro fora da tela foi escondido de propósito
      // (link "pular para o conteúdo") ou já é pego pela regra de rolagem horizontal.
      const partlyOnScreen = r.left < vw && r.right > 0;
      if (partlyOnScreen && (r.right > vw + 1 || r.left < -1)) {
        report('fora-da-tela', el, `ocupa de ${Math.round(r.left)} a ${Math.round(r.right)}px em tela de ${vw}px`);
      }
    }

    // 3. Texto de botões, links e títulos não pode ser cortado pela própria caixa.
    for (const el of document.querySelectorAll('a,button,summary,label,h1,h2,h3,h4,h5,h6')) {
      if (ignored(el) || !visible(el)) continue;
      const o = getComputedStyle(el).overflowX;
      if (o !== 'visible' && el.scrollWidth > el.clientWidth + 1) {
        report('texto-cortado', el, `precisa de ${el.scrollWidth}px e tem ${el.clientWidth}px`);
      }
    }

    // 4. Alvos de toque: mínimo de 24px, ou folga de 24px até o alvo vizinho (WCAG 2.2, critério 2.5.8).
    const MIN = 24;
    const inlineInText = (el) => {
      if (getComputedStyle(el).display !== 'inline') return false;
      const parent = el.parentElement;
      return !!parent && parent.textContent.trim().length > el.textContent.trim().length;
    };
    const targets = [...document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button]')]
      .filter((el) => !ignored(el) && visible(el))
      .map((el) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        // Área de toque efetiva: a caixa do elemento, nunca menor que 24x24 em volta do centro.
        const box = {
          left: Math.min(r.left, cx - MIN / 2),
          right: Math.max(r.right, cx + MIN / 2),
          top: Math.min(r.top, cy - MIN / 2),
          bottom: Math.max(r.bottom, cy + MIN / 2),
        };
        return { el, r, box };
      });
    for (const t of targets) {
      if (t.r.width >= MIN && t.r.height >= MIN) continue;
      if (inlineInText(t.el)) continue;
      const crowded = targets.some(
        (o) =>
          o !== t &&
          !t.el.contains(o.el) &&
          !o.el.contains(t.el) &&
          t.box.left < o.box.right &&
          t.box.right > o.box.left &&
          t.box.top < o.box.bottom &&
          t.box.bottom > o.box.top,
      );
      if (crowded) report('alvo-de-toque', t.el, `tem ${Math.round(t.r.width)}x${Math.round(t.r.height)}px e encosta em outro alvo`);
    }

    // 5. Texto legível: nada abaixo de 10px. As ilustrações de tela (agenda, conversa) usam
    //    de 10,5 a 11,5px de propósito; suba MIN_FONT para 12 se quiser cobrar isso também.
    const MIN_FONT = 10;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.nodeValue.trim()) continue;
      const el = node.parentElement;
      if (!el || ignored(el) || !visible(el)) continue;
      const size = parseFloat(getComputedStyle(el).fontSize);
      if (size < MIN_FONT) report('fonte-pequena', el, `está com ${size}px`);
    }

    // 6. Campos com fonte abaixo de 16px fazem o Safari do iPhone dar zoom ao focar.
    for (const el of document.querySelectorAll('input:not([type=hidden]):not([type=range]):not([type=checkbox]):not([type=radio]),select,textarea')) {
      if (!visible(el)) continue;
      const size = parseFloat(getComputedStyle(el).fontSize);
      if (size < 16) report('campo-com-zoom-no-iphone', el, `está com ${size}px`);
    }

    // 7. Texto de botões e links não pode passar da própria caixa (o CTA que estoura o botão).
    //    Texto dentro de um ancestral girado ou inclinado (o "+" do FAQ) fica de fora: a medida seria do glifo girado.
    for (const el of document.querySelectorAll('a,button,summary')) {
      if (ignored(el) || !visible(el) || getComputedStyle(el).display === 'inline') continue;
      const box = el.getBoundingClientRect();
      const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let node = tw.nextNode(); node; node = tw.nextNode()) {
        if (!node.nodeValue.trim()) continue;
        let rotated = false;
        for (let p = node.parentElement; p && p !== el; p = p.parentElement) {
          const tf = getComputedStyle(p).transform;
          if (tf !== 'none') {
            const m = new DOMMatrix(tf);
            if (m.b !== 0 || m.c !== 0) rotated = true;
          }
        }
        if (rotated) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const t = range.getBoundingClientRect();
        if (t.width > 0 && (t.right > box.right + 1 || t.left < box.left - 1)) {
          report(
            'texto-transborda',
            el,
            `texto vai de ${Math.round(t.left)} a ${Math.round(t.right)}px e a caixa de ${Math.round(box.left)} a ${Math.round(box.right)}px`,
          );
          break;
        }
      }
    }

    return problems;
  }, IGNORE);
}

export const format = (problems) => `\n${problems.length} problema(s) de layout:\n  ${problems.join('\n  ')}\n`;
