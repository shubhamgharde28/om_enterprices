begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read product image files" on storage.objects;
create policy "Public read product image files" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');

drop policy if exists "Admins upload product image files" on storage.objects;
create policy "Admins upload product image files" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.has_admin_role()));

drop policy if exists "Admins update product image files" on storage.objects;
create policy "Admins update product image files" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and (select public.has_admin_role()))
  with check (bucket_id = 'product-images' and (select public.has_admin_role()));

drop policy if exists "Admins delete product image files" on storage.objects;
create policy "Admins delete product image files" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and (select public.has_admin_role()));

commit;
