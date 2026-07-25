import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '..', '.local-data');

function loadEnv() {
  const p = resolve(__dirname, '..', '.env.local');
  const raw = readFileSync(p, 'utf-8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([\w_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function readJson(name) {
  const p = resolve(DATA_DIR, `${name}.json`);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf-8'));
}

async function migrateCategories() {
  const result = await supabase.from('menu_categories').upsert([
    { name_pt: 'Entradas', name_fr: 'Entrées', name_en: 'Starters', slug: 'entrees', sort_order: 1 },
    { name_pt: 'Pratos Principais', name_fr: 'Plats Principaux', name_en: 'Main Courses', slug: 'plats', sort_order: 2 },
    { name_pt: 'Sobremesas', name_fr: 'Desserts', name_en: 'Desserts', slug: 'desserts', sort_order: 3 },
    { name_pt: 'Bebidas', name_fr: 'Boissons', name_en: 'Drinks', slug: 'bebidas', sort_order: 4 },
  ], { onConflict: 'slug', ignoreDuplicates: false });

  if (result.error) throw new Error(`categories: ${result.error.message}`);
  console.log(`menu_categories: ${result.data?.length ?? 0} rows`);
  return result.data;
}

async function getCategoryId(slug) {
  const { data } = await supabase.from('menu_categories').select('id').eq('slug', slug).single();
  return data?.id;
}

async function migrateMenu(categories) {
  const menu = readJson('menu');
  if (!menu) { console.log('menu.json not found, skipping'); return; }

  const catEntrees = await getCategoryId('entrees');
  const catPlats = await getCategoryId('plats');
  const catDesserts = await getCategoryId('desserts');
  const catBebidas = await getCategoryId('bebidas');

  const items = [];
  let sort = 0;

  for (const item of (menu.entrees?.featured ?? [])) {
    items.push({ category_id: catEntrees, name_pt: item.name_pt, name_fr: item.name_fr, name_en: item.name_en, description_pt: item.description_pt ?? '', description_fr: item.description_fr ?? '', description_en: item.description_en ?? '', price: item.price, image_url: item.image_url ?? null, badge_pt: item.badge_pt ?? null, badge_fr: item.badge_fr ?? null, badge_en: item.badge_en ?? null, featured: true, portion: item.portion_pt ? JSON.stringify({ pt: item.portion_pt, fr: item.portion_fr, en: item.portion_en }) : null, sort_order: sort++, active: true });
  }
  for (const item of (menu.entrees?.list ?? [])) {
    items.push({ category_id: catEntrees, name_pt: item.name_pt, name_fr: item.name_fr, name_en: item.name_en, description_pt: item.description_pt ?? '', description_fr: item.description_fr ?? '', description_en: item.description_en ?? '', price: item.price, image_url: item.image_url ?? null, featured: false, sort_order: sort++, active: true });
  }
  if (menu.plats?.featured) {
    const p = menu.plats.featured;
    items.push({ category_id: catPlats, name_pt: p.name_pt, name_fr: p.name_fr, name_en: p.name_en, description_pt: p.description_pt ?? '', description_fr: p.description_fr ?? '', description_en: p.description_en ?? '', price: p.price, image_url: p.image_url ?? null, featured: true, sort_order: sort++, active: true });
  }
  for (const item of (menu.plats?.secondary ?? [])) {
    items.push({ category_id: catPlats, name_pt: item.name_pt, name_fr: item.name_fr, name_en: item.name_en, description_pt: item.description_pt ?? '', description_fr: item.description_fr ?? '', description_en: item.description_en ?? '', price: item.price, image_url: item.image_url ?? null, featured: false, badge_pt: item.badge_pt ?? null, badge_fr: item.badge_fr ?? null, badge_en: item.badge_en ?? null, tagline_pt: item.tagline_pt ?? null, tagline_fr: item.tagline_fr ?? null, tagline_en: item.tagline_en ?? null, sort_order: sort++, active: true });
  }
  for (const item of (menu.drinks_desserts ?? [])) {
    const catId = item.type_pt === 'SOBREMESA' || item.type_pt === 'DESSERT' ? catDesserts : catBebidas;
    items.push({ category_id: catId, name_pt: item.name_pt, name_fr: item.name_fr, name_en: item.name_en, description_pt: item.description_pt ?? '', description_fr: item.description_fr ?? '', description_en: item.description_en ?? '', price: item.price, image_url: item.image_url ?? null, featured: item.featured ?? false, sort_order: sort++, active: true });
  }

  if (items.length === 0) { console.log('No menu items to migrate'); return; }

  const batchSize = 20;
  let inserted = 0;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const { error } = await supabase.from('menu_items').insert(batch);
    if (error) throw new Error(`menu_items batch ${i}: ${error.message}`);
    inserted += batch.length;
  }
  console.log(`menu_items: ${inserted} rows`);
}

async function migrateEvents() {
  const events = readJson('events');
  if (!events) { console.log('events.json not found, skipping'); return; }

  for (const ev of events) {
    const { error } = await supabase.from('events').upsert({
      day_label: ev.day_label,
      day_label_pt: ev.day_label_pt, day_label_fr: ev.day_label_fr, day_label_en: ev.day_label_en,
      title_pt: ev.title_pt, title_fr: ev.title_fr, title_en: ev.title_en,
      description_pt: ev.description_pt, description_fr: ev.description_fr, description_en: ev.description_en,
      time_range: ev.time_range,
      icon: ev.icon,
      color: ev.color,
      image_url: ev.image_url ?? null,
      sort_order: ev.sort_order,
      active: ev.active,
    }, { onConflict: 'id', ignoreDuplicates: false });
    if (error) throw new Error(`events: ${error.message}`);
  }
  console.log(`events: ${events.length} rows`);
}

async function migrateReservations() {
  const reservations = readJson('reservations');
  if (!reservations || reservations.length === 0) { console.log('reservations empty, skipping'); return; }
  for (const r of reservations) {
    const { error } = await supabase.from('reservations').insert({
      reservation_date: r.reservation_date, reservation_time: r.reservation_time,
      guests: r.guests, name: r.name ?? null, phone: r.phone,
      email: r.email ?? null, special_requests: r.special_requests ?? null,
      status: r.status ?? 'pending',
    });
    if (error) throw new Error(`reservations: ${error.message}`);
  }
  console.log(`reservations: ${reservations.length} rows`);
}

async function migrateGallery() {
  const gallery = readJson('gallery');
  if (!gallery) { console.log('gallery.json not found, skipping'); return; }

  const { data: existing } = await supabase.from('gallery_items').select('id').limit(1);
  if (existing && existing.length > 0) {
    console.log('gallery_items already has data, skipping (create table manually if needed)');
    return;
  }

  const { error } = await supabase.from('gallery_items').insert(
    gallery.map(g => ({
      type: g.type,
      src: g.src,
      sort_order: g.sort_order,
      active: g.active,
    }))
  );
  if (error) {
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('gallery_items table does not exist in Supabase, skipping gallery migration. Create the table if needed.');
      return;
    }
    throw new Error(`gallery: ${error.message}`);
  }
  console.log(`gallery_items: ${gallery.length} rows`);
}

async function migrateSettings() {
  const settings = readJson('settings');
  if (!settings) { console.log('settings.json not found, using seed defaults'); return; }
  for (const s of settings) {
    const { error } = await supabase.from('site_settings').upsert({
      key: s.key,
      value: s.value,
    }, { onConflict: 'key', ignoreDuplicates: false });
    if (error) throw new Error(`settings: ${error.message}`);
  }
  console.log(`site_settings: ${settings.length} rows`);
}

async function main() {
  console.log('Starting migration...\n');

  const categories = await migrateCategories();
  await migrateMenu(categories);
  await migrateEvents();
  await migrateReservations();
  await migrateGallery();
  await migrateSettings();

  console.log('\nMigration complete!');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
