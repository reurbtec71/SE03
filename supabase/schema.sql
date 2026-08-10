-- SE03 REURB — Lote 3/Sergipe — schema do banco (Supabase/Postgres)
-- Execute este script no SQL Editor do seu projeto Supabase.

create extension if not exists "pgcrypto";

create table if not exists cadastros (
  id uuid primary key default gen_random_uuid(),
  inscricao text unique,

  -- S1 — Identificação do Imóvel
  municipio text not null,
  distrito text,
  setor text,
  quadra text,
  lote text,
  sequencial text,
  logradouro text,
  numero text,
  complemento text,
  cep text,
  data_cadastro date,
  agente_campo text,
  coordenador text,

  -- S2 — Responsável Familiar
  nome_completo text,
  cpf text,
  rg text,
  orgao_emissor text,
  data_nascimento date,
  nacionalidade text,
  sexo text,
  estado_civil text,
  naturalidade text,
  uf_nascimento text,
  filiacao_mae text,
  filiacao_pai text,
  bairro text,
  telefone text,
  email text,

  -- S3 — Composição Familiar
  total_moradores int,
  criancas_0_6 int,
  criancas_7_14 int,
  adolescentes_15_17 int,
  adultos_18_59 int,
  idosos_60 int,
  pcd int,
  gestante boolean,
  lactante boolean,

  -- S4 — Dados Socioeconômicos
  renda_total numeric,
  pessoas_renda int,
  bolsa_familia boolean,
  bpc boolean,
  outras_transferencias text,
  escolaridade text,
  situacao_emprego text,
  profissao text,

  -- S5 — Situação Ocupacional
  tempo_ocupacao text,
  forma_aquisicao text,
  possui_contrato boolean,
  tipo_contrato text,
  paga_aluguel boolean,
  valor_aluguel numeric,
  conflito_fundiario boolean,
  descricao_conflito text,

  -- S6 — Características Físicas
  area_lote numeric,
  area_construida numeric,
  pavimentos text,
  material_paredes text,
  material_cobertura text,
  material_piso text,
  estado_conservacao text,
  tipo_uso text,
  descricao_uso_misto text,

  -- S7 — Infraestrutura Urbana
  agua text,
  esgoto text,
  energia text,
  coleta_lixo text,
  pavimentacao text,
  iluminacao_publica boolean,
  drenagem_pluvial boolean,
  acesso_transporte boolean,

  -- S8 — Vulnerabilidade Social
  area_risco boolean,
  tipo_risco text,
  proximo_curso_dagua boolean,
  proximo_area_preservacao boolean,
  condicao_habitacional text,
  necessita_reassentamento boolean,

  -- S9 — Documentos
  possui_rg boolean,
  possui_cpf boolean,
  certidao_nascimento boolean,
  certidao_casamento boolean,
  comprovante_residencia boolean,
  iptu boolean,
  contrato_compra boolean,
  declaracao_posse boolean,
  planta_imovel boolean,
  outros_documentos text,

  -- S10 — Declarações LGPD
  aceite_lgpd boolean,
  data_aceite date,
  responsavel_coleta text,
  observacoes_lgpd text,

  -- Anexos (Supabase Storage — bucket "anexos")
  anexos jsonb default '[]'::jsonb,

  -- Controle / workflow
  classificacao text default 'REURB-S',
  status text default 'Pendente',
  prioridade text default 'Média',

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_cadastros_municipio on cadastros(municipio);
create index if not exists idx_cadastros_status on cadastros(status);
create index if not exists idx_cadastros_nome on cadastros(nome_completo);
create index if not exists idx_cadastros_cpf on cadastros(cpf);

-- Sequência de inscrição por município (03 = código do Lote 3/SE, ajuste se necessário)
create table if not exists inscricao_seq (
  municipio text primary key,
  ultimo int not null default 0
);

create or replace function proxima_inscricao(p_municipio text)
returns text as $$
declare
  novo int;
begin
  insert into inscricao_seq (municipio, ultimo)
  values (p_municipio, 1)
  on conflict (municipio) do update set ultimo = inscricao_seq.ultimo + 1
  returning ultimo into novo;
  return novo::text;
end;
$$ language plpgsql;

-- Row Level Security: desabilitado aqui pois o acesso é controlado pela aplicação
-- (senha de acesso + service role key no backend). Ajuste conforme sua necessidade.
alter table cadastros enable row level security;
create policy "service role only" on cadastros for all using (true) with check (true);
