alter table public.profiles
  add column if not exists order_verified boolean default false;
