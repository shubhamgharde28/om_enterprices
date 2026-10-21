drop policy if exists "Anyone can submit product enquiries" on public.product_enquiries;
create policy "Anyone can submit product enquiries" on public.product_enquiries
  for insert to anon, authenticated
  with check (user_id is null and status = 'New');
