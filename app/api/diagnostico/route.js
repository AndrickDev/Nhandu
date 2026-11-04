// Recebe o pedido de diagnóstico (com os números da calculadora) e repassa ao destino configurado.
// Destinos (configure na Vercel, em Settings > Environment Variables):
//   DIAGNOSTICO_WEBHOOK_URL  -> webhook do n8n, Make, Zapier ou Google Apps Script (planilha)
//   RESEND_API_KEY + DIAGNOSTICO_EMAIL (+ DIAGNOSTICO_EMAIL_FROM) -> e-mail via Resend
const clean = (v, max = 200) => String(v ?? '').trim().slice(0, max);

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return Response.json({ ok: false, error: 'json' }, { status: 400 }); }
  const lead = {
    nome: clean(body.nome, 120), empresa: clean(body.empresa, 160), whatsapp: clean(body.whatsapp, 40), segmento: clean(body.segmento, 80),
    calculadora: body.calculadora && typeof body.calculadora === 'object' ? {
      contatosMes: Number(body.calculadora.contatosMes) || 0, foraHorarioPct: Number(body.calculadora.foraHorarioPct) || 0,
      fechamentoDe10: Number(body.calculadora.fechamentoDe10) || 0, valorCliente: Number(body.calculadora.valorCliente) || 0,
      clientesPerdidosMes: Number(body.calculadora.clientesPerdidosMes) || 0, receitaEmJogoMes: Number(body.calculadora.receitaEmJogoMes) || 0,
    } : null,
    origem: clean(body.origem, 500), utm: body.utm && typeof body.utm === 'object' ? body.utm : {},
    recebidoEm: new Date().toISOString(),
  };
  if (!lead.nome || lead.whatsapp.replace(/\D/g, '').length < 10) return Response.json({ ok: false, error: 'campos' }, { status: 422 });

  const jobs = [];
  if (process.env.DIAGNOSTICO_WEBHOOK_URL) {
    jobs.push(fetch(process.env.DIAGNOSTICO_WEBHOOK_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead) }));
  }
  if (process.env.RESEND_API_KEY && process.env.DIAGNOSTICO_EMAIL) {
    const c = lead.calculadora;
    const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
    const text = [
      `Novo pedido de diagnóstico`, ``, `Nome: ${lead.nome}`, `Empresa: ${lead.empresa}`, `WhatsApp: ${lead.whatsapp}`, `Segmento: ${lead.segmento}`,
      c ? `\nCalculadora:\n- ${c.contatosMes} contatos/mês, ${c.foraHorarioPct}% fora do horário\n- fecha ${c.fechamentoDe10} de 10, cliente vale ${brl(c.valorCliente)}\n- ${c.clientesPerdidosMes} clientes possíveis perdidos/mês = ${brl(c.receitaEmJogoMes)}/mês` : '',
      `\nOrigem: ${lead.origem}`,
    ].join('\n');
    jobs.push(fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.DIAGNOSTICO_EMAIL_FROM || 'Nhandu <onboarding@resend.dev>', to: [process.env.DIAGNOSTICO_EMAIL], subject: `Diagnóstico: ${lead.empresa || lead.nome}`, text }),
    }));
  }
  if (!jobs.length) {
    console.warn('[diagnostico] nenhum destino configurado; pedido:', JSON.stringify(lead));
    return Response.json({ ok: true, delivered: false });
  }
  const res = await Promise.allSettled(jobs);
  const ok = res.some((r) => r.status === 'fulfilled' && r.value.ok);
  if (!ok) console.error('[diagnostico] falha ao entregar', res.map((r) => r.status === 'fulfilled' ? r.value.status : String(r.reason)));
  return Response.json({ ok }, { status: ok ? 200 : 502 });
}
