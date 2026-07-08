-- Run this once in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)

create extension if not exists "pgcrypto";

-- If you already ran an earlier version of this schema with a "tshirt" column,
-- run this line once to migrate it instead of recreating the table:
-- alter table participants rename column tshirt to class_level;

create table if not exists participants (
  id uuid primary key default gen_random_uuid(),
  child_name text not null,
  age int not null,
  age_group text,
  gender text,
  class_level text,
  parent_name text not null,
  phone text not null,
  emergency_name text,
  emergency_phone text,
  allergies text,
  newcomer boolean default false,
  fee numeric default 250,
  payment_method text,
  payment_ref text,
  payment_status text default 'Pending',
  created_at timestamptz default now()
);

create table if not exists volunteers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  areas text[],
  days text[],
  experience text,
  created_at timestamptz default now()
);

-- Row Level Security
alter table participants enable row level security;
alter table volunteers enable row level security;

-- NOTE ON SECURITY:
-- These policies let anyone with your public anon key (i.e. anyone who loads the site)
-- insert, read, update, and delete registrations. That matches the PIN-gated admin
-- dashboard's security level (a front-end gate, not real access control) but it does
-- mean a technically curious visitor could read or wipe the tables directly via the
-- Supabase API. That's an acceptable tradeoff for a small internal church registration
-- tool, but if you want real protection later, switch to Supabase Auth for the admin
-- role and restrict update/delete/select to authenticated admins only — ask Claude to
-- help wire that up when you're ready.

create policy "Public can insert participants" on participants
  for insert to anon with check (true);
create policy "Public can read participants" on participants
  for select to anon using (true);
create policy "Public can update participants" on participants
  for update to anon using (true);
create policy "Public can delete participants" on participants
  for delete to anon using (true);

create policy "Public can insert volunteers" on volunteers
  for insert to anon with check (true);
create policy "Public can read volunteers" on volunteers
  for select to anon using (true);
create policy "Public can delete volunteers" on volunteers
  for delete to anon using (true);
