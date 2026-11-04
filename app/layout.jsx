import './fonts.css';
import './page.css';

// Endereço do site: variável própria > domínio de produção da Vercel > domínio final.
function siteUrl() {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || 'nhandu.com.br').trim();
  try { return new URL(/^https?:\/\//.test(raw) ? raw : `https://${raw}`).origin; }
  catch { return 'https://nhandu.com.br'; }
}
const SITE = siteUrl();

export const metadata = {
  metadataBase: new URL(SITE),
  title: 'Nhandu — Agente de IA no WhatsApp, página e automação para o seu negócio',
  description: 'Nenhum cliente sem resposta. Em até 14 dias, a Nhandu instala um agente de IA que atende, qualifica e agenda pelo WhatsApp 24 horas, uma página que converte e as automações até a agenda e o CRM.',
  openGraph: {
    title: 'Nhandu — Nenhum cliente sem resposta',
    description: 'Agente de IA no WhatsApp, página de conversão e automação. No ar em até 14 dias.',
    url: SITE, siteName: 'Nhandu', locale: 'pt_BR', type: 'website',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Nhandu — Nenhum cliente sem resposta' }],
  },
  twitter: { card: 'summary_large_image', images: ['/og.png'] },
  icons: { icon: '/icon.svg', apple: '/apple-icon.png' },
};

export const viewport = { themeColor: '#F5F1E8' };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
