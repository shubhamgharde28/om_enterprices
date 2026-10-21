begin;

update public.website_content
set
  phone = '09724916029',
  address = 'Near Khamtalav Chowk, Shitla Mata Mandir Road, Bhandara H O, Bhandara-441904, Maharashtra',
  updated_at = now();

insert into public.website_content (phone, address)
select
  '09724916029',
  'Near Khamtalav Chowk, Shitla Mata Mandir Road, Bhandara H O, Bhandara-441904, Maharashtra'
where not exists (select 1 from public.website_content);

commit;
