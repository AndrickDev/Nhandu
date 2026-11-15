import NhanduPage from '../components/NhanduPage';
import { SITE, SITE_NAME, CONTACT_EMAIL, OG_BASE, serializeJsonLd } from '../lib/site.mjs';

const TITLE = 'Agente de IA no WhatsApp para atender e agendar 24h | Nhandu';
const DESCRIPTION = 'A Nhandu instala em até 14 dias um agente de IA que atende, qualifica e agenda pelo WhatsApp 24h, com página de conversão e automação até o CRM.';

export const metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: { ...OG_BASE, url: '/', title: TITLE, description: DESCRIPTION },
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'Organization', '@id': SITE + '/#org', name: SITE_NAME, legalName: 'Nhandu Tecnologia', url: SITE, logo: SITE + '/apple-icon.png', email: CONTACT_EMAIL },
    { '@type': 'WebSite', '@id': SITE + '/#site', url: SITE, name: SITE_NAME, inLanguage: 'pt-BR', publisher: { '@id': SITE + '/#org' } },
    {
      '@type': 'Service',
      name: 'Agente de IA no WhatsApp, página de conversão e automação',
      serviceType: 'Atendimento automatizado com IA no WhatsApp',
      description: DESCRIPTION,
      areaServed: { '@type': 'Country', name: 'Brasil' },
      provider: { '@id': SITE + '/#org' },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(JSON_LD) }} />
      <NhanduPage />
    </>
  );
}
