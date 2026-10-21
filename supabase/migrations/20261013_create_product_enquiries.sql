create table if not exists public.product_enquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_slug text not null,
  product_type text not null default '',
  product_price numeric(12, 2) not null default 0 check (product_price >= 0),
  product_image_url text not null default '',
  customer_name text not null,
  phone text not null,
  email text not null,
  alternate_phone text not null default '',
  message text not null default '',
  status text not null default 'New' check (status in ('New', 'Read', 'Contacted', 'Closed')),
  created_at timestamptz not null default now()
);

alter table public.product_enquiries enable row level security;

drop policy if exists "Anyone can submit product enquiries" on public.product_enquiries;
create policy "Anyone can submit product enquiries" on public.product_enquiries
  for insert to anon, authenticated
  with check (
    (user_id is null or user_id = (select auth.uid()))
    and char_length(btrim(product_name)) between 1 and 200
    and char_length(btrim(product_slug)) between 1 and 200
    and char_length(btrim(customer_name)) between 1 and 120
    and char_length(btrim(phone)) between 7 and 30
    and char_length(btrim(email)) between 3 and 320
    and (alternate_phone = '' or char_length(btrim(alternate_phone)) between 7 and 30)
    and char_length(message) <= 2000
    and product_price >= 0
    and status = 'New'
  );

drop policy if exists "Admins manage product enquiries" on public.product_enquiries;
create policy "Admins manage product enquiries" on public.product_enquiries
  for all to authenticated
  using ((select public.has_admin_role()))
  with check ((select public.has_admin_role()));

grant select, update, delete on public.product_enquiries to authenticated;
grant insert on public.product_enquiries to anon, authenticated;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'product_enquiries'
    )
  then
    alter publication supabase_realtime add table public.product_enquiries;
  end if;
end;
$$;
