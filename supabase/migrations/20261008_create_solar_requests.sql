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

alter table public.solar_requests enable row level security;

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

drop trigger if exists solar_requests_set_updated_at on public.solar_requests;
create trigger solar_requests_set_updated_at before update on public.solar_requests
  for each row execute function public.set_updated_at();

grant select, insert, update, delete on public.solar_requests to authenticated;
grant insert on public.solar_requests to anon, authenticated;
