create extension if not exists pgcrypto;

create sequence if not exists public.booking_number_seq;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  address text not null default '',
  city text not null default '',
  pincode text not null default '',
  role text not null default 'customer' check (role in ('customer', 'staff', 'admin')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

update public.profiles as profile
set email = auth_user.email
from auth.users as auth_user
where auth_user.id = profile.id
  and profile.email = '';

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_profile_for_new_user();
drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.create_profile_for_new_user();

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  image_url text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid references public.categories(id) on delete set null,
  product_type text not null check (product_type in ('Domestic', 'Commercial', 'Accessories', 'Spare Parts')),
  short_description text not null default '',
  description text not null default '',
  image_url text not null default '',
  price numeric(12, 2) not null default 0 check (price >= 0),
  original_price numeric(12, 2) check (original_price is null or original_price >= 0),
  discount_percentage numeric(5, 2) not null default 0 check (discount_percentage between 0 and 100),
  stock integer not null default 0 check (stock >= 0),
  capacity text not null default '',
  purification_technology text not null default '',
  purifier_details jsonb not null default '{}'::jsonb,
  suitable_for text not null default '',
  warranty text not null default '',
  installation_available boolean not null default false,
  featured boolean not null default false,
  rating numeric(2, 1) not null default 0 check (rating between 0 and 5),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products
  add column if not exists image_url text not null default '',
  add column if not exists purifier_details jsonb not null default '{}'::jsonb,
  add column if not exists rating numeric(2, 1) not null default 0
    check (rating between 0 and 5);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text not null default '',
  display_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.product_spare_parts (
  product_id uuid not null references public.products(id) on delete cascade,
  spare_part_id uuid not null references public.products(id) on delete cascade,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (product_id, spare_part_id),
  check (product_id <> spare_part_id)
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  short_description text not null default '',
  price numeric(12, 2) not null default 0 check (price >= 0),
  estimated_duration text not null default '',
  service_type text not null default 'Service',
  image_url text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.technicians (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null default '',
  email text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_bookings (
  id uuid primary key default gen_random_uuid(),
  booking_number text not null unique default (
    'OE-' || lpad(nextval('public.booking_number_seq')::text, 6, '0')
  ),
  user_id uuid not null references public.profiles(id) on delete cascade,
  customer_name text not null,
  phone text not null,
  email text not null,
  service_id uuid references public.services(id) on delete set null,
  service_name text not null default '',
  product_type text not null default '',
  address text not null,
  city text not null,
  pincode text not null,
  preferred_date date not null,
  preferred_time text not null,
  scheduled_date date,
  scheduled_time text,
  problem_description text not null default '',
  image_url text,
  status text not null default 'Pending'
    check (status in ('Pending', 'Confirmed', 'Assigned', 'In Progress', 'Completed', 'Cancelled', 'Rejected')),
  assigned_to uuid references public.technicians(id) on delete set null,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.service_bookings
  add column if not exists service_name text not null default '';
alter table public.service_bookings
  add column if not exists scheduled_date date;
alter table public.service_bookings
  add column if not exists scheduled_time text;

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  rating numeric(2, 1) not null check (rating between 1 and 5 and rating * 2 = trunc(rating * 2)),
  review text not null,
  image_url text not null default '',
  active boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.website_content (
  id uuid primary key default gen_random_uuid(),
  hero_title text not null default 'Pure Water. Better Living.',
  hero_subtitle text not null default '',
  hero_image text not null default '',
  about_heading text not null default '',
  about_description text not null default '',
  about_image text not null default '',
  phone text not null default '',
  email text not null default '',
  address text not null default '',
  hours text not null default '',
  is_public boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null default '',
  email text not null,
  message text not null,
  status text not null default 'New' check (status in ('New', 'Read', 'Replied', 'Archived')),
  created_at timestamptz not null default now()
);

alter table public.contact_messages
  add column if not exists phone text not null default '';

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

create table if not exists public.solar_requests (
  id uuid primary key default gen_random_uuid(),
  request_type text not null check (request_type in ('consultation', 'installation', 'servicing', 'inspection', 'contact')),
  full_name text not null,
  phone text not null,
  email text not null,
  address text not null default '',
  city text not null default '',
  pincode text not null default '',
  property_type text not null default '',
  service_required text not null,
  monthly_electricity_bill numeric(12, 2) check (monthly_electricity_bill is null or monthly_electricity_bill >= 0),
  preferred_date date,
  preferred_time text not null default '',
  has_existing_solar text not null default '',
  requirements text not null default '',
  status text not null default 'Pending'
    check (status in ('Pending', 'Confirmed', 'Completed', 'Cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
    and not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'contact_messages'
    )
  then
    alter publication supabase_realtime add table public.contact_messages;
  end if;
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

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists product_images_product_order_idx on public.product_images(product_id, display_order);
create index if not exists product_spare_parts_spare_part_id_idx on public.product_spare_parts(spare_part_id);
create index if not exists service_bookings_user_created_idx on public.service_bookings(user_id, created_at desc);
create index if not exists service_bookings_status_idx on public.service_bookings(status);
create index if not exists service_bookings_service_id_idx on public.service_bookings(service_id);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();
drop trigger if exists services_set_updated_at on public.services;
create trigger services_set_updated_at before update on public.services
  for each row execute function public.set_updated_at();
drop trigger if exists technicians_set_updated_at on public.technicians;
create trigger technicians_set_updated_at before update on public.technicians
  for each row execute function public.set_updated_at();
drop trigger if exists service_bookings_set_updated_at on public.service_bookings;
create trigger service_bookings_set_updated_at before update on public.service_bookings
  for each row execute function public.set_updated_at();
drop trigger if exists testimonials_set_updated_at on public.testimonials;
create trigger testimonials_set_updated_at before update on public.testimonials
  for each row execute function public.set_updated_at();
drop trigger if exists website_content_set_updated_at on public.website_content;
create trigger website_content_set_updated_at before update on public.website_content
  for each row execute function public.set_updated_at();
drop trigger if exists solar_requests_set_updated_at on public.solar_requests;
create trigger solar_requests_set_updated_at before update on public.solar_requests
  for each row execute function public.set_updated_at();

create or replace function public.has_admin_role()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role in ('admin', 'staff')
      and active = true
  );
$$;

grant execute on function public.has_admin_role() to anon, authenticated;

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

revoke all on function public.set_product_spare_parts(uuid, uuid[]) from public, anon;
grant execute on function public.set_product_spare_parts(uuid, uuid[]) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product', 'product', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_spare_parts enable row level security;
alter table public.services enable row level security;
alter table public.technicians enable row level security;
alter table public.service_bookings enable row level security;
alter table public.testimonials enable row level security;
alter table public.website_content enable row level security;
alter table public.contact_messages enable row level security;
alter table public.product_enquiries enable row level security;
alter table public.solar_requests enable row level security;

drop policy if exists "Profiles readable by owner or admin" on public.profiles;
create policy "Profiles readable by owner or admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select public.has_admin_role()));
drop policy if exists "Customers update own profile" on public.profiles;
create policy "Customers update own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and role = 'customer');
drop policy if exists "Customers insert own profile" on public.profiles;
create policy "Customers insert own profile" on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()) and role = 'customer' and active = true);
drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles" on public.profiles
  for all to authenticated
  using ((select public.has_admin_role()))
  with check ((select public.has_admin_role()));

drop policy if exists "Public read active categories" on public.categories;
create policy "Public read active categories" on public.categories
  for select to anon, authenticated using (active = true);
drop policy if exists "Admins manage categories" on public.categories;
create policy "Admins manage categories" on public.categories
  for all to authenticated using ((select public.has_admin_role()))
  with check ((select public.has_admin_role()));

drop policy if exists "Public read active products" on public.products;
create policy "Public read active products" on public.products
  for select to anon, authenticated using (active = true);
drop policy if exists "Admins manage products" on public.products;
create policy "Admins manage products" on public.products
  for all to authenticated using ((select public.has_admin_role()))
  with check ((select public.has_admin_role()));

drop policy if exists "Public read images of active products" on public.product_images;
create policy "Public read images of active products" on public.product_images
  for select to anon, authenticated
  using (exists (
    select 1 from public.products
    where products.id = product_images.product_id and products.active = true
  ));
drop policy if exists "Admins manage product images" on public.product_images;
create policy "Admins manage product images" on public.product_images
  for all to authenticated using ((select public.has_admin_role()))
  with check ((select public.has_admin_role()));

drop policy if exists "Public read spare parts of active products" on public.product_spare_parts;
create policy "Public read spare parts of active products" on public.product_spare_parts
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.products as product
      where product.id = product_spare_parts.product_id and product.active = true
    )
    and exists (
      select 1 from public.products as spare_part
      where spare_part.id = product_spare_parts.spare_part_id
        and spare_part.active = true
        and spare_part.product_type = 'Spare Parts'
    )
  );
drop policy if exists "Admins manage product spare parts" on public.product_spare_parts;
create policy "Admins manage product spare parts" on public.product_spare_parts
  for all to authenticated using ((select public.has_admin_role()))
  with check ((select public.has_admin_role()));

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

drop policy if exists "Public read active services" on public.services;
create policy "Public read active services" on public.services
  for select to anon, authenticated using (active = true);
drop policy if exists "Admins manage services" on public.services;
create policy "Admins manage services" on public.services
  for all to authenticated using ((select public.has_admin_role()))
  with check ((select public.has_admin_role()));

drop policy if exists "Admins manage technicians" on public.technicians;
create policy "Admins manage technicians" on public.technicians
  for all to authenticated using ((select public.has_admin_role()))
  with check ((select public.has_admin_role()));

drop policy if exists "Customers read own bookings" on public.service_bookings;
create policy "Customers read own bookings" on public.service_bookings
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.has_admin_role()));
drop policy if exists "Customers create own bookings" on public.service_bookings;
create policy "Customers create own bookings" on public.service_bookings
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'Pending'
    and assigned_to is null
    and admin_notes is null
  );
drop policy if exists "Customers read assigned technician details" on public.technicians;
create policy "Customers read assigned technician details" on public.technicians
  for select to authenticated
  using (
    exists (
      select 1
      from public.service_bookings
      where service_bookings.assigned_to = technicians.id
        and service_bookings.user_id = (select auth.uid())
    )
  );

create or replace function public.get_my_service_bookings()
returns setof jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select
    (to_jsonb(bookings) - 'admin_notes') || jsonb_build_object(
      'technician',
      case
        when technicians.id is null then null
        else jsonb_build_object(
          'id', technicians.id,
          'full_name', technicians.full_name,
          'phone', technicians.phone,
          'email', technicians.email
        )
      end
    )
  from public.service_bookings as bookings
  left join public.technicians as technicians
    on technicians.id = bookings.assigned_to
  where bookings.user_id = (select auth.uid())
  order by bookings.created_at desc;
$$;

revoke all on function public.get_my_service_bookings() from public, anon;
grant execute on function public.get_my_service_bookings() to authenticated;

drop policy if exists "Admins update bookings" on public.service_bookings;
create policy "Admins update bookings" on public.service_bookings
  for update to authenticated using ((select public.has_admin_role()))
  with check ((select public.has_admin_role()));

drop policy if exists "Public read active testimonials" on public.testimonials;
create policy "Public read active testimonials" on public.testimonials
  for select to anon, authenticated using (active = true);
drop policy if exists "Admins manage testimonials" on public.testimonials;
create policy "Admins manage testimonials" on public.testimonials
  for all to authenticated using ((select public.has_admin_role()))
  with check ((select public.has_admin_role()));

drop policy if exists "Public read published website content" on public.website_content;
create policy "Public read published website content" on public.website_content
  for select to anon, authenticated using (is_public = true);
drop policy if exists "Admins manage website content" on public.website_content;
create policy "Admins manage website content" on public.website_content
  for all to authenticated using ((select public.has_admin_role()))
  with check ((select public.has_admin_role()));

drop policy if exists "Anyone can submit contact messages" on public.contact_messages;
create policy "Anyone can submit contact messages" on public.contact_messages
  for insert to anon, authenticated
  with check (
    char_length(btrim(name)) between 1 and 120
    and char_length(btrim(phone)) between 1 and 30
    and char_length(btrim(email)) between 3 and 320
    and char_length(btrim(message)) between 1 and 5000
    and status = 'New'
  );
drop policy if exists "Admins manage contact messages" on public.contact_messages;
create policy "Admins manage contact messages" on public.contact_messages
  for all to authenticated using ((select public.has_admin_role()))
  with check ((select public.has_admin_role()));
drop policy if exists "Anyone can submit product enquiries" on public.product_enquiries;
create policy "Anyone can submit product enquiries" on public.product_enquiries
  for insert to anon, authenticated
  with check (
    user_id is null
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
  for all to authenticated using ((select public.has_admin_role()))
  with check ((select public.has_admin_role()));
drop policy if exists "Anyone can submit solar requests" on public.solar_requests;
create policy "Anyone can submit solar requests" on public.solar_requests
  for insert to anon, authenticated
  with check (
    request_type in ('consultation', 'installation', 'servicing', 'inspection', 'contact')
    and char_length(btrim(full_name)) between 1 and 120
    and char_length(btrim(phone)) between 7 and 30
    and char_length(btrim(email)) between 3 and 320
    and char_length(btrim(service_required)) between 1 and 160
    and char_length(address) <= 500
    and char_length(city) <= 120
    and char_length(pincode) <= 20
    and char_length(requirements) <= 5000
    and (monthly_electricity_bill is null or monthly_electricity_bill >= 0)
    and status = 'Pending'
  );
drop policy if exists "Admins manage solar requests" on public.solar_requests;
create policy "Admins manage solar requests" on public.solar_requests
  for all to authenticated using ((select public.has_admin_role()))
  with check ((select public.has_admin_role()));

grant select on public.categories, public.products, public.product_images,
  public.product_spare_parts, public.services, public.testimonials, public.website_content
  to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.categories,
  public.products, public.product_images, public.product_spare_parts, public.services, public.technicians,
  public.service_bookings, public.testimonials, public.website_content,
  public.contact_messages, public.product_enquiries, public.solar_requests
  to authenticated;
grant insert on public.service_bookings to authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant insert on public.product_enquiries to anon, authenticated;
grant insert on public.solar_requests to anon, authenticated;
grant usage, select on sequence public.booking_number_seq to authenticated;

insert into public.website_content (hero_title, hero_subtitle, phone, email, address, hours)
select
  'Pure Water. Better Living.',
  'Trusted water purifier sales, installation, and maintenance services for homes and businesses.',
  '+91 98765 43210',
  'hello@omenterprises.com',
  '18th Cross, Jayanagar, Bengaluru, Karnataka 560069',
  'Mon - Sun: 9:00 AM - 7:00 PM'
where not exists (select 1 from public.website_content);

notify pgrst, 'reload schema';
