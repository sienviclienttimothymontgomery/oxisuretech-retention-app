-- Create analytics_events table
create table public.analytics_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade, -- Nullable for anonymous visitors
  event_name text not null, -- 'install', 'activation', 'reorder_click', 'page_visit', etc.
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  referrer text,
  device_info jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.analytics_events enable row level security;

-- Policies
create policy "Allow public insert of analytics events."
  on public.analytics_events for insert
  with check (true);

create policy "Allow users to view their own analytics events."
  on public.analytics_events for select
  using (auth.uid() = user_id);

create policy "Allow admins to view all analytics events."
  on public.analytics_events for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );
