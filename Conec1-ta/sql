-- =========================================================
-- EXCLUIR CONTA (Conec-ta)
-- Rodar UMA vez no Supabase: menu "SQL Editor" > New query >
-- colar tudo isto > Run.
--
-- O site chama esta função quando a pessoa clica em
-- "Excluir minha conta" nas Configurações. Ela:
--   1. cancela as reservas FUTURAS da pessoa
--      (as que já aconteceram continuam no histórico);
--   2. apaga o usuário do login do Supabase.
-- Só funciona para a própria pessoa logada (auth.uid()).
-- =========================================================

create or replace function public.excluir_minha_conta()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  meu_email text;
begin
  if auth.uid() is null then
    raise exception 'Não autenticado';
  end if;

  select email into meu_email from auth.users where id = auth.uid();

  -- Reservas que ainda não aconteceram
  delete from public.reservations
   where lower(owner_email) = lower(meu_email)
     and date::date >= current_date;

  -- Tira da lista de administradores, se estiver nela
  delete from public.admins
   where lower(email) = lower(meu_email);

  -- Apaga o usuário do login
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.excluir_minha_conta() from public, anon;
grant execute on function public.excluir_minha_conta() to authenticated;
