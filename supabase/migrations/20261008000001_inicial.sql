-- Guia do Advento · estrutura inicial
-- Aplicada no Supabase em 4 partes (inicial_1_base … inicial_4_agendador); este arquivo é o equivalente consolidado.
-- Sem DELETE dentro de funções: apagar dados é feito pelo app com RLS.
-- Fuso de referência: America/Sao_Paulo. Dia 1 = 29/11/2026.

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

-- ---------------------------------------------------------------
-- Configuração privada (só o próprio banco lê: sem políticas de RLS)
-- chaves: vapid_publica, vapid_privada, vapid_contato, cron_segredo, app_url, modo_teste
-- ---------------------------------------------------------------
create table public.config_privada (
  chave text primary key,
  valor text not null
);
alter table public.config_privada enable row level security;
revoke all on public.config_privada from anon, authenticated;

create or replace function public.cfg(p_chave text)
returns text language sql stable security definer set search_path = public as $$
  select valor from public.config_privada where chave = p_chave
$$;
revoke execute on function public.cfg(text) from public, anon, authenticated;

create or replace function public.modo_teste()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select valor from public.config_privada where chave = 'modo_teste'), 'false') = 'true'
$$;

create or replace function public.hoje_sp()
returns date language sql stable as $$
  select (now() at time zone 'America/Sao_Paulo')::date
$$;

-- ---------------------------------------------------------------
-- Perfis
-- ---------------------------------------------------------------
create table public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  nome text,
  plano text not null default 'completo' check (plano in ('simples', 'completo')),
  tema text not null default 'sistema' check (tema in ('sistema', 'noite', 'pergaminho')),
  lembrete_hora time not null default '07:00',
  lembrete_ativo boolean not null default true,
  modo text check (modo in ('solo', 'grupo')),
  onboarding_ok boolean not null default false,
  inicio_data date not null default public.hoje_sp(),
  admin boolean not null default false,
  criado_em timestamptz not null default now()
);
alter table public.perfis enable row level security;
create policy "perfil: ler o próprio" on public.perfis for select to authenticated using (id = auth.uid());
create policy "perfil: editar o próprio" on public.perfis for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
-- plano, admin e e-mail não podem ser trocados pelo próprio usuário
revoke update on public.perfis from authenticated;
grant update (nome, tema, lembrete_hora, lembrete_ativo, modo, onboarding_ok) on public.perfis to authenticated;

create or replace function public.criar_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfis (id, email, nome)
  values (new.id, new.email, initcap(split_part(coalesce(new.email, ''), '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger ao_criar_usuario after insert on auth.users
  for each row execute function public.criar_perfil();

-- ---------------------------------------------------------------
-- Progresso diário
-- ---------------------------------------------------------------
create table public.progresso (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  dia int not null check (dia between 1 and 26),
  ouvir_em timestamptz,
  rezar_em timestamptz,
  agir_em timestamptz,
  fechar_em timestamptz,
  completo_no_dia int,           -- dia da jornada em que Ouvir + Rezar + Agir ficaram prontos
  missao text check (missao in ('sim', 'em_parte', 'nao')),
  frase text,
  frase_autor text,
  oracao_seg int not null default 0,
  atualizado_em timestamptz not null default now(),
  primary key (user_id, dia)
);
alter table public.progresso enable row level security;
create policy "progresso: ler o próprio" on public.progresso for select to authenticated using (user_id = auth.uid());
create policy "progresso: criar o próprio" on public.progresso for insert to authenticated with check (user_id = auth.uid());
create policy "progresso: editar o próprio" on public.progresso for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "progresso: apagar o próprio" on public.progresso for delete to authenticated using (user_id = auth.uid());

-- ---------------------------------------------------------------
-- Grupos
-- ---------------------------------------------------------------
create table public.grupos (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(nome) between 1 and 60),
  codigo text not null unique default substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  criado_por uuid references auth.users(id) on delete set null,
  criado_em timestamptz not null default now()
);
create table public.grupo_membros (
  grupo_id uuid not null references public.grupos(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  entrou_em timestamptz not null default now(),
  primary key (grupo_id, user_id)
);
alter table public.grupos enable row level security;
alter table public.grupo_membros enable row level security;
-- leitura e escrita pelas funções abaixo; sair do grupo é um delete direto da própria linha
create policy "membros: sair do próprio grupo" on public.grupo_membros for delete to authenticated using (user_id = auth.uid());

create or replace function public.meu_grupo_id()
returns uuid language sql stable security definer set search_path = public as $$
  select grupo_id from public.grupo_membros where user_id = auth.uid()
$$;

create or replace function public.criar_grupo(p_nome text)
returns text language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_codigo text;
begin
  if auth.uid() is null then raise exception 'sem_sessao'; end if;
  if (select plano from perfis where id = auth.uid()) <> 'completo' then raise exception 'plano_simples'; end if;
  if public.meu_grupo_id() is not null then raise exception 'ja_em_grupo'; end if;
  insert into grupos (nome, criado_por) values (trim(p_nome), auth.uid()) returning id, codigo into v_id, v_codigo;
  insert into grupo_membros (grupo_id, user_id) values (v_id, auth.uid());
  update perfis set modo = 'grupo' where id = auth.uid();
  return v_codigo;
end $$;

create or replace function public.grupo_por_codigo(p_codigo text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('nome', g.nome, 'membros', (select count(*) from grupo_membros m where m.grupo_id = g.id))
  from grupos g where g.codigo = p_codigo
$$;

create or replace function public.entrar_no_grupo(p_codigo text)
returns text language plpgsql security definer set search_path = public as $$
declare v_id uuid; v_atual uuid;
begin
  if auth.uid() is null then raise exception 'sem_sessao'; end if;
  if (select plano from perfis where id = auth.uid()) <> 'completo' then raise exception 'plano_simples'; end if;
  select id into v_id from grupos where codigo = p_codigo;
  if v_id is null then raise exception 'grupo_inexistente'; end if;
  v_atual := public.meu_grupo_id();
  if v_atual = v_id then return 'ja_membro'; end if;
  if v_atual is not null then raise exception 'ja_em_grupo'; end if;
  insert into grupo_membros (grupo_id, user_id) values (v_id, auth.uid());
  update perfis set modo = 'grupo' where id = auth.uid();
  return 'ok';
end $$;


-- Painel do grupo: membros e os dias que cada um completou (nada além disso)
create or replace function public.grupo_painel()
returns jsonb language sql stable security definer set search_path = public as $$
  select case when g.id is null then null else jsonb_build_object(
    'id', g.id, 'nome', g.nome, 'codigo', g.codigo,
    'membros', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', m.user_id,
        'nome', coalesce(p.nome, 'Sem nome'),
        'eu', m.user_id = auth.uid(),
        'completos', coalesce((select jsonb_agg(pr.dia order by pr.dia) from progresso pr
                               where pr.user_id = m.user_id and pr.completo_no_dia is not null), '[]'::jsonb)
      ) order by m.entrou_em)
      from grupo_membros m join perfis p on p.id = m.user_id where m.grupo_id = g.id), '[]'::jsonb)
  ) end
  from (select public.meu_grupo_id() as gid) x left join grupos g on g.id = x.gid
$$;

-- ---------------------------------------------------------------
-- Notificações Web Push
-- ---------------------------------------------------------------
create table public.push_inscricoes (
  endpoint text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  p256dh text not null,
  auth text not null,
  ativa boolean not null default true,
  criado_em timestamptz not null default now()
);
alter table public.push_inscricoes enable row level security;
create policy "push: ler as próprias" on public.push_inscricoes for select to authenticated using (user_id = auth.uid());
create policy "push: apagar as próprias" on public.push_inscricoes for delete to authenticated using (user_id = auth.uid());

create or replace function public.salvar_inscricao(p_endpoint text, p_p256dh text, p_auth text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'sem_sessao'; end if;
  insert into push_inscricoes (endpoint, user_id, p256dh, auth) values (p_endpoint, auth.uid(), p_p256dh, p_auth)
  on conflict (endpoint) do update set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth, ativa = true, criado_em = now();
end $$;

create or replace function public.vapid_publica()
returns text language sql stable security definer set search_path = public as $$
  select valor from public.config_privada where chave = 'vapid_publica'
$$;

create table public.fila_notificacoes (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  tipo text not null,      -- porta | noite | grupo | teste
  data date not null default public.hoje_sp(),
  titulo text not null,
  corpo text not null,
  url text not null default '/',
  criada_em timestamptz not null default now(),
  enviada_em timestamptz
);
create unique index fila_um_por_tipo_dia on public.fila_notificacoes (user_id, tipo, data) where tipo <> 'teste';
alter table public.fila_notificacoes enable row level security;

create or replace function public.disparar_envio()
returns void language plpgsql security definer set search_path = public, extensions as $$
declare v_url text := public.cfg('app_url'); v_segredo text := public.cfg('cron_segredo');
begin
  if v_url is null or v_segredo is null then return; end if;
  perform net.http_post(
    url := v_url || '/api/notificacoes/enviar',
    headers := jsonb_build_object('content-type', 'application/json', 'x-segredo', v_segredo),
    body := '{}'::jsonb
  );
end $$;
revoke execute on function public.disparar_envio() from public, anon, authenticated;

-- Roda a cada 5 minutos (pg_cron). Regras: no máximo 2 por dia, seção 11 do escopo.
create or replace function public.agendar_notificacoes()
returns void language plpgsql security definer set search_path = public as $$
declare
  v_agora timestamp := now() at time zone 'America/Sao_Paulo';
  v_data date := v_agora::date;
  v_hora time := v_agora::time;
  v_dia int := (v_agora::date - date '2026-11-29') + 1;
  v_teste boolean := public.modo_teste();
  v_titulo text; v_corpo text; v_url text := '/';
begin
  -- 1. Porta do dia, no horário escolhido
  if v_dia between 1 and 26 then
    if v_data in (date '2026-11-29', date '2026-12-06', date '2026-12-13', date '2026-12-20') then
      v_titulo := 'Uma vela nova foi acesa';
      v_corpo := case when v_dia = 1 then 'O Advento começou. A porta de hoje está aberta.'
                      else 'A porta de hoje está aberta e a retrospectiva da semana está pronta.' end;
    else
      v_titulo := 'A porta de hoje está aberta';
      v_corpo := 'Dia ' || v_dia || ' de 26. Leva uns 7 minutos.';
    end if;
    v_url := '/dia/' || v_dia;
  elsif v_data = date '2026-12-25' then
    v_titulo := 'Feliz Natal!'; v_corpo := 'Sua retrospectiva da jornada está pronta.'; v_url := '/retrospectiva/final';
  elsif v_teste then
    v_titulo := '[Teste] A porta de hoje está aberta'; v_corpo := 'Este é o lembrete diário, no horário que você escolheu.'; v_url := '/';
  end if;

  if v_titulo is not null then
    insert into fila_notificacoes (user_id, tipo, data, titulo, corpo, url)
    select p.id, 'porta', v_data, v_titulo, v_corpo, v_url
    from perfis p
    where p.lembrete_ativo
      and p.lembrete_hora <= v_hora and p.lembrete_hora > v_hora - interval '2 hours'
      and exists (select 1 from push_inscricoes i where i.user_id = p.id and i.ativa)
      and (select count(*) from fila_notificacoes f where f.user_id = p.id and f.data = v_data and f.tipo <> 'teste') < 2
    on conflict do nothing;
  end if;

  if v_dia between 1 and 26 then
    -- 2. Grupo: só falta você (18h às 22h)
    if v_hora >= time '18:00' and v_hora < time '22:00' then
      insert into fila_notificacoes (user_id, tipo, data, titulo, corpo, url)
      select m.user_id, 'grupo', v_data, 'Só falta você para acender a coroa', 'Todo o seu grupo já rezou hoje.', '/dia/' || v_dia
      from grupo_membros m
      where exists (select 1 from push_inscricoes i where i.user_id = m.user_id and i.ativa)
        and not exists (select 1 from progresso pr where pr.user_id = m.user_id and pr.dia = v_dia and pr.completo_no_dia is not null)
        and (select count(*) from grupo_membros o where o.grupo_id = m.grupo_id) > 1
        and not exists (
          select 1 from grupo_membros o where o.grupo_id = m.grupo_id and o.user_id <> m.user_id
            and not exists (select 1 from progresso pr where pr.user_id = o.user_id and pr.dia = v_dia and pr.completo_no_dia is not null))
        and (select count(*) from fila_notificacoes f where f.user_id = m.user_id and f.data = v_data and f.tipo <> 'teste') < 2
      on conflict do nothing;
    end if;

    -- 3. Noite (20h30): fechar o dia ou sequência em risco
    if v_hora >= time '20:30' and v_hora < time '23:00' then
      insert into fila_notificacoes (user_id, tipo, data, titulo, corpo, url)
      select p.id, 'noite', v_data,
        case when pr.completo_no_dia is not null then 'Como foi a missão de hoje?' else 'Sua sequência está em risco' end,
        case when pr.completo_no_dia is not null then 'Dois toques para fechar o dia.' else 'Ainda dá tempo de abrir a porta de hoje.' end,
        '/dia/' || v_dia
      from perfis p
      left join progresso pr on pr.user_id = p.id and pr.dia = v_dia
      where p.lembrete_ativo
        and exists (select 1 from push_inscricoes i where i.user_id = p.id and i.ativa)
        and (pr.fechar_em is null)
        and not exists (select 1 from fila_notificacoes f where f.user_id = p.id and f.data = v_data and f.tipo = 'grupo')
        and (select count(*) from fila_notificacoes f where f.user_id = p.id and f.data = v_data and f.tipo <> 'teste') < 2
      on conflict do nothing;
    end if;
  end if;

  if exists (select 1 from fila_notificacoes where enviada_em is null and criada_em > now() - interval '1 hour') then
    perform public.disparar_envio();
  end if;
end $$;
revoke execute on function public.agendar_notificacoes() from public, anon, authenticated;

-- Botão "enviar notificação de teste"
create or replace function public.pedir_push_teste()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'sem_sessao'; end if;
  if not exists (select 1 from push_inscricoes where user_id = auth.uid() and ativa) then return false; end if;
  insert into fila_notificacoes (user_id, tipo, titulo, corpo, url)
  values (auth.uid(), 'teste', 'Notificação de teste', 'Se você está lendo isto, os lembretes vão chegar.', '/voce');
  perform public.disparar_envio();
  return true;
end $$;

-- Chamado pelo servidor do app (com o segredo) para pegar o que precisa ser enviado
create or replace function public.coletar_envios(p_segredo text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare v_envios jsonb;
begin
  if p_segredo is null or p_segredo <> public.cfg('cron_segredo') then raise exception 'segredo_invalido'; end if;
  with pendentes as (
    update fila_notificacoes set enviada_em = now()
    where enviada_em is null and criada_em > now() - interval '1 hour'
    returning user_id, titulo, corpo, url, tipo
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'endpoint', i.endpoint, 'p256dh', i.p256dh, 'auth', i.auth,
    'titulo', pe.titulo, 'corpo', pe.corpo, 'url', pe.url, 'tipo', pe.tipo)), '[]'::jsonb)
  into v_envios
  from pendentes pe join push_inscricoes i on i.user_id = pe.user_id and i.ativa;
  return jsonb_build_object(
    'vapid_publica', public.cfg('vapid_publica'),
    'vapid_privada', public.cfg('vapid_privada'),
    'vapid_contato', coalesce(public.cfg('vapid_contato'), 'mailto:contato@guiadoadvento.app'),
    'envios', v_envios);
end $$;

create or replace function public.desativar_inscricoes(p_segredo text, p_endpoints text[])
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_segredo is null or p_segredo <> public.cfg('cron_segredo') then raise exception 'segredo_invalido'; end if;
  update push_inscricoes set ativa = false where endpoint = any(p_endpoints);
end $$;

-- ---------------------------------------------------------------
-- Eventos (métricas)
-- ---------------------------------------------------------------
create table public.eventos (
  id bigserial primary key,
  user_id uuid default auth.uid() references auth.users(id) on delete set null,
  tipo text not null,
  dados jsonb not null default '{}'::jsonb,
  criado_em timestamptz not null default now()
);
alter table public.eventos enable row level security;
create policy "eventos: registrar os próprios" on public.eventos for insert to authenticated with check (user_id = auth.uid());
create index eventos_tipo on public.eventos (tipo);

create or replace function public.registrar_evento_anonimo(p_tipo text, p_dados jsonb)
returns void language sql security definer set search_path = public as $$
  insert into eventos (user_id, tipo, dados)
  select null, p_tipo, coalesce(p_dados, '{}'::jsonb)
  where p_tipo in ('convite_aberto', 'indicacao_clique')
$$;

-- ---------------------------------------------------------------
-- Ferramentas de teste (só funcionam com modo_teste = true)
-- ---------------------------------------------------------------
create or replace function public.teste_trocar_plano(p_plano text)
returns void language plpgsql security definer set search_path = public as $$
declare v_antes text;
begin
  if not public.modo_teste() then raise exception 'modo_teste_desligado'; end if;
  select plano into v_antes from perfis where id = auth.uid();
  update perfis set plano = p_plano where id = auth.uid();
  if v_antes = 'simples' and p_plano = 'completo' then
    insert into eventos (user_id, tipo) values (auth.uid(), 'upgrade');
  end if;
end $$;


-- ---------------------------------------------------------------
-- Painel do Rafa
-- ---------------------------------------------------------------
create or replace function public.painel_metricas()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare v jsonb;
begin
  if not (public.modo_teste() or coalesce((select admin from perfis where id = auth.uid()), false)) then
    raise exception 'sem_permissao';
  end if;
  with completos as (
    select user_id, count(*) filter (where completo_no_dia is not null) as dias,
           count(*) filter (where completo_no_dia is not null and dia <= 7) as semana1
    from progresso group by user_id
  )
  select jsonb_build_object(
    'usuarios', (select count(*) from perfis),
    'simples', (select count(*) from perfis where plano = 'simples'),
    'completo', (select count(*) from perfis where plano = 'completo'),
    'jornada_completa', (select count(*) from completos where dias = 26),
    'semana1_completa', (select count(*) from completos where semana1 = 7),
    'ativos', (select count(*) from completos where dias > 0),
    'notificacoes_ativas', (select count(distinct user_id) from push_inscricoes where ativa),
    'instalaram', (select count(distinct user_id) from eventos where tipo = 'instalou'),
    'upgrades', (select count(distinct user_id) from eventos where tipo = 'upgrade'),
    'compartilharam', (select count(distinct user_id) from eventos where tipo = 'compartilhou'),
    'cliques_indicacao', (select count(*) from eventos where tipo = 'indicacao_clique'),
    'grupos', (select count(*) from grupos g where exists (select 1 from grupo_membros m where m.grupo_id = g.id)),
    'completo_em_grupo', (select count(*) from grupo_membros m join perfis p on p.id = m.user_id where p.plano = 'completo'),
    'por_dia', (select coalesce(jsonb_agg(jsonb_build_object('dia', d, 'pessoas',
                  (select count(*) from progresso pr where pr.dia = d and pr.completo_no_dia is not null)) order by d), '[]'::jsonb)
                from generate_series(1, 26) d)
  ) into v;
  return v;
end $$;

-- ---------------------------------------------------------------
-- Agendamento
-- ---------------------------------------------------------------
select cron.schedule('guia-notificacoes', '*/5 * * * *', $$select public.agendar_notificacoes()$$);
