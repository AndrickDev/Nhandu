// Comportamentos que só existem em produção: WhatsApp, CNPJ e envio do formulário.
const WA = (process.env.NEXT_PUBLIC_WHATSAPP || '').replace(/\D/g, '');
const WA_TEXT = encodeURIComponent('Olá! Vim pelo site da Nhandu e quero falar com o agente.');
const CNPJ = process.env.NEXT_PUBLIC_CNPJ || '';

export function prodVals(self) {
  const st = self.state || {};
  return {
    waLink: WA ? `https://wa.me/${WA}?text=${WA_TEXT}` : '#form-diag',
    waTarget: WA ? '_blank' : '_self',
    cnpjTxt: CNPJ ? `CNPJ ${CNPJ}` : 'CNPJ em registro',
    formBusy: st.formState === 'sending',
    formBtn: st.formState === 'sending' ? 'Enviando…' : st.formState === 'sent' ? 'Pedido enviado ✓' : 'Quero meu diagnóstico →',
    formMsg: st.formState === 'sent' ? 'Recebemos o seu pedido. Vamos chamar você no WhatsApp em até 1 dia útil.' : st.formState === 'error' ? 'Não conseguimos enviar agora. Tente de novo ou fale com a gente pelo WhatsApp.' : '',
    submitDiag: self._submitDiag || (self._submitDiag = (e) => self.submitDiag(e)),
  };
}

export const prodMethods = {
  async submitDiag(e) {
    e.preventDefault();
    if ((this.state || {}).formState === 'sending') return;
    const f = new FormData(e.currentTarget);
    const st = this.state || {};
    const cm = st.cm ?? 300, cp = st.cp ?? 35, cc = st.cc ?? 2, ct = st.ct ?? 400;
    const lost = Math.round(Math.round(cm * cp / 100) * cc / 10);
    const payload = {
      nome: f.get('nome'), empresa: f.get('empresa'), whatsapp: f.get('whatsapp'), segmento: f.get('segmento'),
      calculadora: { contatosMes: cm, foraHorarioPct: cp, fechamentoDe10: cc, valorCliente: ct, clientesPerdidosMes: lost, receitaEmJogoMes: lost * ct },
      origem: typeof window !== 'undefined' ? window.location.href : '',
      utm: typeof window !== 'undefined' ? Object.fromEntries(new URLSearchParams(window.location.search)) : {},
    };
    this.setState({ formState: 'sending' });
    try {
      const r = await fetch('/api/diagnostico', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error('status ' + r.status);
      this.setState({ formState: 'sent' });
      e.target.reset && e.target.reset();
    } catch (err) {
      this.setState({ formState: 'error' });
    }
  },
};
