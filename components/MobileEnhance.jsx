'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// Melhorias só de celular (<= 640 px), montadas ao lado do NhanduPage (gerado, não editar):
// 1. CTA fixo (.mcta) que some quando um CTA equivalente já está na tela;
// 2. demo vertical (DOM/CSS) no lugar do vídeo 16:9 de 3 painéis.
// Para trocar a demo por um vídeo vertical, veja a seção "Demo mobile" do README.

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
const CTA_TARGETS = [
  '#topo .cta-row',
  '.nh main a[href="#form-diag"]',
  '.nh main a[href="#comecar"]',
  '#form-diag',
  '.final',
  '#camadas .sticky',
];

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
    return () => {
      io.disconnect();
      delete root.dataset.mcta;
    };
  }, [enabled]);
}

/* ---------- Demo mobile ---------- */

// [instante em ms, passo]. Laço de 15 s: do passo 9 (esmaece) ao 0 (zerado), recomeça.
const EVENTS = [
  [500, 1], [2000, 2], [3500, 3], [5000, 4], [6500, 5], [7500, 6], [8500, 7], [9500, 8], [14000, 9], [14600, 0],
];
const LAST = 8;
const LOOP_MS = 15000;

const gapBefore = (i, started) => (i === 0 ? (started ? LOOP_MS - EVENTS[EVENTS.length - 1][0] + EVENTS[0][0] : EVENTS[0][0]) : EVENTS[i][0] - EVENTS[i - 1][0]);

const BUBBLES = [
  { at: 1, out: false, t: 'Oi! Vocês fazem clareamento?' },
  { at: 2, out: true, t: 'Fazemos, sim. Você prefere manhã ou tarde?' },
  { at: 3, out: false, t: 'Tarde, depois das 17h' },
  { at: 4, out: true, t: 'Tenho quinta, 17h30, com a Dra. Helena. Posso reservar?' },
  { at: 5, out: false, t: 'Pode!' },
  { at: 6, out: true, t: 'Reservado. Um lembrete chega na véspera.' },
];

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

const cx = (...c) => c.filter(Boolean).join(' ');

function Demo({ reduced }) {
  const [step, setStep] = useState(reduced ? LAST : 0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const root = useRef(null);
  const body = useRef(null);
  const track = useRef(null);
  const idx = useRef(0);
  const started = useRef(false);

  // Reduced-motion: passo final fixo, sem timer (e volta ao normal se a preferência mudar).
  useEffect(() => {
    if (reduced) setStep(LAST);
    else setStep(0);
    idx.current = 0;
    started.current = false;
  }, [reduced]);

  // Só roda com a demo na tela.
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const active = !reduced && !paused && inView;
  useEffect(() => {
    if (!active) return undefined;
    let id;
    const tick = () => {
      const i = idx.current;
      id = setTimeout(() => {
        started.current = true;
        setStep(EVENTS[i][1]);
        idx.current = (i + 1) % EVENTS.length;
        tick();
      }, gapBefore(i, started.current));
    };
    tick();
    return () => clearTimeout(id);
  }, [active]);

  // A conversa rola com transform: o último balão visível fica ancorado embaixo, sem pulo de layout.
  useLayoutEffect(() => {
    const b = body.current;
    const t = track.current;
    if (!b || !t) return undefined;
    const place = () => {
      let shown = -1;
      BUBBLES.forEach((x, i) => {
        if (step >= x.at) shown = i;
      });
      let y = 0;
      if (shown >= 0) {
        const el = t.children[shown];
        y = Math.min(0, b.clientHeight - 12 - (el.offsetTop + el.offsetHeight));
      }
      t.style.transform = `translateY(${y}px)`;
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [step]);

  const on = (n) => step >= n;
  const chip = step >= 6 ? ['ok', 'Agendado'] : step >= 3 ? ['q', 'Qualificado'] : ['n', 'Novo contato'];

  return (
    <div ref={root} className={cx('mdemo', step === 9 && 'is-out', step === 0 && 'is-reset')} data-step={step} data-last={LAST} role="group" aria-label="Demonstração animada: do primeiro oi à agenda">
      <button type="button" className="mdemo-btn" aria-label={paused ? 'Retomar demonstração' : 'Pausar demonstração'} onClick={() => setPaused((p) => !p)}>
        {paused ? PLAY : PAUSE}
      </button>

      <div className="m-card m-chat" aria-hidden="true">
        <div className="m-chat-hd">
          <span className="m-av">A</span>
          <span className="m-who">
            <span className="m-nm">
              Clínica Aurora
              <svg width="12" height="12" viewBox="0 0 12 12"><circle cx="6" cy="6" r="6" fill="#3FA86F" /><path d="M3.4 6.2l1.7 1.7 3.5-3.6" fill="none" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <span className="m-st">Agente Nhandu · online</span>
          </span>
        </div>
        <div className="m-chat-body" ref={body}>
          <div className="m-track" ref={track}>
            {BUBBLES.map((b) => (
              <div key={b.t} className={cx('m-it', 'm-b', b.out ? 'm-out' : 'm-in', on(b.at) && 'on')}>
                {b.t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={cx('m-link', on(1) && 'on')} aria-hidden="true" />

      <div className="m-card m-ficha" aria-hidden="true">
        <div className="m-ficha-hd">
          <span className="m-mono m-mu">Paciente #0481</span>
          <span key={chip[0]} className={cx('m-chip', 'm-' + chip[0], on(1) && 'on')}>{chip[1]}</span>
        </div>
        <div className="m-title">
          <span className={cx('m-it', 'm-ident', on(1) && !on(2) && 'on')}>Identificando interesse…</span>
          <span className={cx('m-it', 'm-name', on(2) && 'on')}>Clareamento dental</span>
        </div>
        <dl className="m-rows">
          <div className={cx('m-it', 'm-row', on(2) && 'on')}><dt>Origem</dt><dd className="m-mono">landing/instagram</dd></div>
          <div className={cx('m-it', 'm-row', on(3) && 'on')}><dt>Preferência</dt><dd className="m-mono">tarde, após 17h</dd></div>
          <div className={cx('m-it', 'm-row', on(6) && 'on')}><dt>Horário</dt><dd className="m-mono">qui · 17:30</dd></div>
          <div className={cx('m-it', 'm-row', on(6) && 'on')}><dt>Responsável</dt><dd className="m-mono">recepção</dd></div>
        </dl>
      </div>

      <div className={cx('m-link', on(6) && 'on')} aria-hidden="true" />

      <div className="m-card m-agenda" aria-hidden="true">
        <div className="m-agenda-hd m-mono">
          <span>Agenda · qui, 12 nov</span>
          <span className="m-sync"><i />sincronizada</span>
        </div>
        <ul className="m-slots">
          <li><span className="m-mono">09:00</span><span>Limpeza · Marcos S.</span></li>
          <li><span className="m-mono">14:00</span><span>Retorno · Pedro A.</span></li>
          <li><span className="m-mono">16:30</span><em>livre</em></li>
          <li className="m-book">
            <i className={cx('m-hl', on(7) && 'on')} />
            <span className="m-mono">17:30</span>
            <span className="m-slot-txt">
              <em className={cx('m-it', 'm-free', !on(7) && 'on')}>livre</em>
              <span className={cx('m-it', 'm-booked', on(7) && 'on')}>
                <b>Clareamento · paciente #0481</b>
                <small>via agente no WhatsApp</small>
              </span>
            </span>
          </li>
          <li><span className="m-mono">18:30</span><em>livre</em></li>
        </ul>
        <p className={cx('m-it', 'm-note', on(8) && 'on')}>
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.3l2.4 2.4 4.6-4.9" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Recepção avisada, resumo da conversa enviado
        </p>
      </div>
    </div>
  );
}

function MobileDemo({ narrow, reduced }) {
  const [host, setHost] = useState(null);

  useEffect(() => {
    const frame = document.querySelector('.nh .vframe');
    const video = frame && frame.querySelector('video');
    if (!narrow || !frame) {
      setHost(null);
      return undefined;
    }
    const el = document.createElement('div');
    el.className = 'mdemo-host';
    frame.appendChild(el);
    setHost(el);

    // O boot() do NhanduPage chama play() ~80 ms depois do mount: segura o vídeo pausado enquanto for celular.
    let resume = false;
    const hold = () => video.pause();
    if (video) {
      resume = !video.paused || (video.currentTime === 0 && !window.matchMedia(REDUCE).matches);
      video.pause();
      video.addEventListener('play', hold);
    }
    return () => {
      if (video) {
        video.removeEventListener('play', hold);
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
  }, [narrow]);

  return host ? createPortal(<Demo key={String(reduced)} reduced={reduced} />, host) : null;
}

export default function MobileEnhance() {
  const narrow = useMedia(NARROW);
  const reduced = useMedia(REDUCE);
  useFloatingCta(narrow);
  return <MobileDemo narrow={narrow} reduced={reduced} />;
}
