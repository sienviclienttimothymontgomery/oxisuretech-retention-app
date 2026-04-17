create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  auth_provider text,
  path_type text check (path_type in ('app', 'web')),
  user_type text check (user_type in ('self', 'caregiver')),
  product_sku text,
  quantity integer default 1,
  onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Users can view own profile."
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

create policy "Users can insert own profile."
  on profiles for insert
  with check ( auth.uid() = id );

-- Optional: auto-insert profile on auth.users creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, auth_provider)
  values (new.id, new.email, new.raw_app_meta_data->>'provider');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
