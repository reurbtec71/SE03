# SE03 — Cadastro REURB (Lote 3/Sergipe)

Sistema de cadastro habitacional para o **Lote 3/Sergipe** (OS nº 03/2026, SEASIC/SE —
Pinhão, Macambira, Itabaiana, Moita Bonita e Carira), modelado a partir do sistema
REURBTEC "Mutirão São Judas Tadeu" usado em Jequié/BA.

Cadastro (formulário em 10 seções) + banco de dados (Supabase/Postgres) + painel do
coordenador com listagem, filtros, status/prioridade, exportação CSV e dashboard.

## 1. Criar o banco no Supabase

1. Crie um projeto em [supabase.com](https://supabase.com) (plano gratuito serve).
2. Vá em **SQL Editor** e rode o conteúdo de `supabase/schema.sql`.
   - Se você já tinha criado o banco **antes** desta atualização (sem a coluna de
     anexos), rode também `supabase/migration_anexos.sql`.
3. Em **Project Settings → API**, copie:
   - `Project URL` → variável `SUPABASE_URL`
   - a chave **secreta/privilegiada** (hoje chamada "Secret key", antigo
     `service_role`; não use a "Publishable key") → variável `SUPABASE_SERVICE_ROLE_KEY`
4. O bucket de armazenamento `anexos` (para os documentos anexados na S10) é
   criado automaticamente no primeiro upload — não precisa criar manualmente.

## 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
ACCESS_PASSWORD_AGENTE=senha-das-cadastradoras       # só acessa a tela de cadastro
ACCESS_PASSWORD_COORDENADOR=senha-do-coordenador     # acesso completo (painel + dashboard)
SESSION_SECRET=string-aleatoria-longa
```

## 3. Rodar localmente

```bash
npm install
npm run dev
```

Acesse http://localhost:3000 — a senha que você digitar decide o que aparece:
`ACCESS_PASSWORD_AGENTE` leva direto à tela de cadastro (S1 a S10, sem painel);
`ACCESS_PASSWORD_COORDENADOR` dá acesso completo (painel, dashboard, exportações, edição).

## 4. Publicar na Vercel

1. Suba este projeto para um repositório no GitHub.
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório.
3. Em **Environment Variables**, adicione as mesmas 4 variáveis do `.env.local`.
4. Deploy.

## Estrutura do formulário

- **S1** — Identificação do Imóvel (município, distrito/setor/quadra/lote/sequencial, endereço)
- **S2** — Responsável Familiar (dados pessoais, filiação, contato)
- **S3** — Composição Familiar (faixas etárias, gestante/lactante)
- **S4** — Dados Socioeconômicos (renda, Bolsa Família, BPC, escolaridade, emprego)
- **S5** — Situação Ocupacional (tempo de ocupação, forma de aquisição, conflito fundiário)
- **S6** — Características Físicas do imóvel (área, materiais, estado de conservação)
- **S7** — Infraestrutura Urbana (água, esgoto, energia — adaptado para DESO/ENERGISA-SE)
- **S8** — Vulnerabilidade Social (área de risco, condição habitacional, reassentamento)
- **S9** — Documentos (checklist de documentação pessoal do imóvel)
- **S10** — Declarações LGPD (aceite obrigatório, responsável pela coleta)

A inscrição do imóvel é gerada automaticamente concatenando
`distrito.setor.quadra.lote.sequencial`, no mesmo padrão do sistema de Jequié.

## Recursos do painel

- Duas senhas de acesso: a das cadastradoras só abre a tela de cadastro; a do
  coordenador dá acesso completo (painel, dashboard, edição, exclusão, exportações).
- Cadastro em 10 seções, com maiúsculas automáticas nos campos de texto livre
  (nomes, endereços, descrições) e máscara de CPF (`000.000.000-00`).
- Campos de "Agente de Campo", "Coordenador" e "Responsável pela Coleta" usam
  a lista fixa das cadastradoras: Elis, Anésia, Maíra.
- Os campos de identificação cadastral (distrito/setor/quadra/lote/sequencial)
  são opcionais — preencha quando disponíveis.
- Painel do coordenador com busca, filtro por município e por status.
- Dashboard com filtro por município.
- Exportação em CSV (geral ou filtrada por município, botão "↓ CSV").
- Upload de anexos (PDF/JPG/PNG) por cadastro, feito na edição (seção S10),
  armazenado no bucket `anexos` do Supabase Storage.
- Exportação dos anexos em ZIP, com uma pasta por pessoa (nome + inscrição),
  geral ou filtrada por município (botão "↓ Anexos").

## O que NÃO está incluído (por escopo definido)

- Geração de documentos/relatórios (fichas, boletins de medição) — o sistema de origem
  também não fazia isso; ele é só cadastro.
- Cadastro de usuários/agentes por login individual — hoje são duas senhas
  compartilhadas por nível de acesso (agente / coordenador), sem identificar
  qual pessoa específica logou.
