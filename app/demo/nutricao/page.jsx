import './nutricao.css';
import NutricaoDemo from '../../../components/demo/NutricaoDemo';

// Página de demonstração: não deve aparecer no Google.
export const metadata = {
  title: 'Marina Alves · Nutrição (demonstração Nhandu)',
  description: 'Exemplo de página para nutricionistas, feito pela Nhandu: marca pessoal, lista de espera e atendimento no WhatsApp.',
  robots: { index: false, follow: false },
};

export const viewport = { themeColor: '#F4F1EA' };

export default function Page() {
  return <NutricaoDemo />;
}
