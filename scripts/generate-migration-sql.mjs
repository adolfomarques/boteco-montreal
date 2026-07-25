import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '..', '.local-data');

function readJson(name) {
  const p = resolve(DATA_DIR, `${name}.json`);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf-8'));
}

function esc(v) {
  if (v === null || v === undefined) return 'null';
  return `'${String(v).replace(/'/g, "''")}'`;
}

function escJson(v) {
  if (v === null || v === undefined) return 'null';
  return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
}

function bool(v) {
  return v ? 'true' : 'false';
}

let sql = `-- GENERATED MIGRATION SCRIPT
-- Run this in Supabase SQL Editor

-- Clear existing data (safe to re-run)
delete from menu_items;
delete from menu_categories;
delete from events;
delete from reservations;
delete from site_settings;
delete from gallery_items;

-- 1. Menu Categories
insert into menu_categories (name_pt, name_fr, name_en, slug, sort_order) values
  ('Entradas', 'Entrées', 'Starters', 'entrees', 1),
  ('Pratos Principais', 'Plats Principaux', 'Main Courses', 'plats', 2),
  ('Sobremesas', 'Desserts', 'Desserts', 'desserts', 3),
  ('Bebidas', 'Boissons', 'Drinks', 'bebidas', 4);

`;

// 2. Menu Items
const menu = readJson('menu');
if (menu) {
  let items = [];
  let sort = 0;

  // Map category slugs to ids
  function catId(slug) {
    return `(select id from menu_categories where slug = '${slug}')`;
  }

  for (const item of (menu.entrees?.featured ?? [])) {
    items.push(`(${catId('entrees')}, ${esc(item.name_pt)}, ${esc(item.name_fr)}, ${esc(item.name_en)}, ${esc(item.description_pt || '')}, ${esc(item.description_fr || '')}, ${esc(item.description_en || '')}, ${item.price}, ${esc(item.image_url || null)}, ${esc(item.badge_pt || null)}, ${esc(item.badge_fr || null)}, ${esc(item.badge_en || null)}, true, ${esc(item.portion_pt ? JSON.stringify({pt: item.portion_pt, fr: item.portion_fr, en: item.portion_en}) : null)}, null, null, null, ${sort}, true)`);
    sort++;
  }
  for (const item of (menu.entrees?.list ?? [])) {
    items.push(`(${catId('entrees')}, ${esc(item.name_pt)}, ${esc(item.name_fr)}, ${esc(item.name_en)}, ${esc(item.description_pt || '')}, ${esc(item.description_fr || '')}, ${esc(item.description_en || '')}, ${item.price}, ${esc(item.image_url || null)}, null, null, null, false, null, null, null, null, ${sort}, true)`);
    sort++;
  }
  if (menu.plats?.featured) {
    const p = menu.plats.featured;
    items.push(`(${catId('plats')}, ${esc(p.name_pt)}, ${esc(p.name_fr)}, ${esc(p.name_en)}, ${esc(p.description_pt || '')}, ${esc(p.description_fr || '')}, ${esc(p.description_en || '')}, ${p.price}, ${esc(p.image_url || null)}, null, null, null, true, null, null, null, null, ${sort}, true)`);
    sort++;
  }
  for (const item of (menu.plats?.secondary ?? [])) {
    items.push(`(${catId('plats')}, ${esc(item.name_pt)}, ${esc(item.name_fr)}, ${esc(item.name_en)}, ${esc(item.description_pt || '')}, ${esc(item.description_fr || '')}, ${esc(item.description_en || '')}, ${item.price}, ${esc(item.image_url || null)}, ${esc(item.badge_pt || null)}, ${esc(item.badge_fr || null)}, ${esc(item.badge_en || null)}, false, null, ${esc(item.tagline_pt || null)}, ${esc(item.tagline_fr || null)}, ${esc(item.tagline_en || null)}, ${sort}, true)`);
    sort++;
  }
  for (const item of (menu.drinks_desserts ?? [])) {
    const slug = (item.type_pt === 'SOBREMESA' || item.type_pt === 'DESSERT') ? 'desserts' : 'bebidas';
    items.push(`(${catId(slug)}, ${esc(item.name_pt)}, ${esc(item.name_fr)}, ${esc(item.name_en)}, ${esc(item.description_pt || '')}, ${esc(item.description_fr || '')}, ${esc(item.description_en || '')}, ${item.price}, ${esc(item.image_url || null)}, null, null, null, ${bool(item.featured)}, null, null, null, null, ${sort}, true)`);
    sort++;
  }

  if (items.length > 0) {
    sql += `-- 2. Menu Items\ninsert into menu_items (category_id, name_pt, name_fr, name_en, description_pt, description_fr, description_en, price, image_url, badge_pt, badge_fr, badge_en, featured, portion, tagline_pt, tagline_fr, tagline_en, sort_order, active) values\n`;
    sql += items.join(',\n') + ';\n\n';
  }
}

// 3. Events
const events = readJson('events');
if (events && events.length > 0) {
  sql += `-- 3. Events\ninsert into events (day_label, title_pt, title_fr, title_en, description_pt, description_fr, description_en, time_range, icon, color, image_url, sort_order, active) values\n`;
  const rows = events.map(ev =>
    `(${esc(ev.day_label)}, ${esc(ev.title_pt)}, ${esc(ev.title_fr)}, ${esc(ev.title_en)}, ${esc(ev.description_pt)}, ${esc(ev.description_fr)}, ${esc(ev.description_en)}, ${esc(ev.time_range)}, ${esc(ev.icon)}, ${esc(ev.color)}, ${esc(ev.image_url || null)}, ${ev.sort_order}, ${bool(ev.active)})`
  );
  sql += rows.join(',\n') + ';\n\n';
}

// 4. Gallery Items (create table if not exists)
sql += `-- 4. Gallery Items\n`;
sql += `create table if not exists gallery_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('image','video')),
  src text not null,
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);\n\n`;

const gallery = readJson('gallery');
if (gallery && gallery.length > 0) {
  sql += `insert into gallery_items (type, src, sort_order, active) values\n`;
  const rows = gallery.map(g =>
    `(${esc(g.type)}, ${esc(g.src)}, ${g.sort_order}, ${bool(g.active)})`
  );
  sql += rows.join(',\n') + ';\n\n';
}

// 5. Reservations
const reservations = readJson('reservations');
if (reservations && reservations.length > 0) {
  sql += `-- 5. Reservations\ninsert into reservations (reservation_date, reservation_time, guests, name, phone, email, special_requests, status) values\n`;
  const rows = reservations.map(r =>
    `(${esc(r.reservation_date)}, ${esc(r.reservation_time)}, ${r.guests}, ${esc(r.name || null)}, ${esc(r.phone)}, ${esc(r.email || null)}, ${esc(r.special_requests || null)}, ${esc(r.status || 'pending')})`
  );
  sql += rows.join(',\n') + ';\n\n';
}

// 6. Settings
sql += `-- 6. Site Settings (seed)\n`;
sql += `insert into site_settings (key, value) values\n`;
sql += `('restaurant_info', jsonb_build_object(\n`;
sql += `  'name', 'Boteco Montreal',\n`;
sql += `  'tagline', 'Sabores do Brasil',\n`;
sql += `  'description', jsonb_build_object(\n`;
sql += `    'pt', 'Boteco Montreal — Sabores autênticos do Brasil no coração de Montreal. Música ao vivo, cerveja gelada e a melhor comida brasileira.',\n`;
sql += `    'fr', 'Boteco Montreal — Saveurs authentiques du Brésil au cœur de Montréal. Musique live, bière froide et la meilleure cuisine brésilienne.',\n`;
sql += `    'en', 'Boteco Montreal — Authentic Brazilian flavors in the heart of Montreal. Live music, cold beer, and the best Brazilian food.'\n`;
sql += `  ),\n`;
sql += `  'address', jsonb_build_object(\n`;
sql += `    'full', '5414 Av. Gatineau, Montreal, QC H3T 1L9',\n`;
sql += `    'street', '5414 Av. Gatineau',\n`;
sql += `    'city', 'Montreal',\n`;
sql += `    'province', 'QC',\n`;
sql += `    'postal', 'H3T 1L9'\n`;
sql += `  ),\n`;
sql += `  'phone', '(514) 903-0730',\n`;
sql += `  'email', 'ola@botecomontreal.com',\n`;
sql += `  'hours', jsonb_build_object(\n`;
sql += `    'mon', jsonb_build_object('label', jsonb_build_object('pt', 'Seg', 'fr', 'Lun', 'en', 'Mon'), 'status', 'closed'),\n`;
sql += `    'tue', jsonb_build_object('label', jsonb_build_object('pt', 'Ter', 'fr', 'Mar', 'en', 'Tue'), 'hours', jsonb_build_object('pt', '15h - 23h', 'fr', '15h - 23h', 'en', '3PM - 11PM')),\n`;
sql += `    'wed', jsonb_build_object('label', jsonb_build_object('pt', 'Qua', 'fr', 'Mer', 'en', 'Wed'), 'hours', jsonb_build_object('pt', '15h - 23h', 'fr', '15h - 23h', 'en', '3PM - 11PM')),\n`;
sql += `    'thu', jsonb_build_object('label', jsonb_build_object('pt', 'Qui', 'fr', 'Jeu', 'en', 'Thu'), 'hours', jsonb_build_object('pt', '15h - 23h', 'fr', '15h - 23h', 'en', '3PM - 11PM')),\n`;
sql += `    'fri', jsonb_build_object('label', jsonb_build_object('pt', 'Sex', 'fr', 'Ven', 'en', 'Fri'), 'hours', jsonb_build_object('pt', '15h - 23h', 'fr', '15h - 23h', 'en', '3PM - 11PM')),\n`;
sql += `    'sat', jsonb_build_object('label', jsonb_build_object('pt', 'Sáb', 'fr', 'Sam', 'en', 'Sat'), 'hours', jsonb_build_object('pt', '15h - 01h', 'fr', '15h - 01h', 'en', '3PM - 1AM')),\n`;
sql += `    'sun', jsonb_build_object('label', jsonb_build_object('pt', 'Dom', 'fr', 'Dim', 'en', 'Sun'), 'hours', jsonb_build_object('pt', '15h - 23h', 'fr', '15h - 23h', 'en', '3PM - 11PM'))\n`;
sql += `  ),\n`;
sql += `  'social', jsonb_build_object(\n`;
sql += `    'instagram', 'https://www.instagram.com/botecobrmontreal/',\n`;
sql += `    'instagramHandle', '@botecobrmontreal',\n`;
sql += `    'facebook', 'https://www.facebook.com/BotecoMontreal'\n`;
sql += `  )\n`;
sql += `)) on conflict (key) do nothing;\n`;

console.log(sql);
