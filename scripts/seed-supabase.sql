-- =============================================================
-- Boteco Montreal — Seed completo para Supabase
-- =============================================================
-- INSTRUÇÕES:
-- 1. Crie um projeto em https://supabase.com
-- 2. Vá em SQL Editor > New Query
-- 3. Cole TODO este arquivo e execute
-- 4. Copie as credenciais para o .env.local (veja .env.example)
-- 5. Reinicie o servidor: npm run dev
-- =============================================================

-- 1. CRIAR TABELAS (seguro rodar múltiplas vezes)
-- =============================================================

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

create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  avatar_url text,
  role text not null default 'editor' check (role in ('admin','editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. ÍNDICES
-- =============================================================

create index if not exists idx_menu_items_category on menu_items(category_id);
create index if not exists idx_menu_items_active on menu_items(active);
create index if not exists idx_events_active on events(active);
create index if not exists idx_reservations_date on reservations(reservation_date);
create index if not exists idx_reservations_status on reservations(status);
create index if not exists idx_site_settings_key on site_settings(key);

-- 3. TRIGGER para updated_at automático
-- =============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists menu_categories_updated_at on menu_categories;
create trigger menu_categories_updated_at before update on menu_categories
  for each row execute function update_updated_at();

drop trigger if exists menu_items_updated_at on menu_items;
create trigger menu_items_updated_at before update on menu_items
  for each row execute function update_updated_at();

drop trigger if exists events_updated_at on events;
create trigger events_updated_at before update on events
  for each row execute function update_updated_at();

drop trigger if exists admin_users_updated_at on admin_users;
create trigger admin_users_updated_at before update on admin_users
  for each row execute function update_updated_at();

-- 4. SEED DATA — Categorias do Menu
-- =============================================================

insert into menu_categories (name_pt, name_fr, name_en, slug, sort_order) values
  ('Entradas', 'Entrées', 'Starters', 'entrees', 1),
  ('Pratos Principais', 'Plats Principaux', 'Main Courses', 'plats', 2),
  ('Sobremesas', 'Desserts', 'Desserts', 'desserts', 3),
  ('Bebidas', 'Boissons', 'Drinks', 'bebidas', 4)
on conflict (slug) do nothing;

-- 5. SEED DATA — Eventos
-- =============================================================

insert into events (day_label, title_pt, title_fr, title_en, description_pt, description_fr, description_en, time_range, icon, color, image_url, sort_order, active) values
  ('SEXTA-FEIRA', 'Noite de Karaokê', 'Soirée Karaoké', 'Karaoke Night', 'O talento é opcional. A atmosfera é obrigatória. Pop, MPB e sucessos internacionais.', 'Le talent est optionnel. L''ambiance, obligatoire. Pop, MPB et succès internationaux.', 'Talent is optional. The vibe is mandatory. Pop, MPB, and international hits.', '19h - 23h', 'mic_external_on', 'secondary', null, 1, true),
  ('SÁBADO', 'Noite de Samba', 'Soirée Samba', 'Samba Night', 'Roda de samba ao vivo com os melhores talentos da comunidade brasileira de Quebec.', 'Roda de samba en direct avec les meilleurs talents de la communauté brésilienne de Québec.', 'Live samba roda with the best talents of the Brazilian community in Quebec.', '20h - 00h', 'celebration', 'tertiary', null, 2, true),
  ('DOMINGO', 'Feijoada Tradicional', 'Feijoada Traditionnelle', 'Traditional Feijoada', 'Nosso prato nacional servido em um almoço festivo com chorinho e caipirinhas.', 'Notre plat national servi lors d''un déjeuner festif avec chorinho et caipirinhas.', 'Our national dish served in a festive lunch with chorinho and caipirinhas.', '12h - 17h', 'restaurant', 'primary', null, 3, true)
on conflict do nothing;

-- 6. SEED DATA — Admin user (opcional)
-- =============================================================
-- Altere o email e senha abaixo antes de executar em produção!
-- A senha deve ser cadastrada via Authentication > Users no dashboard do Supabase

insert into admin_users (email, name, role) values
  ('admin@botecomontreal.com', 'Admin Boteco', 'admin')
on conflict (email) do nothing;

-- 7. SEED DATA — Configurações do site
-- =============================================================

insert into site_settings (key, value) values
  ('restaurant_info', jsonb_build_object(
    'name', 'Boteco Montreal',
    'tagline', 'Sabores do Brasil',
    'description', jsonb_build_object(
      'pt', 'Boteco Montreal — Sabores autênticos do Brasil no coração de Montreal. Música ao vivo, cerveja gelada e a melhor comida brasileira.',
      'fr', 'Boteco Montreal — Saveurs authentiques du Brésil au cœur de Montréal. Musique live, bière froide et la meilleure cuisine brésilienne.',
      'en', 'Boteco Montreal — Authentic Brazilian flavors in the heart of Montreal. Live music, cold beer, and the best Brazilian food.'
    ),
    'address', jsonb_build_object(
      'full', '5414 Av. Gatineau, Montreal, QC H3T 1L9',
      'street', '5414 Av. Gatineau',
      'city', 'Montreal',
      'province', 'QC',
      'postal', 'H3T 1L9'
    ),
    'phone', '(514) 903-0730',
    'email', 'ola@botecomontreal.com',
    'hours', jsonb_build_object(
      'mon', jsonb_build_object('label', jsonb_build_object('pt', 'Seg', 'fr', 'Lun', 'en', 'Mon'), 'status', 'closed'),
      'tue', jsonb_build_object('label', jsonb_build_object('pt', 'Ter', 'fr', 'Mar', 'en', 'Tue'), 'hours', jsonb_build_object('pt', '15h - 23h', 'fr', '15h - 23h', 'en', '3PM - 11PM')),
      'wed', jsonb_build_object('label', jsonb_build_object('pt', 'Qua', 'fr', 'Mer', 'en', 'Wed'), 'hours', jsonb_build_object('pt', '15h - 23h', 'fr', '15h - 23h', 'en', '3PM - 11PM')),
      'thu', jsonb_build_object('label', jsonb_build_object('pt', 'Qui', 'fr', 'Jeu', 'en', 'Thu'), 'hours', jsonb_build_object('pt', '15h - 23h', 'fr', '15h - 23h', 'en', '3PM - 11PM')),
      'fri', jsonb_build_object('label', jsonb_build_object('pt', 'Sex', 'fr', 'Ven', 'en', 'Fri'), 'hours', jsonb_build_object('pt', '15h - 23h', 'fr', '15h - 23h', 'en', '3PM - 11PM')),
      'sat', jsonb_build_object('label', jsonb_build_object('pt', 'Sáb', 'fr', 'Sam', 'en', 'Sat'), 'hours', jsonb_build_object('pt', '15h - 01h', 'fr', '15h - 01h', 'en', '3PM - 1AM')),
      'sun', jsonb_build_object('label', jsonb_build_object('pt', 'Dom', 'fr', 'Dim', 'en', 'Sun'), 'hours', jsonb_build_object('pt', '15h - 23h', 'fr', '15h - 23h', 'en', '3PM - 11PM'))
    ),
    'social', jsonb_build_object(
      'instagram', 'https://www.instagram.com/botecobrmontreal/',
      'instagramHandle', '@botecobrmontreal',
      'facebook', 'https://www.facebook.com/BotecoMontreal'
    )
  ))
on conflict (key) do nothing;
