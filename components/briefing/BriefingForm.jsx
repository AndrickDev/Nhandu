'use client';
// Formulário de briefing em etapas. O rascunho fica salvo só neste navegador,
// para a cliente poder parar e voltar depois. Ao enviar, vai para /api/briefing.
import { useEffect, useMemo, useRef, useState } from 'react';

const chaveRascunho = (nicho) => `nhandu-briefing-${nicho}`;

function lerRascunho(nicho) {
  try { return JSON.parse(localStorage.getItem(chaveRascunho(nicho)) || '{}'); } catch { return {}; }
}
function salvarRascunho(nicho, dados) {
  try { localStorage.setItem(chaveRascunho(nicho), JSON.stringify(dados)); } catch { /* navegador sem armazenamento: segue sem rascunho */ }
}
function apagarRascunho(nicho) {
  try { localStorage.removeItem(chaveRascunho(nicho)); } catch { /* idem */ }
}

const vazio = (v) => v == null || (Array.isArray(v) ? v.length === 0 : String(v).trim() === '');

/** Devolve a mensagem de erro do campo, ou null se estiver ok. */
function problema(c, v) {
  if (c.obrigatorio && vazio(v)) return 'Responda esta pergunta para continuar.';
  if (c.minDigitos && !vazio(v) && String(v).replace(/\D/g, '').length < c.minDigitos) return 'Digite o número com DDD, ex.: (14) 99999-0000.';
  return null;
}

function Campo({ c, valor, mudar, erro }) {
  const id = `f-${c.id}`;
  const rotulo = <>{c.rotulo}{c.obrigatorio && <span className="bf-obr" aria-hidden="true"> *</span>}</>;
  const descErro = erro ? `${id}-erro` : undefined;
  const msgErro = erro && <p className="bf-erro" id={`${id}-erro`}>{erro}</p>;

  if (c.tipo === 'escolha' || c.tipo === 'varias') {
    const multi = c.tipo === 'varias';
    const sel = multi ? (Array.isArray(valor) ? valor : []) : valor;
    return (
      <fieldset className="bf-campo" aria-describedby={descErro} aria-invalid={erro || undefined}>
        <legend>{rotulo}{multi && <small> · pode marcar mais de uma</small>}</legend>
        <div className="bf-opcoes">
          {c.opcoes.map((o) => {
            const marcado = multi ? sel.includes(o) : sel === o;
            return (
              <label key={o} className={marcado ? 'on' : ''}>
                <input type={multi ? 'checkbox' : 'radio'} name={c.id} value={o} checked={marcado}
                  onChange={() => mudar(c.id, multi ? (marcado ? sel.filter((x) => x !== o) : [...sel, o]) : o)} />
                {o}
              </label>
            );
          })}
        </div>
        {msgErro}
      </fieldset>
    );
  }

  const comum = {
    id, name: c.id, value: valor || '', placeholder: c.placeholder, autoComplete: c.auto,
    'aria-invalid': erro || undefined, 'aria-describedby': descErro, required: c.obrigatorio,
    onChange: (e) => mudar(c.id, e.target.value),
  };
  return (
    <div className="bf-campo">
      <label htmlFor={id}>{rotulo}</label>
      {c.tipo === 'longo' ? <textarea rows={3} {...comum} /> : <input type={c.auto === 'email' ? 'email' : c.auto === 'tel' ? 'tel' : 'text'} {...comum} />}
      {msgErro}
    </div>
  );
}

export default function BriefingForm({ nicho, nomeNicho, etapas }) {
  const [dados, setDados] = useState({});
  const [passo, setPasso] = useState(0);
  const [erros, setErros] = useState({});
  const [consent, setConsent] = useState(false);
  const [estado, setEstado] = useState('editando'); // editando | enviando | enviado | erro
  const [carregou, setCarregou] = useState(false);
  const topo = useRef(null);

  useEffect(() => { setDados(lerRascunho(nicho)); setCarregou(true); }, [nicho]);
  useEffect(() => { if (carregou && estado !== 'enviado') salvarRascunho(nicho, dados); }, [dados, nicho, carregou, estado]);

  const etapa = etapas[passo];
  const ultima = passo === etapas.length - 1;
  const total = etapas.length;
  const respondidas = useMemo(
    () => etapas.flatMap((e) => e.campos).filter((c) => !vazio(dados[c.id])).length,
    [dados, etapas],
  );

  const mudar = (id, v) => {
    setDados((d) => ({ ...d, [id]: v }));
    if (erros[id]) setErros((e) => ({ ...e, [id]: false }));
  };

  const errosDaEtapa = (n) => Object.fromEntries(
    etapas[n].campos.map((c) => [c.id, problema(c, dados[c.id])]).filter(([, msg]) => msg),
  );

  /** Mostra os erros da etapa n e foca o primeiro campo com problema. */
  const marcarErros = (n, lista) => {
    setErros(lista);
    const primeiro = Object.keys(lista)[0];
    if (primeiro) requestAnimationFrame(() => document.getElementsByName(primeiro)[0]?.focus());
    return !primeiro;
  };

  const irPara = (n, errosIniciais = {}) => {
    setPasso(n);
    marcarErros(n, errosIniciais);
    if (!Object.keys(errosIniciais).length) requestAnimationFrame(() => topo.current?.scrollIntoView({ block: 'start' }));
  };

  /** Antes de enviar, confere todas as etapas e leva para a primeira com problema. */
  const primeiraEtapaComErro = () => etapas.findIndex((_, n) => Object.keys(errosDaEtapa(n)).length > 0);

  const enviar = async () => {
    const n = primeiraEtapaComErro();
    if (n !== -1) return irPara(n, errosDaEtapa(n));
    setEstado('enviando');
    try {
      const r = await fetch('/api/briefing', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nicho, respostas: dados, consentimento: true, origem: window.location.href }),
      });
      if (r.status === 422) {
        // O servidor recusou um campo: leva até ele em vez de pedir para "tentar de novo".
        const { faltando = [] } = await r.json().catch(() => ({}));
        const alvo = etapas.findIndex((e) => e.campos.some((c) => c.id === 'whatsapp' || faltando.includes(c.id)));
        setEstado('editando');
        return irPara(Math.max(alvo, 0), { ...(faltando.length ? {} : { whatsapp: 'Confira o número com DDD.' }), ...Object.fromEntries(faltando.map((id) => [id, 'Responda esta pergunta para continuar.'])) });
      }
      if (!r.ok) throw new Error(String(r.status));
      apagarRascunho(nicho);
      setEstado('enviado');
      requestAnimationFrame(() => topo.current?.scrollIntoView({ block: 'start' }));
    } catch {
      setEstado('erro');
    }
  };

  const avancar = (e) => {
    e.preventDefault();
    if (!marcarErros(passo, errosDaEtapa(passo))) return;
    if (!ultima) return irPara(passo + 1);
    if (!consent) { setErros({ consent: true }); return; }
    enviar();
  };

  return (
    <div className="bf">
      <header className="bf-hdr">
        <div className="bf-wrap bf-hdr-in">
          <a href="/" className="bf-marca">nhandu</a>
          <span className="bf-tag">Briefing · {nomeNicho}</span>
        </div>
      </header>

      <main className="bf-wrap bf-main" ref={topo}>
        {estado === 'enviado' ? (
          <section className="bf-fim" aria-live="polite">
            <p className="bf-kicker">Recebido</p>
            <h1 className="bf-h1">Obrigado, {String(dados.nome || '').split(' ')[0] || 'tudo certo'}! <em>Agora é com a gente.</em></h1>
            <p className="bf-lead">Vamos ler tudo e chamar você no WhatsApp em até 1 dia útil. Se puder, já mande por lá a sua logo e as fotos.</p>
          </section>
        ) : (
          <>
            <div className="bf-topo">
              <p className="bf-kicker">Etapa {passo + 1} de {total}</p>
              <h1 className="bf-h1">{etapa.titulo}</h1>
              <p className="bf-lead">{etapa.intro}</p>
              {/* Navegação entre etapas: só dá para voltar; avançar é sempre pelo botão, que valida. */}
              <nav className="bf-prog" aria-label="Etapas do formulário">
                {etapas.map((e, i) => (
                  <button key={e.id} type="button" className={i === passo ? 'on' : i < passo ? 'feito' : ''}
                    disabled={i >= passo} aria-current={i === passo ? 'step' : undefined}
                    onClick={() => irPara(i)} aria-label={`Etapa ${i + 1}: ${e.titulo}${i < passo ? ' (voltar)' : ''}`} />
                ))}
              </nav>
              <p className="bf-salvo">{carregou && respondidas > 0 ? `${respondidas} respostas salvas neste navegador. Pode parar e voltar depois.` : 'Leva uns 15 minutos. Suas respostas ficam salvas neste navegador.'}</p>
            </div>

            <form className="bf-form" onSubmit={avancar} noValidate>
              {etapa.campos.map((c) => (
                <Campo key={c.id} c={c} valor={dados[c.id]} mudar={mudar} erro={erros[c.id] || null} />
              ))}

              {ultima && (
                <label className={`bf-consent ${erros.consent ? 'erro' : ''}`}>
                  <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setErros((x) => ({ ...x, consent: false })); }} />
                  Autorizo a Nhandu a usar estas respostas para criar a minha página e o meu atendimento no WhatsApp. Posso pedir para apagar os dados quando quiser.
                </label>
              )}

              <div className="bf-acoes">
                {passo > 0 && <button type="button" className="bf-btn linha" onClick={() => irPara(passo - 1)}>← Voltar</button>}
                <button type="submit" className="bf-btn" disabled={estado === 'enviando'}>
                  {ultima ? (estado === 'enviando' ? 'Enviando…' : 'Enviar briefing') : 'Continuar →'}
                </button>
              </div>
              <p className="bf-msg" role="status">
                {estado === 'erro' ? 'Não conseguimos enviar agora. Suas respostas continuam salvas: tente de novo em instantes.' : erros.consent ? 'Marque a autorização para enviar.' : ''}
              </p>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
