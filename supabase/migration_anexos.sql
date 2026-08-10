-- Rode este script no SQL Editor do Supabase se você já criou o banco
-- ANTES desta atualização (adiciona a coluna de anexos, sem apagar dados existentes).

alter table cadastros add column if not exists anexos jsonb default '[]'::jsonb;
