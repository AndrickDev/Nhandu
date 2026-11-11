'use client';
// Landing de DEMONSTRAÇÃO para nutricionistas (formato-produto da Nhandu).
// Nome, foto, datas e números são exemplos. A cliente real troca tudo pelo briefing.
// Regras do CFN respeitadas: sem antes e depois, sem promessa de resultado,
// sem promoções e sem oferecer consulta antes do registro no CRN.
import { useEffect, useRef, useState } from 'react';

const WA = (process.env.NEXT_PUBLIC_WHATSAPP || '').replace(/\D/g, '');
const NHANDU_LINK = WA
  ? `https://wa.me/${WA}?text=${encodeURIComponent('Olá! Vi a página de exemplo de nutrição e quero uma assim.')}`
  : '/#form-diag';

// ---------- conteúdo (o que muda por cliente) ----------
const NOME = 'Marina Alves';
const PRIMEIRO = 'Marina';
const PREVISAO = 'março de 2027';

const AREAS = ['Nutrição esportiva', 'Rotina e trabalho', 'Gestação e pós-parto', 'Alimentação vegetariana', 'Comportamento alimentar', 'Nutrição infantil'];

const CONVERSAS = {
  espera: {
    aba: 'Lista de espera',
    hora: '19:42',
    msgs: [
      ['eu', 'Oi! Vi seu perfil, você já está atendendo?'],
      ['ag', `Oi! Que bom seu contato 😊 A ${PRIMEIRO} abre a agenda assim que sair o registro no CRN, previsto para ${PREVISAO}.`],
      ['ag', 'Quer entrar na lista de espera? Quem está nela é avisado primeiro.'],
      ['eu', 'Quero sim!'],
      ['ag', 'Perfeito! Qual é o seu objetivo principal: rotina, esporte, gestação ou outro?'],
      ['eu', 'Esporte, corro 3x por semana'],
      ['ag', 'Anotado ✓ Você está na lista. Já te mando o guia de lista de compras.'],
    ],
  },
  agenda: {
    aba: 'Agendar consulta',
    hora: '19:42',
    msgs: [
      ['eu', 'Oi! Queria marcar uma consulta'],
      ['ag', 'Oi! Que bom 😊 Prefere online ou presencial?'],
      ['eu', 'Online'],
      ['ag', 'Tenho quinta 18h ou sábado 9h. Qual fica melhor?'],
      ['eu', 'Sábado 9h'],
      ['ag', 'Confirmado ✓ Sábado, 9h, online. O link chega aqui na véspera.'],
    ],
  },
  dieta: {
    aba: 'Dieta pronta?',
    hora: '21:15',
    msgs: [
      ['eu', 'Você passa dieta pra emagrecer rápido?'],
      ['ag', `A ${PRIMEIRO} não trabalha com dieta pronta nem promessa de resultado: o plano é montado com você, na consulta.`],
      ['ag', 'Quer que eu te explique como funciona o acompanhamento?'],
      ['eu', 'Quero'],
      ['ag', 'São 4 passos: conversa, avaliação, plano feito junto e acompanhamento. Te mando o resumo 👇'],
    ],
  },
  // Antes do CRN: a estudante não pode receber caso clínico. O agente explica e oferece a lista.
  saudeEspera: {
    aba: 'Fora do horário',
    hora: '23:48',
    msgs: [
      ['eu', 'Tenho diabetes, o que posso comer no café?'],
      ['ag', 'Essa pergunta precisa de consulta com nutricionista registrado, com avaliação completa. Por aqui não passamos orientação de saúde.'],
      ['ag', `A ${PRIMEIRO} ainda não atende: a agenda abre depois do registro no CRN. Quer que eu te avise quando abrir?`],
      ['eu', 'Quero, obrigada!'],
    ],
  },
  saude: {
    aba: 'Fora do horário',
    hora: '23:48',
    msgs: [
      ['eu', 'Tenho diabetes, o que posso comer no café?'],
      ['ag', 'Essa é uma pergunta para a consulta, com avaliação completa. Por aqui eu não passo orientação de saúde.'],
      ['ag', `Anotei para a ${PRIMEIRO} saber do seu caso. Amanhã cedo ela te responde, tudo bem?`],
      ['eu', 'Tudo bem, obrigada!'],
    ],
  },
};

const ETAPAS = [
  { t: 'Conversa inicial', d: 'Entender a sua rotina, o que você já tentou e o que quer mudar. Sem julgamento.', b: 'Pelo WhatsApp ou na primeira consulta' },
  { t: 'Avaliação', d: 'Histórico, hábitos, exames que você já tem e medidas, quando fizer sentido.', b: 'Presencial ou online' },
  { t: 'Plano feito com você', d: 'Nada de cardápio pronto: escolhas que cabem no seu horário, no seu bolso e no seu gosto.', b: 'Entregue depois da consulta' },
  { t: 'Acompanhamento', d: 'Ajustes ao longo das semanas e um canal para dúvidas entre as consultas.', b: 'Retornos combinados' },
];

const PERGUNTAS = [
  ['Quanto custa a consulta?', 'Os valores são informados pelo WhatsApp quando a agenda abrir, junto com as opções de acompanhamento.'],
  [`A ${PRIMEIRO} já atende?`, `Ainda não. Ela está concluindo a graduação e abre a agenda depois do registro no CRN, previsto para ${PREVISAO}. Quem está na lista de espera é avisado primeiro.`],
  ['O atendimento pode ser online?', 'Sim. As consultas vão ser presenciais em Ourinhos ou online, por videochamada.'],
  ['Vou receber uma dieta pronta?', 'Não. O plano é construído com você, a partir da sua rotina e dos seus objetivos.'],
  ['O que acontece com os meus dados?', 'Seu nome e WhatsApp servem só para avisar sobre a agenda e enviar os materiais. Você pode pedir para sair da lista a qualquer momento.'],
];

const DEMO = {
  espera: {
    selo: 'Nutrição · Ourinhos e online',
    linha2: 'A agenda abre em breve.',
    sub: `Sou ${NOME}, estou concluindo Nutrição e abro minha agenda de consultas assim que sair o registro no CRN. Entre na lista de espera para ser avisada primeiro e, enquanto isso, receba meu guia gratuito de lista de compras.`,
    cta: 'Entrar na lista de espera',
    conversas: ['espera', 'dieta', 'saudeEspera'],
    chips: ['Lista de espera aberta', 'Guia gratuito no WhatsApp', 'Consultas após o registro no CRN'],
    cardTit: 'Lista de espera',
    cardLinhas: [['Ana P.', 'Esporte', 'agora'], ['Carla M.', 'Gestação', '2 h'], ['Júlia R.', 'Rotina', 'ontem']],
    formTit: 'Entre na lista de espera',
    formBtn: 'Quero ser avisada',
    prova3: `Agenda a partir de ${PREVISAO}`,
  },
  aberta: {
    selo: 'Nutrição · Ourinhos e online · CRN-3 00000',
    linha2: 'A agenda está aberta.',
    sub: `Sou ${NOME}, nutricionista. Atendo presencialmente em Ourinhos e online, com um plano feito a partir da sua rotina e acompanhamento entre as consultas.`,
    cta: 'Agendar consulta',
    conversas: ['agenda', 'dieta', 'saude'],
    chips: ['Consulta presencial ou online', 'Plano feito com você', 'Acompanhamento entre consultas'],
    cardTit: 'Agenda da semana',
    cardLinhas: [['Qui 18:00', 'Online', 'confirmada'], ['Sex 10:30', 'Presencial', 'confirmada'], ['Sáb 09:00', 'Online', 'nova']],
    formTit: 'Agende sua primeira consulta',
    formBtn: 'Quero agendar',
    prova3: 'Retornos combinados',
  },
};

// ---------- peças ----------
function Logo({ claro }) {
  return (
    <span className={`nt-logo ${claro ? 'claro' : ''}`}>
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
        <path d="M13 23C7 19 4 14 5 7c4 0 8 2 8 8 0-6 4-8 8-8 1 7-2 12-8 16Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M13 23v-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {NOME}
    </span>
  );
}

const Check = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setR(m.matches);
    const on = () => setR(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return r;
}

/** Celular com a conversa se escrevendo; troca de exemplo a cada 9 s (pausa quando a pessoa escolhe uma aba). */
function Celular({ chaves, reduzido }) {
  const [ativa, setAtiva] = useState(0);
  const [visiveis, setVisiveis] = useState(0);
  const [auto, setAuto] = useState(true);
  const chave = chaves[ativa] ?? chaves[0];
  const conv = CONVERSAS[chave];

  useEffect(() => { setAtiva(0); }, [chaves]);

  useEffect(() => {
    if (reduzido) { setVisiveis(conv.msgs.length); return; }
    setVisiveis(0);
    const timers = conv.msgs.map((_, i) => setTimeout(() => setVisiveis(i + 1), 500 + i * 1100));
    return () => timers.forEach(clearTimeout);
  }, [chave, reduzido, conv.msgs]);

  useEffect(() => {
    if (!auto || reduzido) return;
    const t = setTimeout(() => setAtiva((a) => (a + 1) % chaves.length), 9000);
    return () => clearTimeout(t);
  }, [ativa, auto, reduzido, chaves.length]);

  const proxima = conv.msgs[visiveis];
  return (
    <div className="nt-cel-wrap">
      <div className="nt-abas" role="tablist" aria-label="Exemplos de conversa">
        {chaves.map((k, i) => (
          <button key={k} type="button" role="tab" aria-selected={i === ativa}
            className={i === ativa ? 'on' : ''} onClick={() => { setAtiva(i); setAuto(false); }}>
            {CONVERSAS[k].aba}
          </button>
        ))}
      </div>
      <div className="nt-cel" aria-hidden="true">
        <div className="nt-tela">
          <div className="nt-status"><span>{conv.hora}</span><i className="nt-ilha" /><span>●●● 5G</span></div>
          <div className="nt-chat-hd">
            <span className="nt-av">MA</span>
            <div><b>{NOME} · Nutrição</b><small>{proxima ? (proxima[0] === 'ag' ? 'digitando…' : 'online') : 'online'}</small></div>
          </div>
          <div className="nt-msgs" key={chave}>
            {conv.msgs.slice(0, visiveis).map(([quem, txt], i) => (
              <p key={i} className={`nt-b ${quem}`}>{txt}{quem === 'eu' && <span className="nt-vv">✓✓</span>}</p>
            ))}
            {proxima && !reduzido && <p className={`nt-digit ${proxima[0]}`}><i /><i /><i /></p>}
          </div>
          <div className="nt-digitar"><span>Mensagem</span><i>➤</i></div>
        </div>
      </div>
      {/* transcrição para leitores de tela */}
      <div className="sr" role="tabpanel">
        {conv.msgs.map(([quem, txt], i) => <p key={i}>{quem === 'eu' ? 'Pessoa' : 'Atendimento'}: {txt}</p>)}
      </div>
    </div>
  );
}

/** Etapas do acompanhamento: a etapa ativa é calculada pela posição da rolagem. */
function Etapas({ reduzido }) {
  const ref = useRef(null);
  const [ativa, setAtiva] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      if (total <= 0) return;
      const p = Math.min(Math.max(-r.top / total, 0), 0.999);
      setAtiva(Math.floor(p * ETAPAS.length));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  return (
    <section className={`nt-etapas ${reduzido ? 'estatico' : ''}`} id="como" ref={ref} aria-labelledby="como-tit">
      <div className="nt-etapas-fix">
        <div className="nt-wrap nt-etapas-in">
          <div>
            <p className="nt-kicker">Como vai ser o acompanhamento</p>
            <h2 className="nt-h2" id="como-tit">Quatro passos, <em>no seu ritmo.</em></h2>
            <ol className="nt-lista-etapas">
              {ETAPAS.map((e, i) => (
                <li key={e.t} className={i === ativa ? 'on' : i < ativa ? 'feito' : ''}>
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  <div><b>{e.t}</b><p>{e.d}</p><small>{e.b}</small></div>
                </li>
              ))}
            </ol>
          </div>
          <div className="nt-placas" aria-hidden="true">
            {ETAPAS.map((e, i) => (
              <div key={e.t} className={`nt-placa ${i === ativa ? 'on' : ''} ${i < ativa ? 'feito' : ''}`} style={{ '--i': i }}>
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                <b>{e.t}</b>
                <IconeEtapa i={i} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function IconeEtapa({ i }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const svgs = [
    <svg key="0" viewBox="0 0 48 48" width="40" height="40"><path {...p} d="M8 12h24a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H18l-8 6v-6H8a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4Z" /><path {...p} d="M13 21h14M13 26h8" /></svg>,
    <svg key="1" viewBox="0 0 48 48" width="40" height="40"><rect {...p} x="11" y="7" width="26" height="34" rx="4" /><path {...p} d="M17 17h14M17 23h14M17 29h8" /><path {...p} d="M19 7v-1a5 5 0 0 1 10 0v1" /></svg>,
    <svg key="2" viewBox="0 0 48 48" width="40" height="40"><circle {...p} cx="24" cy="26" r="13" /><path {...p} d="M24 13c0-4 3-7 7-7M24 26l5-5" /></svg>,
    <svg key="3" viewBox="0 0 48 48" width="40" height="40"><path {...p} d="M6 34l10-10 8 6 16-16" /><path {...p} d="M32 14h8v8" /></svg>,
  ];
  return svgs[i];
}

// ---------- página ----------
export default function NutricaoDemo() {
  const reduzido = useReducedMotion();
  const [modo, setModo] = useState('espera');
  const [enviado, setEnviado] = useState(false);
  const [fixoVisivel, setFixoVisivel] = useState(false);
  const D = DEMO[modo];

  // Botão fixo do celular: só aparece depois da primeira dobra, para não tapar os botões do topo.
  useEffect(() => {
    const onScroll = () => setFixoVisivel(window.scrollY > 640);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const irPara = (id) => (e) => {
    const alvo = document.getElementById(id);
    if (!alvo) return;
    e.preventDefault();
    const topo = alvo.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top: topo, behavior: reduzido ? 'auto' : 'smooth' });
  };

  return (
    <div className="nutri">
      <a className="skip" href="#conteudo">Pular para o conteúdo</a>

      <div className="nt-demo">
        <div className="nt-wrap nt-demo-in">
          <p><b>Página de demonstração</b><span> · nome, fotos e dados são exemplos</span></p>
          <div className="nt-demo-acoes">
            <div className="nt-toggle" role="group" aria-label="Ver a página">
              <button type="button" aria-pressed={modo === 'espera'} onClick={() => setModo('espera')}>Antes do CRN</button>
              <button type="button" aria-pressed={modo === 'aberta'} onClick={() => setModo('aberta')}>Agenda aberta</button>
            </div>
            <a className="nt-demo-cta" href={NHANDU_LINK} target={WA ? '_blank' : undefined} rel="noopener">Quero uma assim →</a>
          </div>
        </div>
      </div>

      <header className="nt-hdr">
        <div className="nt-wrap nt-hdr-in">
          <a href="#topo" onClick={irPara('topo')} aria-label={`${NOME}, início`}><Logo /></a>
          <nav className="nt-nav" aria-label="Seções">
            <a href="#como" onClick={irPara('como')}>Acompanhamento</a>
            <a href="#sobre" onClick={irPara('sobre')}>Sobre</a>
            <a href="#materiais" onClick={irPara('materiais')}>Materiais</a>
            <a href="#perguntas" onClick={irPara('perguntas')}>Perguntas</a>
          </nav>
          <a className="nt-btn nt-btn-solid" href="#lista" onClick={irPara('lista')}>{D.cta}</a>
        </div>
      </header>

      <main id="conteudo">
        <section className="nt-hero" id="topo">
          <div className="nt-hero-bg" aria-hidden="true" />
          <div className="nt-wrap nt-hero-in">
            <div>
              <span className="nt-selo"><b>Exemplo</b>{D.selo}</span>
              <h1 className="nt-h1" key={modo}>
                <span>Comer bem pode ser simples.</span>
                <span>{D.linha2}</span>
              </h1>
              <p className="nt-hero-p">{D.sub}</p>
              <div className="nt-chips">
                {D.chips.map((c) => (
                  <span key={c}><Check />{c}</span>
                ))}
              </div>
              <div className="nt-ctas">
                <a className="nt-btn nt-btn-acc" href="#lista" onClick={irPara('lista')}>{D.cta} <span className="arr">→</span></a>
                <a className="nt-btn nt-btn-line" href="#materiais" onClick={irPara('materiais')}>Receber o guia gratuito</a>
              </div>
              <ul className="nt-provas">
                <li><b>Graduação em Nutrição</b><span>Universidade de exemplo</span></li>
                <li><b>Estágio em nutrição clínica</b><span>Exemplo de experiência</span></li>
                <li><b>{D.prova3}</b><span>{modo === 'espera' ? 'após o registro no CRN-3' : 'presencial e online'}</span></li>
              </ul>
            </div>

            <div className="nt-hero-dir">
              <Celular chaves={D.conversas} reduzido={reduzido} />
              <div className="nt-notif" aria-hidden="true">
                <span className="nt-av sm">MA</span>
                <div><b>{modo === 'espera' ? 'Nova pessoa na lista' : 'Consulta confirmada'}</b><small>{modo === 'espera' ? 'Ana P. · objetivo: esporte' : 'Sáb 09:00 · online'}</small></div>
                <small className="q">agora</small>
              </div>
              <div className="nt-card" aria-hidden="true">
                <p className="nt-card-t">{D.cardTit} <span>exemplo</span></p>
                {D.cardLinhas.map(([a, b, c]) => (
                  <div key={a} className="nt-card-l"><b>{a}</b><span>{b}</span><small className={c === 'agora' || c === 'nova' ? 'novo' : ''}>{c}</small></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="nt-faixa" aria-label="Áreas de atendimento">
          <div className="nt-faixa-in">
            {[...AREAS, ...AREAS].map((a, i) => <span key={i} aria-hidden={i >= AREAS.length}>{a}<i>✦</i></span>)}
          </div>
        </div>

        <Etapas reduzido={reduzido} />

        <section className="nt-sec" id="sobre" aria-labelledby="sobre-tit">
          <div className="nt-wrap nt-sobre">
            <figure className="nt-foto">
              <div className="nt-foto-ph" role="img" aria-label="Espaço para a foto da nutricionista">
                <span>MA</span>
                <small>Aqui entra a sua foto<br />luz natural · fundo claro · sorrindo</small>
              </div>
            </figure>
            <div>
              <p className="nt-kicker">Sobre mim</p>
              <h2 className="nt-h2" id="sobre-tit">Nutrição que cabe <em>na vida real.</em></h2>
              <p className="nt-lead">Escolhi a Nutrição depois de ver, em casa, como a comida pode ser cuidado e também peso. Quero ajudar pessoas a comer bem sem culpa e sem regras impossíveis de seguir. <span className="nt-ex">(texto de exemplo)</span></p>
              <ul className="nt-form-lista">
                <li><Check />Graduação em Nutrição, conclusão prevista para {PREVISAO}</li>
                <li><Check />Estágios em nutrição clínica e esportiva</li>
                <li><Check />{modo === 'espera' ? 'Registro no CRN-3 em andamento' : 'CRN-3 00000'}</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="nt-sec nt-sec-alt" id="materiais" aria-labelledby="mat-tit">
          <div className="nt-wrap">
            <p className="nt-kicker">Materiais gratuitos</p>
            <h2 className="nt-h2" id="mat-tit">Comece hoje, <em>sem pressa.</em></h2>
            <div className="nt-bento">
              <article className="nt-bx grande">
                <b>Guia de lista de compras</b>
                <p>Um checklist simples para montar a semana sem desperdício. Chega no seu WhatsApp quando você entra na lista.</p>
                <ul className="nt-mini-check" aria-hidden="true">
                  {['Frutas da estação', 'Proteínas para 3 dias', 'Lanches práticos', 'Temperos naturais'].map((t, i) => (
                    <li key={t} style={{ '--d': `${i * 0.6}s` }}><i />{t}</li>
                  ))}
                </ul>
              </article>
              <article className="nt-bx">
                <b>Receitas da semana</b>
                <p>Ideias rápidas no Instagram, toda segunda.</p>
                <div className="nt-mini-pratos" aria-hidden="true"><i /><i /><i /></div>
              </article>
              <article className="nt-bx">
                <b>Dúvidas respondidas</b>
                <p>Mitos e perguntas comuns, explicados com calma.</p>
                <div className="nt-mini-balao" aria-hidden="true"><i>?</i><i>✓</i></div>
              </article>
            </div>
          </div>
        </section>

        <section className="nt-sec nt-dk" id="lista" aria-labelledby="lista-tit">
          <div className="nt-wrap nt-lista">
            <div>
              <p className="nt-kicker">{modo === 'espera' ? 'Lista de espera' : 'Agendamento'}</p>
              <h2 className="nt-h2" id="lista-tit">{D.formTit}</h2>
              <ul className="nt-recebe">
                {(modo === 'espera'
                  ? ['Aviso antes de todo mundo quando a agenda abrir', 'Guia de lista de compras no WhatsApp', 'Resposta a qualquer hora, sem ficar esperando']
                  : ['Horário confirmado na hora, pelo WhatsApp', 'Lembrete na véspera da consulta', 'Resposta a qualquer hora, sem ficar esperando']
                ).map((t) => <li key={t}><Check />{t}</li>)}
              </ul>
            </div>
            <form className="nt-form" onSubmit={(e) => { e.preventDefault(); setEnviado(true); }}>
              <label>Seu nome<input name="nome" required autoComplete="name" /></label>
              <label>WhatsApp<input name="whatsapp" required inputMode="tel" autoComplete="tel" placeholder="(14) 99999-0000" /></label>
              <label>Seu objetivo principal
                <select name="objetivo" defaultValue="">
                  <option value="" disabled>Escolha uma opção</option>
                  <option>Rotina mais saudável</option><option>Esporte</option><option>Gestação</option><option>Outro</option>
                </select>
              </label>
              <label className="nt-consent"><input type="checkbox" required />Aceito receber mensagens no WhatsApp sobre a agenda e os materiais. Posso sair quando quiser.</label>
              <button type="submit" className="nt-btn nt-btn-acc">{D.formBtn} <span className="arr">→</span></button>
              <p className="nt-form-msg" role="status">{enviado ? 'Exemplo: na página real, você entraria na lista e o guia chegaria no seu WhatsApp em segundos.' : ''}</p>
            </form>
          </div>
        </section>

        <section className="nt-sec" id="perguntas" aria-labelledby="perg-tit">
          <div className="nt-wrap nt-perg">
            <div>
              <p className="nt-kicker">Perguntas</p>
              <h2 className="nt-h2" id="perg-tit">Antes de <em>começar.</em></h2>
            </div>
            <div>
              {PERGUNTAS.map(([p, r], i) => (
                <details key={p} open={i === 0}>
                  <summary>{p}<span aria-hidden="true">+</span></summary>
                  <p>{r}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="nt-final">
          <div className="nt-wrap">
            <h2 className="nt-h2">Quando a agenda abrir, <em>você fica sabendo primeiro.</em></h2>
            <a className="nt-btn nt-btn-acc" href="#lista" onClick={irPara('lista')}>{D.cta} <span className="arr">→</span></a>
          </div>
        </section>
      </main>

      <footer className="nt-rod">
        <div className="nt-wrap nt-rod-in">
          <Logo />
          <p>{modo === 'espera' ? 'Estudante de Nutrição · registro no CRN-3 em andamento' : 'Nutricionista · CRN-3 00000'} · Ourinhos/SP</p>
          <p className="nt-rod-nh">Exemplo de página feita pela <a href="/">Nhandu</a></p>
        </div>
      </footer>

      <a className={`nt-fixo ${fixoVisivel ? 'on' : ''}`} href="#lista" onClick={irPara('lista')} aria-hidden={!fixoVisivel} tabIndex={fixoVisivel ? 0 : -1}>{D.cta}</a>
    </div>
  );
}
