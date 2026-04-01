-- ─────────────────────────────────────────────────────────────────────────────
-- ResumeFlow — Initial Schema
-- Ejecutar en Supabase SQL Editor o via `supabase db push`
-- ─────────────────────────────────────────────────────────────────────────────

-- Extensiones necesarias
create extension if not exists "uuid-ossp";

-- ─── profiles ────────────────────────────────────────────────────────────────
-- Una fila por usuario. Se crea automáticamente al registrarse (trigger).

create table if not exists profiles (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  first_name   text,
  last_name    text,
  headline     text,
  email        text,
  phone        text,
  city         text,
  country      text,
  linkedin_url text,
  portfolio_url text,
  photo_url    text,
  summary      text check (char_length(summary) <= 400),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Trigger para crear perfil vacío al registrar usuario
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (user_id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Trigger para updated_at automático
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute procedure set_updated_at();

-- ─── experiences ─────────────────────────────────────────────────────────────

create table if not exists experiences (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  company     text not null,
  role        text not null,
  start_date  date,
  end_date    date,
  is_current  boolean not null default false,
  description text,
  order_index integer not null default 0
);

create index if not exists experiences_user_id_idx on experiences(user_id);

-- ─── educations ──────────────────────────────────────────────────────────────

create table if not exists educations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  institution text not null,
  degree      text not null,
  start_year  integer,
  end_year    integer,
  order_index integer not null default 0
);

create index if not exists educations_user_id_idx on educations(user_id);

-- ─── skills ──────────────────────────────────────────────────────────────────

create table if not exists skills (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  level       text check (level in ('basic', 'intermediate', 'advanced')),
  order_index integer not null default 0
);

create index if not exists skills_user_id_idx on skills(user_id);

-- ─── languages ───────────────────────────────────────────────────────────────

create table if not exists languages (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references auth.users(id) on delete cascade,
  language text not null,
  level    text check (level in ('A1', 'A2', 'B1', 'B2', 'C1', 'C2'))
);

create index if not exists languages_user_id_idx on languages(user_id);

-- ─── certifications ──────────────────────────────────────────────────────────

create table if not exists certifications (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name    text not null,
  issuer  text,
  year    integer
);

create index if not exists certifications_user_id_idx on certifications(user_id);

-- ─── projects ────────────────────────────────────────────────────────────────

create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  description text,
  url         text
);

create index if not exists projects_user_id_idx on projects(user_id);

-- ─── templates ───────────────────────────────────────────────────────────────

create table if not exists templates (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  thumbnail_url text,
  category      text not null check (category in ('modern', 'classic', 'creative', 'minimalist')),
  is_premium    boolean not null default false,
  price_usd     numeric(5, 2) not null default 0,
  is_active     boolean not null default true
);

-- Seed: plantillas iniciales
insert into templates (name, category, is_premium, price_usd) values
  ('Clean Basic',    'minimalist', false, 0),
  ('Simple Classic', 'classic',    false, 0),
  ('Modern Blue',    'modern',     true,  3),
  ('Executive Dark', 'classic',    true,  3)
on conflict do nothing;

-- ─── user_template_access ────────────────────────────────────────────────────

create table if not exists user_template_access (
  user_id          uuid not null references auth.users(id) on delete cascade,
  template_id      uuid not null references templates(id) on delete cascade,
  purchased_at     timestamptz not null default now(),
  payment_provider text not null check (payment_provider in ('stripe', 'mercadopago')),
  payment_id       text not null,
  primary key (user_id, template_id)
);

-- ─── subscriptions (Phase 2) ─────────────────────────────────────────────────

create table if not exists subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references auth.users(id) on delete cascade,
  status                   text not null check (status in ('active', 'canceled', 'past_due', 'trialing')),
  payment_provider         text check (payment_provider in ('stripe', 'mercadopago')),
  provider_subscription_id text,
  current_period_start     timestamptz,
  current_period_end       timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create unique index if not exists subscriptions_user_id_idx on subscriptions(user_id);

create trigger subscriptions_updated_at
  before update on subscriptions
  for each row execute procedure set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Los usuarios solo pueden ver y modificar sus propios datos.

alter table profiles           enable row level security;
alter table experiences        enable row level security;
alter table educations         enable row level security;
alter table skills             enable row level security;
alter table languages          enable row level security;
alter table certifications     enable row level security;
alter table projects           enable row level security;
alter table user_template_access enable row level security;
alter table subscriptions      enable row level security;

-- templates: lectura pública, escritura solo service_role
alter table templates          enable row level security;
create policy "Templates are publicly readable"
  on templates for select using (is_active = true);

-- profiles
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = user_id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = user_id);

-- experiences / educations / skills / languages / certifications / projects
-- (misma lógica para cada tabla)
do $$
declare
  tbl text;
begin
  foreach tbl in array array['experiences', 'educations', 'skills', 'languages', 'certifications', 'projects']
  loop
    execute format('
      create policy "Users manage own %1$s (select)" on %1$s for select using (auth.uid() = user_id);
      create policy "Users manage own %1$s (insert)" on %1$s for insert with check (auth.uid() = user_id);
      create policy "Users manage own %1$s (update)" on %1$s for update using (auth.uid() = user_id);
      create policy "Users manage own %1$s (delete)" on %1$s for delete using (auth.uid() = user_id);
    ', tbl);
  end loop;
end;
$$;

-- user_template_access: solo lectura propia (escritura vía service_role en webhooks)
create policy "Users can view own template access"
  on user_template_access for select using (auth.uid() = user_id);

-- subscriptions: solo lectura propia
create policy "Users can view own subscription"
  on subscriptions for select using (auth.uid() = user_id);
