import Legal, { legalInfo } from '../../components/Legal';

export const metadata = { title: 'Política de Privacidade — Nhandu' };

export default function Privacidade() {
  const { CNPJ, EMAIL } = legalInfo;
  return (
    <Legal title="Política de Privacidade" updated="novembro de 2026">
      <p>Esta política explica quais dados pessoais a Nhandu Tecnologia (CNPJ {CNPJ}) coleta neste site, para que usa e quais são os seus direitos, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).</p>

      <h2>1. Dados que coletamos neste site</h2>
      <ul>
        <li><b>Pedido de diagnóstico:</b> nome, empresa, WhatsApp e segmento que você informa no formulário.</li>
        <li><b>Briefing (para quem contratou a Nhandu):</b> nome, WhatsApp, e-mail, Instagram e as respostas sobre o seu negócio, enviadas pelo formulário de briefing.</li>
        <li><b>Calculadora:</b> os números que você digita (contatos por mês, percentual fora do horário, taxa de fechamento e valor médio de cliente), enviados junto com o pedido.</li>
        <li><b>Dados de navegação:</b> página de origem e parâmetros de campanha (UTM), para sabermos de onde veio o contato.</li>
      </ul>

      <h2>2. Para que usamos</h2>
      <ul>
        <li>Entrar em contato para marcar o diagnóstico que você pediu.</li>
        <li>Preparar o diagnóstico com base nos números informados.</li>
        <li>Criar a página e configurar o atendimento contratado, a partir das respostas do briefing.</li>
        <li>Medir quais canais trazem contatos, de forma agregada.</li>
      </ul>
      <p>A base legal é o seu consentimento ao enviar o formulário e o procedimento preliminar a um contrato que você solicitou (art. 7º, I e V, da LGPD). Não vendemos nem compartilhamos seus dados para publicidade de terceiros.</p>

      <h2>3. Com quem compartilhamos</h2>
      <p>Somente com fornecedores necessários para operar o site e o atendimento, como hospedagem, banco de dados, envio de e-mail e ferramentas de automação, todos sujeitos a obrigações de confidencialidade e segurança.</p>

      <h2 id="dados">4. Dados dos clientes atendidos pelos nossos agentes</h2>
      <p>Quando instalamos o agente de IA para uma empresa, as conversas, a agenda e os registros pertencem à empresa contratante, que é a <b>controladora</b> desses dados. A Nhandu atua como <b>operadora</b>: trata os dados apenas para prestar o serviço contratado, segundo as instruções da controladora e um acordo de tratamento de dados assinado entre as partes. Pedidos de titulares sobre esses dados devem ser feitos à empresa com quem a pessoa conversou, e nós apoiamos a resposta.</p>

      <h2>5. Por quanto tempo guardamos</h2>
      <p>Pedidos de diagnóstico ficam guardados por até 24 meses. Briefings ficam guardados enquanto durar o contrato e por até 24 meses depois. Em ambos os casos, por menos tempo se você pedir a exclusão. Depois disso, são apagados ou anonimizados.</p>

      <h2>6. Seus direitos</h2>
      <p>Você pode pedir a qualquer momento: confirmação de que tratamos seus dados, acesso, correção, anonimização, portabilidade, exclusão, informação sobre compartilhamento e revogação do consentimento. Basta escrever para <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. Respondemos em até 15 dias.</p>

      <h2>7. Segurança</h2>
      <p>Usamos conexão criptografada (HTTPS), acesso restrito aos dados e fornecedores com práticas reconhecidas de segurança.</p>

      <h2>8. Cookies</h2>
      <p>Este site não usa cookies de publicidade. Se passarmos a usar ferramentas de medição de anúncios, esta política será atualizada e pediremos o seu consentimento quando necessário.</p>

      <h2>9. Contato do encarregado</h2>
      <p>Dúvidas sobre esta política ou sobre seus dados: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>
    </Legal>
  );
}
