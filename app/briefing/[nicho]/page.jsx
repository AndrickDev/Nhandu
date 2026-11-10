import { notFound } from 'next/navigation';
import './briefing.css';
import BriefingForm from '../../../components/briefing/BriefingForm';
import { NICHOS_DISPONIVEIS, etapasDoBriefing } from '../../../lib/briefing';

export function generateStaticParams() {
  return NICHOS_DISPONIVEIS.map((nicho) => ({ nicho }));
}
export const dynamicParams = false;

export const metadata = {
  title: 'Briefing da sua página · Nhandu',
  description: 'Formulário para montar a sua página e o atendimento no WhatsApp com a Nhandu.',
  robots: { index: false, follow: false },
};

export default async function Page({ params }) {
  const { nicho } = await params;
  const dados = etapasDoBriefing(nicho);
  if (!dados) notFound();
  return <BriefingForm nicho={nicho} nomeNicho={dados.nome} etapas={dados.etapas} />;
}
