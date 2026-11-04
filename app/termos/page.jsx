import Legal, { legalInfo } from '../../components/Legal';

export const metadata = { title: 'Termos de Uso — Nhandu' };

export default function Termos() {
  const { CNPJ, EMAIL } = legalInfo;
  return (
    <Legal title="Termos de Uso" updated="novembro de 2026">
      <p>Estes termos valem para o uso deste site, mantido pela Nhandu Tecnologia (CNPJ {CNPJ}). Os serviços contratados (página, agente de IA, automações e suporte) são regidos por contrato próprio, assinado entre a Nhandu e cada cliente.</p>

      <h2>1. O que este site oferece</h2>
      <p>Informações sobre os serviços da Nhandu, uma calculadora de estimativa e um formulário para pedir um diagnóstico sem compromisso.</p>

      <h2>2. Calculadora</h2>
      <p>A calculadora faz uma estimativa simples a partir dos números que você informa. Ela não é promessa de resultado nem garantia de receita.</p>

      <h2>3. Exemplos e demonstrações</h2>
      <p>Conversas, agendas, nomes de empresas e números mostrados nas telas são exemplos ilustrativos, salvo quando indicado o contrário.</p>

      <h2>4. Limites do agente de IA</h2>
      <p>Os agentes instalados pela Nhandu qualificam contatos e agendam atendimentos com base em um roteiro aprovado pelo cliente. Eles não fazem diagnóstico, orientação clínica, jurídica ou financeira, e transferem a conversa para a equipe humana sempre que o assunto sai do roteiro.</p>

      <h2>5. Propriedade intelectual</h2>
      <p>A marca Nhandu, os textos, o design e o código deste site pertencem à Nhandu. Não é permitido copiá-los sem autorização.</p>

      <h2>6. Privacidade</h2>
      <p>O tratamento de dados pessoais segue a nossa <a href="/privacidade">Política de Privacidade</a>.</p>

      <h2>7. Contato</h2>
      <p>Dúvidas sobre estes termos: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. Fica eleito o foro da comarca de Ourinhos/SP.</p>
    </Legal>
  );
}
