-- Nhandu — tabela dos briefings do site (rodar uma vez no Supabase: SQL Editor > New query > colar > Run).
--
-- Cada linha é um briefing enviado por /briefing/<nicho>.
-- RLS ligado e nenhuma política: a chave pública não lê nem grava nada.
-- Só o site (rota /api/briefing, no servidor, com a chave secreta) grava.
-- Para ver as respostas: Table Editor > briefings.
-- LGPD: se a cliente pedir para apagar, apague a linha dela aqui.

create table if not exists briefings (
  id           bigint generated always as identity primary key,
  nicho        text        not null,
  nome         text        not null,
  whatsapp     text        not null,
  blocos       jsonb       not null,  -- perguntas e respostas, na ordem do formulário
  origem       text,
  consentimento_em timestamptz not null,  -- quando ela marcou a autorização (LGPD: prova do consentimento)
  status       text        not null default 'novo' check (status in ('novo', 'em_andamento', 'concluido')),
  recebido_em  timestamptz not null default now()
);
create index if not exists briefings_recentes on briefings (recebido_em desc);

alter table briefings enable row level security;
-- Segunda trava: a chave pública não tem permissão nenhuma, mesmo se alguém desligar o RLS.
revoke all on briefings from anon, authenticated;
grant insert, select on briefings to service_role;
