-- Supabase Database Schema & RLS Policies for Bookmarks App
-- Copy and paste this script into your Supabase SQL Editor and run it.

-- 1. Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  handle text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint handle_length check (char_length(handle) >= 3),
  constraint handle_format check (handle ~* '^[a-zA-Z0-9_]+$') -- only alphanumeric and underscores
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- 2. Create bookmarks table
create table if not exists public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  url text not null,
  is_public boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.bookmarks enable row level security;

-- 3. Automatic Profile Trigger on Auth Signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, handle)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'handle', 
      'user_' || substr(new.id::text, 1, 8)
    )
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. RLS Policies for profiles
drop policy if exists "Profiles are public readable" on public.profiles;
create policy "Profiles are public readable" on public.profiles
  for select using (true);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- 5. RLS Policies for bookmarks
drop policy if exists "Users can read own or public bookmarks" on public.bookmarks;
create policy "Users can read own or public bookmarks" on public.bookmarks
  for select using (
    auth.uid() = user_id or is_public = true
  );

drop policy if exists "Users can insert own bookmarks" on public.bookmarks;
create policy "Users can insert own bookmarks" on public.bookmarks
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own bookmarks" on public.bookmarks;
create policy "Users can update own bookmarks" on public.bookmarks
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own bookmarks" on public.bookmarks;
create policy "Users can delete own bookmarks" on public.bookmarks
  for delete using (auth.uid() = user_id);
