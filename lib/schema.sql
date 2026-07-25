-- Boteco Montreal — Supabase Schema
-- Run this in the Supabase SQL Editor

-- 1. menu_categories
create table if not exists menu_categories (
  id uuid primary key default gen_random_uuid(),
  name_pt text not null,
  name_fr text not null,
  name_en text not null,
  slug text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. menu_items
create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references menu_categories(id) on delete cascade,
  name_pt text not null,
  name_fr text not null,
  name_en text not null,
  description_pt text not null default '',
  description_fr text not null default '',
  description_en text not null default '',
  price numeric(10,2) not null,
  image_url text,
  badge_pt text,
  badge_fr text,
  badge_en text,
  featured boolean not null default false,
  portion text,
  tagline_pt text,
  tagline_fr text,
  tagline_en text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. events
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  day_label text not null,
  title_pt text not null,
  title_fr text not null,
  title_en text not null,
  description_pt text not null,
  description_fr text not null,
  description_en text not null,
  time_range text not null,
  icon text not null,
  color text not null default 'secondary',
  image_url text,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. reservations
create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  reservation_date date not null,
  reservation_time time not null,
  guests int not null,
  name text,
  phone text not null,
  email text,
  special_requests text,
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  created_at timestamptz not null default now()
);

-- 5. site_settings
create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- 6. admin_users
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  avatar_url text,
  role text not null default 'editor' check (role in ('admin','editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_menu_items_category on menu_items(category_id);
create index if not exists idx_menu_items_active on menu_items(active);
create index if not exists idx_events_active on events(active);
create index if not exists idx_reservations_date on reservations(reservation_date);
create index if not exists idx_reservations_status on reservations(status);
create index if not exists idx_site_settings_key on site_settings(key);

-- Auto-update updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger menu_categories_updated_at before update on menu_categories
  for each row execute function update_updated_at();
create trigger menu_items_updated_at before update on menu_items
  for each row execute function update_updated_at();
create trigger events_updated_at before update on events
  for each row execute function update_updated_at();
create trigger admin_users_updated_at before update on admin_users
  for each row execute function update_updated_at();

-- Seed data
insert into menu_categories (name_pt, name_fr, name_en, slug, sort_order) values
  ('Entradas', 'Entrées', 'Starters', 'entrees', 1),
  ('Pratos Principais', 'Plats Principaux', 'Main Courses', 'plats', 2),
  ('Sobremesas', 'Desserts', 'Desserts', 'desserts', 3),
  ('Bebidas', 'Boissons', 'Drinks', 'bebidas', 4)
on conflict (slug) do nothing;

insert into events (day_label, title_pt, title_fr, title_en, description_pt, description_fr, description_en, time_range, icon, color, sort_order) values
  ('FRIDAY | SEXTA', 'Noite de Karaokê', 'Karaoke Night', 'Karaoke Night', 'O talento é opcional. A atmosfera é obrigatória.', 'Le talent est optionnel. L''ambiance, obligatoire.', 'Talent is optional. The vibe is mandatory.', '19h - 23h', 'mic_external_on', 'secondary', 1),
  ('SATURDAY | SÁBADO', 'Noite de Samba', 'Noite de Samba', 'Samba Night', 'Roda de samba ao vivo com os melhores talentos.', 'Roda de samba au Québec.', 'Live samba roda.', '20h - 00h', 'celebration', 'tertiary', 2),
  ('SUNDAY | DOMINGO', 'Feijoada Tradicional', 'Feijoada Traditionnelle', 'Traditional Feijoada', 'Nosso prato nacional servido em um almoço festivo.', 'Notre plat national servi lors d''un déjeuner festif.', 'Our national dish served in a festive lunch.', '12h - 17h', 'restaurant', 'primary', 3)
on conflict do nothing;
