begin;

alter table public.profiles
  add column if not exists full_name text not null default '',
  add column if not exists email text not null default '',
  add column if not exists phone text not null default '',
  add column if not exists address text not null default '',
  add column if not exists city text not null default '',
  add column if not exists pincode text not null default '',
  add column if not exists role text not null default 'customer'
    check (role in ('customer', 'staff', 'admin')),
  add column if not exists active boolean not null default true,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.profiles as profile
set email = coalesce(auth_user.email, '')
from auth.users as auth_user
where auth_user.id = profile.id
  and profile.email = '';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product', 'product', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read product image files" on storage.objects;
create policy "Public read product image files" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product');

drop policy if exists "Admins upload product image files" on storage.objects;
create policy "Admins upload product image files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product' and (select public.has_admin_role()));

drop policy if exists "Admins update product image files" on storage.objects;
create policy "Admins update product image files" on storage.objects
  for update to authenticated
  using (bucket_id = 'product' and (select public.has_admin_role()))
  with check (bucket_id = 'product' and (select public.has_admin_role()));

drop policy if exists "Admins delete product image files" on storage.objects;
create policy "Admins delete product image files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product' and (select public.has_admin_role()));

notify pgrst, 'reload schema';

commit;
