// Perguntas do formulário de briefing (Etapa 2: enviado à cliente DEPOIS que ela fecha).
// Fonte: documento "Nhandu — Roteiro de Briefing para Landing Pages".
// Ficaram de fora as partes internas (objeções, preço, regras de abordagem).
// Cada resposta vira a página e a ficha do agente no WhatsApp.
//
// tipos: texto | longo | escolha (uma opção) | varias (várias opções) | sim_nao

const UNIVERSAIS = [
  {
    id: 'voce',
    titulo: 'Você e o seu negócio',
    intro: 'O básico para começarmos.',
    campos: [
      { id: 'nome', rotulo: 'Seu nome completo', tipo: 'texto', obrigatorio: true, auto: 'name' },
      { id: 'whatsapp', rotulo: 'Seu WhatsApp com DDD', tipo: 'texto', obrigatorio: true, auto: 'tel', placeholder: '(14) 99999-0000', minDigitos: 10 },
      { id: 'email', rotulo: 'E-mail', tipo: 'texto', auto: 'email' },
      { id: 'instagram', rotulo: 'Instagram (se tiver)', tipo: 'texto', placeholder: '@seuperfil' },
      { id: 'resumo', rotulo: 'Em uma frase: o que você faz e para quem?', tipo: 'longo', obrigatorio: true },
    ],
  },
  {
    id: 'objetivo',
    titulo: 'O objetivo da página',
    intro: 'O que a página precisa fazer por você.',
    campos: [
      { id: 'acao', rotulo: 'Qual é a ação mais importante para quem visitar a página?', tipo: 'escolha', obrigatorio: true,
        opcoes: ['Entrar numa lista de espera', 'Agendar um horário', 'Pedir orçamento', 'Fazer um pedido', 'Baixar um material gratuito'] },
      { id: 'origem', rotulo: 'Hoje, como as pessoas chegam até você?', tipo: 'varias',
        opcoes: ['Instagram', 'Indicação', 'Google', 'Anúncios', 'Ainda não tenho clientes'] },
      { id: 'sucesso', rotulo: 'Daqui a 3 meses, o que faria você dizer "valeu a pena"?', tipo: 'longo' },
    ],
  },
  {
    id: 'publico',
    titulo: 'Quem você quer atender',
    intro: 'Essas respostas viram o título e a linguagem da página.',
    campos: [
      { id: 'cliente_ideal', rotulo: 'Quem é a pessoa que você mais quer atender? (idade, momento de vida, onde mora)', tipo: 'longo', obrigatorio: true },
      { id: 'dor', rotulo: 'Que problema ela tem quando procura você? Escreva com as palavras que ela usa.', tipo: 'longo', obrigatorio: true },
      { id: 'tentou', rotulo: 'O que ela já tentou antes e não funcionou?', tipo: 'longo' },
      { id: 'nao_atende', rotulo: 'Quem você prefere não atender?', tipo: 'longo' },
    ],
  },
  {
    id: 'oferta',
    titulo: 'O que você oferece',
    intro: 'Como funciona o seu trabalho, do primeiro contato até o fim.',
    campos: [
      { id: 'passo_a_passo', rotulo: 'O que a pessoa recebe, passo a passo?', tipo: 'longo', obrigatorio: true },
      { id: 'diferencial', rotulo: 'Por que escolher você e não outro profissional da cidade?', tipo: 'longo' },
      { id: 'duvidas', rotulo: 'Quais são as 3 dúvidas que você mais escuta antes de alguém decidir?', tipo: 'longo' },
      { id: 'preco_visivel', rotulo: 'O valor aparece na página?', tipo: 'escolha', opcoes: ['Sim', 'Não, só pelo WhatsApp', 'Ainda não sei'] },
    ],
  },
  {
    id: 'confianca',
    titulo: 'Sobre você',
    intro: 'A parte que faz a pessoa confiar.',
    campos: [
      { id: 'historia', rotulo: 'Sua história em 2 ou 3 frases: por que escolheu essa área?', tipo: 'longo', obrigatorio: true },
      { id: 'formacao', rotulo: 'Formação, cursos e registro profissional', tipo: 'longo' },
      { id: 'depoimentos', rotulo: 'Tem depoimentos de clientes que autorizam o uso?', tipo: 'escolha', opcoes: ['Sim, com autorização', 'Tenho, mas sem autorização ainda', 'Ainda não'] },
    ],
  },
  {
    id: 'visual',
    titulo: 'Marca e visual',
    intro: 'Como a página vai parecer.',
    campos: [
      { id: 'tem_marca', rotulo: 'Você já tem logo e cores?', tipo: 'escolha', opcoes: ['Sim, logo e cores', 'Só as cores', 'Ainda não'] },
      { id: 'tres_palavras', rotulo: 'Se não tem: 3 palavras que descrevem como você quer ser vista', tipo: 'texto', placeholder: 'ex.: leve, acolhedora, moderna' },
      { id: 'referencias', rotulo: 'Links de 2 ou 3 sites ou perfis de que você gosta do visual (e 1 de que não gosta)', tipo: 'longo' },
      { id: 'tom', rotulo: 'Como você quer falar com as pessoas?', tipo: 'escolha', opcoes: ['Acolhedora', 'Técnica', 'Descontraída'] },
      { id: 'fotos', rotulo: 'Fotos suas', tipo: 'escolha', opcoes: ['Já tenho fotos profissionais', 'Tenho fotos boas de celular', 'Topo fazer uma sessão'] },
    ],
  },
  {
    id: 'contato',
    titulo: 'Depois do clique',
    intro: 'Estas respostas configuram o atendimento automático no WhatsApp.',
    campos: [
      { id: 'quem_responde', rotulo: 'Hoje, quem responde o WhatsApp, e em quanto tempo?', tipo: 'longo' },
      { id: 'perguntas_antes', rotulo: 'Quais perguntas você sempre faz antes de agendar ou fechar?', tipo: 'longo', obrigatorio: true },
      { id: 'horarios', rotulo: 'Seus horários de atendimento', tipo: 'texto', placeholder: 'ex.: seg a sex, 8h às 18h' },
      { id: 'local', rotulo: 'Onde você atende?', tipo: 'escolha', opcoes: ['Presencial', 'Online', 'Os dois'] },
      { id: 'endereco', rotulo: 'Endereço ou cidade', tipo: 'texto' },
    ],
  },
  {
    id: 'pratico',
    titulo: 'Para finalizar',
    intro: 'Últimos detalhes e o que você vai nos enviar.',
    campos: [
      { id: 'dominio', rotulo: 'Você já tem um domínio (endereço de site)?', tipo: 'texto', placeholder: 'ex.: seunome.com.br ou "não tenho"' },
      { id: 'prazo', rotulo: 'Tem alguma data importante para a página estar no ar?', tipo: 'texto', placeholder: 'ex.: formatura em março' },
      { id: 'aprova', rotulo: 'Quem aprova a página além de você?', tipo: 'texto' },
      { id: 'materiais', rotulo: 'O que você consegue enviar pelo WhatsApp?', tipo: 'varias',
        opcoes: ['Logo e cores', 'Fotos minhas', 'Fotos do espaço ou dos produtos', 'Depoimentos autorizados', 'Lista de serviços ou produtos', 'Número do registro profissional'] },
    ],
  },
];

const NICHOS = {
  nutricao: {
    nome: 'Nutrição',
    bloco: {
      id: 'nicho',
      titulo: 'Sobre a sua nutrição',
      intro: 'Perguntas específicas da sua área. Seguimos as regras do CFN: sem antes e depois, sem promessa de resultado e sem promoções.',
      campos: [
        { id: 'semestre', rotulo: 'Em que momento você está?', tipo: 'escolha', obrigatorio: true,
          opcoes: ['Estudante (estágio)', 'Recém-formada, aguardando o CRN', 'Já tenho registro no CRN'] },
        { id: 'previsao', rotulo: 'Previsão de formatura e de registro no CRN', tipo: 'texto', placeholder: 'ex.: formatura dez/2026, CRN em mar/2027' },
        { id: 'supervisao', rotulo: 'Se atende em estágio: com supervisão de qual nutricionista?', tipo: 'texto' },
        { id: 'area', rotulo: 'Sua área principal', tipo: 'varias',
          opcoes: ['Clínica', 'Esportiva', 'Materno-infantil', 'Comportamental', 'Vegetariana', 'Outra'] },
        { id: 'consulta', rotulo: 'Como vai ser a consulta? (duração, retornos, o que a pessoa leva para casa)', tipo: 'longo' },
        { id: 'conteudo', rotulo: 'Você já produz conteúdo? Topa um material gratuito (ex.: guia, receitas)?', tipo: 'longo' },
        { id: 'abordagem', rotulo: 'Sua abordagem em uma frase', tipo: 'texto' },
        { id: 'parcerias', rotulo: 'Parcerias com academias, médicos ou psicólogos?', tipo: 'texto' },
      ],
    },
  },
  clinica: {
    nome: 'Clínicas e consultórios',
    bloco: {
      id: 'nicho',
      titulo: 'Sobre a sua clínica',
      intro: 'Perguntas específicas da sua área.',
      campos: [
        { id: 'procedimentos', rotulo: 'Quais procedimentos ou especialidades mais trazem paciente novo? Qual você quer vender mais?', tipo: 'longo', obrigatorio: true },
        { id: 'convenio', rotulo: 'Atendimento', tipo: 'escolha', opcoes: ['Particular', 'Convênio', 'Os dois'] },
        { id: 'convenios', rotulo: 'Se atende convênio: quais?', tipo: 'texto' },
        { id: 'trava', rotulo: 'O que costuma impedir alguém de agendar? (medo, preço, tempo)', tipo: 'longo' },
        { id: 'agenda', rotulo: 'Quem controla a agenda e em qual sistema?', tipo: 'texto' },
        { id: 'equipe', rotulo: 'Quem da equipe aparece na página?', tipo: 'longo' },
      ],
    },
  },
  confeitaria: {
    nome: 'Confeitaria e alimentação',
    bloco: {
      id: 'nicho',
      titulo: 'Sobre os seus produtos',
      intro: 'Perguntas específicas da sua área.',
      campos: [
        { id: 'cardapio', rotulo: 'Cardápio, sabores e preços: o que mais vende?', tipo: 'longo', obrigatorio: true },
        { id: 'encomendas', rotulo: 'Encomendas: prazo mínimo, quantidade mínima e sinal', tipo: 'longo' },
        { id: 'entrega', rotulo: 'Entrega ou retirada? Qual a área e a taxa?', tipo: 'longo' },
        { id: 'eventos', rotulo: 'Você participa de feiras e eventos? Como divulga a agenda hoje?', tipo: 'longo' },
        { id: 'datas', rotulo: 'Quais as datas fortes do ano para você?', tipo: 'texto' },
        { id: 'versoes', rotulo: 'Versões especiais', tipo: 'varias', opcoes: ['Zero lactose', 'Diet', 'Sem glúten', 'Vegana', 'Nenhuma'] },
      ],
    },
  },
};

export const NICHOS_DISPONIVEIS = Object.keys(NICHOS);

/** Etapas do formulário para um nicho: o bloco do nicho entra logo depois de "O que você oferece". */
export function etapasDoBriefing(nicho) {
  // Object.hasOwn: "__proto__", "constructor" etc. não podem passar como nicho.
  if (typeof nicho !== 'string' || !Object.hasOwn(NICHOS, nicho)) return null;
  const n = NICHOS[nicho];
  const i = UNIVERSAIS.findIndex((b) => b.id === 'oferta') + 1;
  return { nome: n.nome, etapas: [...UNIVERSAIS.slice(0, i), n.bloco, ...UNIVERSAIS.slice(i)] };
}
