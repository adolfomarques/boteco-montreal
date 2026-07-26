import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://duilupnttahqeyluhsvg.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_IksxUqYx9qcPutgTkJnGnA_sbjeQ_WG'
);

// ─── IMAGE MAP: name_pt → image_url ───────────────────────────

const IMAGE_MAP = {
  // Food items
  'Coxinha': 'https://images.unsplash.com/photo-1700353763351-cb61036f3232?w=800&q=80&fit=crop&auto=format',
  'Pastel Brasileiro (Queijo / Frango / Carne)': 'https://images.unsplash.com/photo-1677370261616-48751f23f8a2?w=800&q=80&fit=crop&auto=format',
  'P\u00e3o de Queijo': 'https://images.unsplash.com/photo-1773399159824-5a63848662d2?w=800&q=80&fit=crop&auto=format',
  'Bolinho de Queijo': 'https://images.unsplash.com/photo-1783286943665-e4200fc0731e?w=800&q=80&fit=crop&auto=format',
  'Calabresa Acebolada': 'https://images.unsplash.com/photo-1695089028198-80245e2f5d06?w=800&q=80&fit=crop&auto=format',
  'Torresmo': 'https://images.unsplash.com/photo-1641848392621-0df2671dd6c4?w=800&q=80&fit=crop&auto=format',
  'Camar\u00e3o Empanado (6)': 'https://images.unsplash.com/photo-1582993728648-1f29c748e5ad?w=800&q=80&fit=crop&auto=format',
  'Asa de Frango (6)': 'https://images.unsplash.com/photo-1571162437205-8889ff2fee26?w=800&q=80&fit=crop&auto=format',
  'Batata Frita': 'https://images.unsplash.com/photo-1630431341973-02e1b662ec35?w=800&q=80&fit=crop&auto=format',

  // Plats
  'Picanha': 'https://images.unsplash.com/photo-1558030137-a56c1b004fa3?w=800&q=80&fit=crop&auto=format',
  'Espeto de Frango': 'https://images.unsplash.com/photo-1625944228126-74f9d9ae77e3?w=800&q=80&fit=crop&auto=format',
  'Cora\u00e7\u00e3o de Frango': 'https://images.unsplash.com/photo-1625944228126-74f9d9ae77e3?w=800&q=80&fit=crop&auto=format',
  'Queijo Coalho Grelhado': 'https://images.unsplash.com/photo-1589418791638-e625ba4960d6?w=800&q=80&fit=crop&auto=format',

  // Drinks
  'Caipirinha': 'https://images.unsplash.com/photo-1644809818228-e29aa5aa8151?w=800&q=80&fit=crop&auto=format',
  'Caipiroska': 'https://images.unsplash.com/photo-1581927692308-be9e43b4d860?w=800&q=80&fit=crop&auto=format',
  'Sakerinha': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80&fit=crop&auto=format',
  'Rio Sunset': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80&fit=crop&auto=format',
  'Xeque-Mate': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80&fit=crop&auto=format',
  'Amaz\u00f4nia': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80&fit=crop&auto=format',
  'Matsunaga': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80&fit=crop&auto=format',
  'Borogod\u00f3': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80&fit=crop&auto=format',
  'Caipirinha Tradicional com Corona': 'https://images.unsplash.com/photo-1644809818228-e29aa5aa8151?w=800&q=80&fit=crop&auto=format',

  // Beers
  'Corona Extra': 'https://images.unsplash.com/photo-1608742598121-15038a8db33c?w=800&q=80&fit=crop&auto=format',
  'Corona Zero': 'https://images.unsplash.com/photo-1608742598121-15038a8db33c?w=800&q=80&fit=crop&auto=format',
  'Balde Corona (5)': 'https://images.unsplash.com/photo-1518542698889-ca82262f08d5?w=800&q=80&fit=crop&auto=format',
  'Labatt 50': 'https://images.unsplash.com/photo-1518542698889-ca82262f08d5?w=800&q=80&fit=crop&auto=format',
  'Michelob Ultra': 'https://images.unsplash.com/photo-1518542698889-ca82262f08d5?w=800&q=80&fit=crop&auto=format',
  'Belle Mer': 'https://images.unsplash.com/photo-1518542698889-ca82262f08d5?w=800&q=80&fit=crop&auto=format',
  'Chipie': 'https://images.unsplash.com/photo-1518542698889-ca82262f08d5?w=800&q=80&fit=crop&auto=format',
  'Modelo': 'https://images.unsplash.com/photo-1518542698889-ca82262f08d5?w=800&q=80&fit=crop&auto=format',
  'Stella Artois': 'https://images.unsplash.com/photo-1518542698889-ca82262f08d5?w=800&q=80&fit=crop&auto=format',

  // Other drinks
  'Cidre / Lacroix Ros\u00e9': 'https://images.unsplash.com/photo-1783000482668-60d46bab573b?w=800&q=80&fit=crop&auto=format',
  '\u00c1gua com G\u00e1s': 'https://images.unsplash.com/photo-1614887065001-06c958a7cddd?w=800&q=80&fit=crop&auto=format',
  'Guaran\u00e1': 'https://images.unsplash.com/photo-1588238142232-7108fb7dcbb6?w=800&q=80&fit=crop&auto=format',
  'Coca-Cola': 'https://images.unsplash.com/photo-1588238142232-7108fb7dcbb6?w=800&q=80&fit=crop&auto=format',
  'Coca-Cola Zero': 'https://images.unsplash.com/photo-1588238142232-7108fb7dcbb6?w=800&q=80&fit=crop&auto=format',
  'Sprite': 'https://images.unsplash.com/photo-1588238142232-7108fb7dcbb6?w=800&q=80&fit=crop&auto=format',
  'Suco de Laranja': 'https://images.unsplash.com/photo-1599360889420-da1afaba9edc?w=800&q=80&fit=crop&auto=format',
};

// ─── UPDATE SUPABASE ───────────────────────────────────────────

async function updateSupabase() {
  console.log('Updating menu item images in Supabase...\n');
  let updated = 0;
  let failed = 0;

  for (const [name_pt, image_url] of Object.entries(IMAGE_MAP)) {
    const { data, error } = await supabase
      .from('menu_items')
      .update({ image_url })
      .eq('name_pt', name_pt);

    if (error) {
      console.error(`  \u2717 ${name_pt}: ${error.message}`);
      failed++;
    } else {
      console.log(`  \u2713 ${name_pt}`);
      updated++;
    }
  }

  console.log(`\nDone: ${updated} updated, ${failed} failed`);
}

// ─── UPDATE SEED SCRIPT ────────────────────────────────────────

function updateSeedScript() {
  const seedPath = resolve(__dirname, '..', 'scripts', 'seed-pdf-menu.mjs');
  let content = readFileSync(seedPath, 'utf-8');

  for (const [name_pt, image_url] of Object.entries(IMAGE_MAP)) {
    // Find the item's image_url line and update it
    const escapedName = name_pt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(name_pt:\\s*'${escapedName}'.*?\\n)(.*?)(image_url:\\s*)'[^']*'`, 's');
    const replacement = `$1$2image_url: '${image_url}'`;
    content = content.replace(regex, replacement);
  }

  writeFileSync(seedPath, content);
  console.log('Seed script updated with image URLs');
}

// ─── UPDATE LOCAL menu.json ────────────────────────────────────

function updateLocalMenu() {
  const menuPath = resolve(__dirname, '..', '.local-data', 'menu.json');
  const menu = JSON.parse(readFileSync(menuPath, 'utf-8'));

  const sections = ['entrees', 'drinks_desserts'];
  for (const section of sections) {
    if (section === 'entrees') {
      const subs = ['featured', 'list'];
      for (const sub of subs) {
        for (const item of menu.entrees[sub]) {
          const url = IMAGE_MAP[item.name_pt];
          if (url) {
            item.image_url = url;
            item.image = url;
          }
        }
      }
    }
    if (section === 'drinks_desserts') {
      for (const item of menu.drinks_desserts) {
        const url = IMAGE_MAP[item.name_pt];
        if (url) {
          item.image_url = url;
          item.image = url;
        }
      }
    }
  }
  // Update plats
  if (menu.plats?.featured) {
    const url = IMAGE_MAP[menu.plats.featured.name_pt];
    if (url) {
      menu.plats.featured.image_url = url;
      menu.plats.featured.image = url;
    }
  }
  if (menu.plats?.secondary) {
    for (const item of menu.plats.secondary) {
      const url = IMAGE_MAP[item.name_pt];
      if (url) {
        item.image_url = url;
        item.image = url;
      }
    }
  }

  writeFileSync(menuPath, JSON.stringify(menu, null, 2));
  console.log('menu.json updated with image URLs');
}

// ─── UPDATE lib/data/menu.ts ───────────────────────────────────

function updateLocalDataTypeScript() {
  const tsPath = resolve(__dirname, '..', 'lib', 'data', 'menu.ts');
  let content = readFileSync(tsPath, 'utf-8');

  for (const [name_pt, image_url] of Object.entries(IMAGE_MAP)) {
    const escapedName = name_pt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Match patterns like { name_pt: 'Coxinha', ... price: 13, } 
    // and add image_url: '...' before the closing brace
    const regex = new RegExp(`(${escapedName}'.*?\\n)(.*?)(\\n\\s+(?:badge|portion|featured|\\}|price:))`, 's');
    const match = content.match(regex);
    if (match) {
      // Check if image_url already exists
      const block = match[0];
      if (!block.includes('image_url:')) {
        const insertPoint = block.lastIndexOf(match[3]);
        const before = block.slice(0, insertPoint);
        const after = block.slice(insertPoint);
        const imgLine = `\n    image_url: '${image_url}',`;
        content = content.replace(block, before + imgLine + after);
      }
    }
  }

  writeFileSync(tsPath, content);
  console.log('lib/data/menu.ts updated with image URLs');
}

// ─── MAIN ──────────────────────────────────────────────────────

async function main() {
  await updateSupabase();
  updateSeedScript();
  updateLocalMenu();
  updateLocalDataTypeScript();
  console.log('\nAll done!');
}

main().catch(console.error);
