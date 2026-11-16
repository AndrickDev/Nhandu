'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Melhorias só de celular (<= 640 px), montadas ao lado do NhanduPage (gerado, não editar):
// 1. CTA fixo (.mcta) que some quando um CTA equivalente já está na tela;
// 2. vídeo vertical da demo (9:16) no lugar do vídeo 16:9 de 3 painéis. Veja a seção "Demo mobile" do README.

const NARROW = '(max-width:640px)';
const REDUCE = '(prefers-reduced-motion: reduce)';

function useMedia(query) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setOn(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [query]);
  return on;
}

/* ---------- CTA fixo ---------- */

// Alvos cuja presença na tela torna o CTA fixo redundante (ou atrapalha, como a história fixa).
// O hero inteiro conta (F-006): já tem CTA próprio e o fixo cobriria o texto e a agenda do celular.
const CTA_TARGETS = [
  '#topo',
  '.nh main a[href="#form-diag"]',
  '.nh main a[href="#comecar"]',
  '#form-diag',
  '.final',
  '#camadas .sticky',
];
// Fotos que o CTA fixo não deve cobrir.
const PHOTO_TARGETS = '#time .tmc img';

function useFloatingCta(enabled) {
  useEffect(() => {
    const root = document.documentElement;
    if (!enabled || typeof IntersectionObserver === 'undefined') {
      delete root.dataset.mcta;
      return undefined;
    }
    const seen = new Set();
    const sync = () => {
      if (seen.size > 0) root.dataset.mcta = 'off';
      else delete root.dataset.mcta;
    };
    // Só conta o alvo com área na tela: o que apenas encosta na borda não esconde o CTA.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          // A história fixa de #camadas termina colada no topo da seção seguinte: só conta com metade na tela.
          const min = e.target.matches('#camadas .sticky') ? 0.5 : 0;
          if (e.intersectionRatio > 0 && e.intersectionRatio >= min) seen.add(e.target);
          else seen.delete(e.target);
        }
        sync();
      },
      { rootMargin: '-1px 0px', threshold: [0, 0.001, 0.5] },
    );
    for (const el of new Set(CTA_TARGETS.flatMap((s) => [...document.querySelectorAll(s)]))) io.observe(el);
    // Fotos (F-006c): só contam quando passam pela faixa de baixo da tela, onde o CTA fixo fica.
    const band = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) seen.add(e.target);
          else seen.delete(e.target);
        }
        sync();
      },
      { rootMargin: '-85% 0px 0px 0px', threshold: 0 },
    );
    for (const el of document.querySelectorAll(PHOTO_TARGETS)) band.observe(el);
    return () => {
      io.disconnect();
      band.disconnect();
      delete root.dataset.mcta;
    };
  }, [enabled]);
}

/* ---------- Demo mobile ---------- */

// Vídeo vertical (9:16, 15 s) com a mesma história do demo.mp4 de desktop. Gerado por tools/demo-mobile/render.mjs.
const DEMO_SRC = '/media/demo-mobile.mp4';
const DEMO_POSTER = '/media/demo-mobile-poster.jpg';

const PLAY = (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
  </svg>
);
const PAUSE = (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <rect x="3.5" y="2.5" width="3" height="11" fill="currentColor" />
    <rect x="9.5" y="2.5" width="3" height="11" fill="currentColor" />
  </svg>
);

function Demo({ reduced }) {
  // Pausa pedida pela pessoa. Com movimento reduzido já começa pausado, no poster (o estado final da história);
  // a troca da preferência remonta a Demo (key no portal).
  const [paused, setPaused] = useState(reduced);
  const [inView, setInView] = useState(false);
  const root = useRef(null);
  const video = useRef(null);

  // Só toca com a demo na tela.
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const active = !paused && inView;
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (!active) {
      v.pause();
      return;
    }
    // O iOS só deixa tocar sozinho com a propriedade muted ligada (o atributo do React não basta).
    v.muted = true;
    const p = v.play();
    // Autoplay recusado (economia de energia, por exemplo): fica no poster com o botão em "Retomar".
    if (p && p.catch) p.catch((err) => err && err.name === 'NotAllowedError' && setPaused(true));
  }, [active]);

  return (
    <div ref={root} className="mdemo" role="group" aria-label="Demonstração em vídeo: do primeiro oi à agenda">
      <video ref={video} className="mdemo-video" src={DEMO_SRC} poster={DEMO_POSTER} muted loop playsInline preload="metadata" aria-hidden="true" />
      <button type="button" className="mdemo-btn" aria-label={paused ? 'Retomar demonstração' : 'Pausar demonstração'} onClick={() => setPaused((p) => !p)}>
        {paused ? PLAY : PAUSE}
      </button>
    </div>
  );
}

function MobileDemo({ narrow, reduced }) {
  const [host, setHost] = useState(null);
  // Só em dev: o Fast Refresh pode remontar o NhanduPage e trocar o .vframe, deixando o portal num nó solto.
  const [gen, setGen] = useState(0);

  useEffect(() => {
    const frame = document.querySelector('.nh .vframe');
    const video = frame && frame.querySelector(':scope > video');
    if (!narrow || !frame) {
      setHost(null);
      return undefined;
    }
    const el = document.createElement('div');
    el.className = 'mdemo-host';
    frame.appendChild(el);
    setHost(el);

    let mo;
    if (process.env.NODE_ENV !== 'production' && typeof MutationObserver !== 'undefined') {
      mo = new MutationObserver(() => {
        if (!el.isConnected) setGen((g) => g + 1);
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }

    // O vídeo 16:9 do NhanduPage fica oculto no celular e, aberto no celular, nem carrega (o <source> dele só vale
    // acima de 640 px). O boot() do NhanduPage chama play() ~80 ms depois do mount: o `hold` o mantém pausado
    // enquanto for celular (o play() pendente é rejeitado e o NhanduPage deixa o botão dele em "Reproduzir").
    let resume = false;
    const hold = () => video.pause();
    if (video) {
      resume = !video.paused || (video.currentTime === 0 && !window.matchMedia(REDUCE).matches);
      video.pause();
      video.addEventListener('play', hold);
    }
    return () => {
      if (mo) mo.disconnect();
      if (video) {
        video.removeEventListener('play', hold);
        // Passou para desktop sem nunca ter carregado: refaz a escolha do <source>, que agora casa.
        // Sem retomada (movimento reduzido), o autoplay do elemento não pode tocar por conta própria nesse load().
        if (!video.currentSrc) {
          if (!resume) video.autoplay = false;
          video.load();
        }
        // Retoma pelo controle do NhanduPage (toggleDemo dá play() e zera demoPaused), para o botão
        // não ficar em "Reproduzir" com o vídeo tocando. Se já toca, não clica (o clique pausaria).
        if (resume && video.paused) {
          const btn = frame.querySelector('.vbtn');
          if (btn) btn.click();
          else {
            const p = video.play();
            if (p && p.catch) p.catch(() => {});
          }
        }
      }
      el.remove();
      setHost(null);
    };
  }, [narrow, gen]);

  return host ? createPortal(<Demo key={String(reduced)} reduced={reduced} />, host) : null;
}

export default function MobileEnhance() {
  const narrow = useMedia(NARROW);
  const reduced = useMedia(REDUCE);
  useFloatingCta(narrow);
  return <MobileDemo narrow={narrow} reduced={reduced} />;
}
