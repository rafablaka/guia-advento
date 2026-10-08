-- Reforço sugerido pelo verificador de segurança do Supabase:
-- funções que exigem login deixam de ser chamáveis por visitantes anônimos.
alter function public.hoje_sp() set search_path = public;
revoke execute on function public.criar_perfil() from public, anon, authenticated;
revoke execute on function public.criar_grupo(text) from public, anon;
revoke execute on function public.entrar_no_grupo(text) from public, anon;
revoke execute on function public.grupo_painel() from public, anon;
revoke execute on function public.meu_grupo_id() from public, anon;
revoke execute on function public.painel_metricas() from public, anon;
revoke execute on function public.pedir_push_teste() from public, anon;
revoke execute on function public.salvar_inscricao(text, text, text) from public, anon;
revoke execute on function public.teste_trocar_plano(text) from public, anon;
grant execute on function public.criar_grupo(text), public.entrar_no_grupo(text), public.grupo_painel(), public.meu_grupo_id(),
  public.painel_metricas(), public.pedir_push_teste(), public.salvar_inscricao(text, text, text), public.teste_trocar_plano(text) to authenticated;
alter table public.perfis add constraint plano_valido_teste check (plano in ('simples', 'completo'));
