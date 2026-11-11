// Recebe o briefing da cliente e repassa ao destino configurado.
// Destinos (Vercel > Settings > Environment Variables), com os do diagnóstico como reserva:
//   SUPABASE_URL + SUPABASE_SECRET_KEY                 -> tabela "briefings" (recomendado: fica guardado)
//   BRIEFING_WEBHOOK_URL (ou DIAGNOSTICO_WEBHOOK_URL)  -> n8n, Make, Zapier ou planilha
//   RESEND_API_KEY + BRIEFING_EMAIL (ou DIAGNOSTICO_EMAIL) -> e-mail via Resend
import { etapasDoBriefing } from '../../../lib/briefing';

const clean = (v, max) => String(v ?? '').trim().slice(0, max);
const LIMITE_BYTES = 100_000; // um briefing completo tem poucos KB

export async function POST(req) {
  let body;
  try {
    const texto = await req.text();
    if (texto.length > LIMITE_BYTES) return Response.json({ ok: false, error: 'grande_demais' }, { status: 413 });
    body = JSON.parse(texto);
  } catch { return Response.json({ ok: false, error: 'json' }, { status: 400 }); }
  if (!body || typeof body !== 'object') return Response.json({ ok: false, error: 'json' }, { status: 400 });

  const nicho = typeof body.nicho === 'string' ? body.nicho : '';
  const estrutura = etapasDoBriefing(nicho);
  if (!estrutura) return Response.json({ ok: false, error: 'nicho' }, { status: 400 });
  if (body.consentimento !== true) return Response.json({ ok: false, error: 'consentimento' }, { status: 422 });

  // Só aceita os campos que existem no formulário, com tamanho limitado.
  const respostas = body.respostas && typeof body.respostas === 'object' ? body.respostas : {};
  const blocos = estrutura.etapas.map((etapa) => ({
    titulo: etapa.titulo,
    respostas: etapa.campos.map((c) => {
      const v = respostas[c.id];
      const valor = c.tipo === 'varias'
        ? (Array.isArray(v) ? c.opcoes.filter((o) => v.includes(o)) : []) // só opções válidas, sem repetição
        : c.tipo === 'escolha' ? (c.opcoes.includes(v) ? v : '') : clean(v, c.tipo === 'longo' ? 2000 : 200);
      return { id: c.id, pergunta: c.rotulo, resposta: valor };
    }),
  }));

  const achar = (id) => blocos.flatMap((b) => b.respostas).find((r) => r.id === id)?.resposta || '';
  const nome = achar('nome');
  const whatsapp = achar('whatsapp');
  if (!nome || String(whatsapp).replace(/\D/g, '').length < 10) return Response.json({ ok: false, error: 'campos' }, { status: 422 });
  // O formulário valida todas as obrigatórias; aqui só recusamos briefing quase vazio.
  const faltando = estrutura.etapas.flatMap((e) => e.campos).filter((c) => c.obrigatorio)
    .filter((c) => { const r = achar(c.id); return Array.isArray(r) ? !r.length : !r; });
  if (faltando.length) return Response.json({ ok: false, error: 'campos', faltando: faltando.map((c) => c.id) }, { status: 422 });

  const briefing = { tipo: 'briefing', nicho, nome, whatsapp, blocos, origem: clean(body.origem, 500), recebidoEm: new Date().toISOString() };

  const webhook = process.env.BRIEFING_WEBHOOK_URL || process.env.DIAGNOSTICO_WEBHOOK_URL;
  const emailPara = process.env.BRIEFING_EMAIL || process.env.DIAGNOSTICO_EMAIL;
  const jobs = [];
  const supabase = destinoSupabase();
  if (supabase) {
    // Guarda no banco (tabela "briefings", ver supabase/briefings.sql). Chave secreta: só no servidor.
    jobs.push(['supabase', fetch(supabase.url, {
      method: 'POST', headers: supabase.headers, signal: AbortSignal.timeout(8000),
      body: JSON.stringify({ nicho, nome, whatsapp, blocos, origem: briefing.origem, consentimento_em: briefing.recebidoEm, recebido_em: briefing.recebidoEm }),
    })]);
  }
  if (webhook) {
    jobs.push(['webhook', fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(briefing), signal: AbortSignal.timeout(8000) })]);
  }
  if (process.env.RESEND_API_KEY && emailPara) {
    const texto = [
      `Novo briefing (${estrutura.nome})`, `${nome} · ${whatsapp}`, '',
      ...blocos.flatMap((b) => [`## ${b.titulo}`, ...b.respostas.map((r) => `- ${r.pergunta}\n  ${Array.isArray(r.resposta) ? r.resposta.join(', ') : r.resposta || '—'}`), '']),
      `Origem: ${briefing.origem}`,
    ].join('\n');
    jobs.push(['email', fetch('https://api.resend.com/emails', {
      method: 'POST', signal: AbortSignal.timeout(8000), headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.DIAGNOSTICO_EMAIL_FROM || 'Nhandu <onboarding@resend.dev>', to: [emailPara], subject: `Briefing: ${nome} (${estrutura.nome})`, text: texto }),
    })]);
  }
  if (!jobs.length) {
    // Sem destino configurado não há onde guardar: o briefing ficaria só nos logs.
    // Não gravamos as respostas no log (podem ter dados pessoais); só avisamos.
    console.warn('[briefing] nenhum destino configurado');
    return Response.json({ ok: false, error: 'sem_destino' }, { status: 503 });
  }
  const res = await Promise.allSettled(jobs.map(([, p]) => p));
  // Registra cada destino que falhou, só com o status ou o tipo do erro (nunca a mensagem: pode conter a chave).
  const falhas = res.map((r, i) => [jobs[i][0], r.status === 'fulfilled' ? (r.value.ok ? null : r.value.status) : r.reason?.name || 'erro'])
    .filter(([, f]) => f !== null);
  if (falhas.length) console.error('[briefing] falha ao entregar em', Object.fromEntries(falhas));
  const ok = res.some((r) => r.status === 'fulfilled' && r.value.ok);
  return Response.json({ ok }, { status: ok ? 200 : 502 });
}

/** Monta o destino do Supabase a partir do ambiente, ou null se não estiver configurado direito. */
function destinoSupabase() {
  const url = (process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '').replace(/\/rest\/v1$/, '');
  const chave = (process.env.SUPABASE_SECRET_KEY || '').trim();
  if (!url && !chave) return null;
  // Chave nova (sb_secret_...) vai só no apikey; a antiga (service_role) é um JWT e vai também no Authorization.
  const nova = chave.startsWith('sb_secret_');
  const antiga = chave.startsWith('eyJ');
  if (!url.startsWith('https://') || !(nova || antiga) || /\s/.test(chave)) {
    console.error('[briefing] SUPABASE_URL ou SUPABASE_SECRET_KEY inválida: use a URL https do projeto e a chave secreta (sb_secret_... ou service_role)');
    return null;
  }
  const headers = { apikey: chave, 'Content-Type': 'application/json', Prefer: 'return=minimal' };
  if (antiga) headers.Authorization = `Bearer ${chave}`;
  return { url: `${url}/rest/v1/briefings`, headers };
}
