begin;

alter table public.testimonials
  drop constraint if exists testimonials_rating_check,
  alter column rating type numeric(2, 1) using rating::numeric;

alter table public.testimonials
  add constraint testimonials_rating_check
    check (rating between 1 and 5 and rating * 2 = trunc(rating * 2));

delete from public.testimonials;

insert into public.testimonials (
  customer_name,
  rating,
  review,
  active,
  featured,
  created_at
) values
  ('vivek', 5, 'Product quality is too good with fantastic service. 👍', true, true, timestamp '2025-11-19 12:00:00' at time zone 'UTC'),
  ('siddu', 5, 'One of the best Best seller in bhandara', true, true, timestamp '2025-01-28 12:00:00' at time zone 'UTC'),
  ('mol Gabhane', 4.5, 'Very good', true, false, timestamp '2022-09-22 12:00:00' at time zone 'UTC'),
  ('nikhil lonare', 5, 'Fast service 5 out of 5', true, true, timestamp '2025-11-24 12:00:00' at time zone 'UTC'),
  ('Mahesh', 5, 'V good 👍', true, false, timestamp '2025-11-19 12:00:00' at time zone 'UTC'),
  ('rushab kumar gomase', 5, 'Ro Expart', true, true, timestamp '2025-01-28 12:00:00' at time zone 'UTC'),
  ('Pankaj', 5, 'Awsome', true, true, timestamp '2024-05-18 12:00:00' at time zone 'UTC'),
  ('chandrakant walkhe', 5, 'Top service', true, true, timestamp '2022-07-28 12:00:00' at time zone 'UTC'),
  ('Himanshu Rajabhoj', 5, 'Very good performance', true, true, timestamp '2022-07-10 12:00:00' at time zone 'UTC');

commit;
