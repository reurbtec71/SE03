export const MUNICIPIOS = [
  "Pinhão",
  "Macambira",
  "Itabaiana",
  "Moita Bonita",
  "Carira",
] as const;

export const UFS = [
  "AC","AL","AM","AP","BA","CE","DF","ES","GO","MA","MG","MS","MT","PA",
  "PB","PE","PI","PR","RJ","RN","RO","RR","RS","SC","SE","SP","TO",
];

export const CONTAGEM_OPCOES = ["0","1","2","3","4","5","6","7","8","9","10+"];

export const NACIONALIDADE_OPCOES = ["Brasileira", "Estrangeira"];
export const SEXO_OPCOES = ["Masculino", "Feminino", "Outro"];
export const ESTADO_CIVIL_OPCOES = [
  "Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "União Estável",
];

export const ESCOLARIDADE_OPCOES = [
  "Nenhuma", "Fundamental incompleto", "Fundamental completo",
  "Médio incompleto", "Médio completo", "Superior incompleto",
  "Superior completo", "Pós-graduação",
];

export const SITUACAO_EMPREGO_OPCOES = [
  "Empregado formal", "Empregado informal", "Autônomo", "Desempregado(a)",
  "Aposentado(a)", "Pensionista", "Do lar", "Estudante",
];

export const TEMPO_OCUPACAO_OPCOES = [
  "Menos de 1 ano", "1 a 3 anos", "3 a 5 anos", "5 a 10 anos", "10 a 20 anos", "Mais de 20 anos",
];

export const FORMA_AQUISICAO_OPCOES = [
  "Compra", "Herança", "Doação", "Posse", "Cessão", "Permuta", "Outro",
];

export const TIPO_CONTRATO_OPCOES = [
  "Compra e Venda", "Cessão de Direitos", "Comodato", "Doação", "Permuta", "Outro",
];

export const PAVIMENTOS_OPCOES = ["1", "2", "3", "4 ou mais"];

export const MATERIAL_PAREDES_OPCOES = [
  "Alvenaria com revestimento", "Alvenaria sem revestimento", "Madeira aproveitada",
  "Madeira aparelhada", "Taipa revestida", "Taipa não revestida", "Misto", "Outro",
];

export const MATERIAL_COBERTURA_OPCOES = [
  "Telha cerâmica", "Telha fibrocimento", "Telha metálica", "Laje de concreto",
  "Zinco", "Palha", "Outro",
];

export const MATERIAL_PISO_OPCOES = [
  "Cerâmica/Porcelanato", "Cimento", "Terra batida", "Madeira", "Tábua corrida", "Outro",
];

export const ESTADO_CONSERVACAO_OPCOES = ["Bom", "Regular", "Precário", "Ruim"];

export const TIPO_USO_OPCOES = ["Residencial", "Comercial", "Misto", "Institucional"];

// Concessionárias de Sergipe (equivalentes às da Bahia no sistema de Jequié: EMBASA/COELBA)
export const AGUA_OPCOES = [
  "Rede pública (DESO)", "Poço artesiano", "Poço comum", "Nascente/Mina",
  "Cisterna", "Carro-pipa", "Outro",
];

export const ESGOTO_OPCOES = [
  "Rede pública", "Fossa séptica", "Fossa rudimentar", "Céu aberto", "Vala/Canal", "Outro",
];

export const ENERGIA_OPCOES = [
  "Rede pública (ENERGISA)", "Gerador", "Solar", "Sem energia", "Ligação clandestina",
];

export const COLETA_LIXO_OPCOES = [
  "Regular (diária)", "Regular (2x semana)", "Regular (semanal)", "Irregular",
  "Queima", "Enterra", "Céu aberto", "Inexistente",
];

export const PAVIMENTACAO_OPCOES = [
  "Asfalto", "Paralelepípedo", "Calçamento", "Concreto", "Terra/Barro", "Outro",
];

export const TIPO_RISCO_OPCOES = [
  "Inundação", "Deslizamento", "Erosão", "Contaminação do solo",
  "Contaminação hídrica", "Múltiplos riscos", "Outro",
];

export const CONDICAO_HABITACIONAL_OPCOES = [
  "Adequada", "Regular", "Subnormal", "Precária", "Insalubre",
];

export const CLASSIFICACAO_OPCOES = ["REURB-S", "REURB-E"];
export const STATUS_OPCOES = ["Pendente", "Em análise", "Aprovado", "Indeferido"];
export const PRIORIDADE_OPCOES = ["Baixa", "Média", "Alta"];

export const BRAND = {
  navy: "#1A2D47",
  orange: "#E17A3A",
  blueGray: "#6F80A0",
};
