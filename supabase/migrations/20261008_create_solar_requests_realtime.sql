do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'solar_requests'
    )
  then
    alter publication supabase_realtime add table public.solar_requests;
  end if;
end;
$$;
