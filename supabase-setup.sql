-- Run this in your Supabase project SQL editor (Dashboard → SQL Editor → New query)

-- Generations table: stores every content generation run
create table if not exists public.generations (
  id           uuid primary key default gen_random_uuid(),
  user_id      text not null,           -- Clerk user ID
  event_name   text not null,
  brand_name   text not null,
  event_type   text,
  location     text,
  date         text,
  key_highlights text,
  instagram_type text default 'post',
  content      jsonb not null,          -- full GeneratedContent object
  asset_count  integer default 0,
  created_at   timestamptz default now()
);

-- Brand kits table: one per user, stores brand identity for auto-fill
create table if not exists public.brand_kits (
  id                    uuid primary key default gen_random_uuid(),
  user_id               text not null unique,  -- one kit per user
  brand_name            text default '',
  industry              text default '',
  tone                  text default 'professional',
  target_audience       text default '',
  brand_voice           text default '',
  past_content_examples text default '',
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- Row Level Security: users only see their own data
alter table public.generations  enable row level security;
alter table public.brand_kits   enable row level security;

-- RLS policies using Clerk user ID stored in JWT
create policy "Users can read own generations"
  on public.generations for select
  using (user_id = requesting_user_id());

create policy "Users can insert own generations"
  on public.generations for insert
  with check (user_id = requesting_user_id());

create policy "Users can delete own generations"
  on public.generations for delete
  using (user_id = requesting_user_id());

create policy "Users can read own brand kit"
  on public.brand_kits for select
  using (user_id = requesting_user_id());

create policy "Users can upsert own brand kit"
  on public.brand_kits for all
  using (user_id = requesting_user_id())
  with check (user_id = requesting_user_id());

-- Helper function to extract Clerk user ID from JWT
create or replace function requesting_user_id() returns text as $$
  select nullif(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ language sql stable;

-- Index for fast user lookups
create index if not exists idx_generations_user_id on public.generations(user_id, created_at desc);

-- NOTE: Since we use service role key server-side, RLS is bypassed for API routes.
-- The user_id filtering is enforced in our API code instead.
