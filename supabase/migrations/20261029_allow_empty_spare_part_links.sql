begin;

create or replace function public.set_product_spare_parts(
  p_product_id uuid,
  p_spare_part_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not (select public.has_admin_role()) then
    raise exception 'Administrator access is required to manage product spare parts.';
  end if;

  if not exists (select 1 from public.products where id = p_product_id) then
    raise exception 'The product does not exist.';
  end if;

  if cardinality(coalesce(p_spare_part_ids, '{}'::uuid[])) > 0
    and exists (
      select 1 from public.products
      where id = p_product_id and product_type = 'Spare Parts'
    ) then
    raise exception 'Spare Parts products cannot have linked spare parts.';
  end if;

  if p_product_id = any(coalesce(p_spare_part_ids, '{}'::uuid[])) then
    raise exception 'A product cannot be its own spare part.';
  end if;

  if exists (
    select 1
    from unnest(coalesce(p_spare_part_ids, '{}'::uuid[])) as selected(spare_part_id)
    left join public.products as spare_part on spare_part.id = selected.spare_part_id
    where spare_part.id is null or spare_part.product_type <> 'Spare Parts'
  ) then
    raise exception 'Every linked item must be an existing Spare Parts product.';
  end if;

  if exists (
    select 1
    from unnest(coalesce(p_spare_part_ids, '{}'::uuid[])) as selected(spare_part_id)
    group by selected.spare_part_id
    having count(*) > 1
  ) then
    raise exception 'A spare part cannot be linked more than once.';
  end if;

  delete from public.product_spare_parts where product_id = p_product_id;
  insert into public.product_spare_parts (product_id, spare_part_id, display_order)
  select p_product_id, selected.spare_part_id, selected.ordinality::integer - 1
  from unnest(coalesce(p_spare_part_ids, '{}'::uuid[]))
    with ordinality as selected(spare_part_id, ordinality);
end;
$$;

notify pgrst, 'reload schema';

commit;
