begin;

update public.website_content
set
  hours = 'Mon - Sun: 9:00 AM - 7:00 PM',
  updated_at = now();

commit;
