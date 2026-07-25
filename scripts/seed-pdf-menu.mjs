import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = resolve(__dirname, '..', '.local-data');

function esc(v) {
  if (v === null || v === undefined) return 'null';
  // Keep emoji and accented chars, only escape single quotes for SQL
  return `'${String(v).replace(/'/g, "''")}'`;
}

function bool(v) {
  return v ? 'true' : 'false';
}

const CATEGORIES = [
  { slug: 'entrees',  name_pt: 'Entradas',        name_fr: 'Entr\u00e9es',        name_en: 'Starters',     sort_order: 1 },
  { slug: 'plats',    name_pt: 'Pratos Principais', name_fr: 'Plats Principaux',   name_en: 'Main Courses', sort_order: 2 },
  { slug: 'desserts', name_pt: 'Sobremesas',        name_fr: 'Desserts',           name_en: 'Desserts',     sort_order: 3 },
  { slug: 'bebidas',  name_pt: 'Bebidas',           name_fr: 'Boissons',           name_en: 'Drinks',       sort_order: 4 },
];

function catId(slug) {
  return `(select id from menu_categories where slug = '${slug}')`;
}

// ─── AMUSE-GUEULES / ENTRÉES ────────────────────────────────

const entrees_featured = [
  {
    name_pt: 'Coxinha', name_fr: 'Coxinha', name_en: 'Coxinha',
    description_pt: 'Croquete de frango marinado, massa dourada e crocante.',
    description_fr: 'Croquette de poulet marin\u00e9, p\u00e2te dor\u00e9e et croustillante.',
    description_en: 'Marinated chicken croquette, golden and crispy dough.',
    price: 13,
    image_url: 'https://images.unsplash.com/photo-1700353763351-cb61036f3232?w=800&q=80&fit=crop&auto=format',
    badge_pt: 'Favorito', badge_fr: 'Favori', badge_en: 'Favorite',
    portion: null, featured: true,
  },
  {
    name_pt: 'Pastel Brasileiro (Queijo / Frango / Carne)',
    name_fr: 'Pastel Br\u00e9silien (Fromage / Poulet / Boeuf)',
    name_en: 'Brazilian Pastel (Cheese / Chicken / Beef)',
    description_pt: 'Pastel frito na hora, recheado com queijo, frango ou carne mo\u00edda.',
    description_fr: 'Pastel frit \u00e0 la commande, farci au fromage, poulet ou boeuf hach\u00e9.',
    description_en: 'Fried pastel made to order, filled with cheese, chicken or ground beef.',
    price: 13,
    image_url: null,
    badge_pt: null, badge_fr: null, badge_en: null,
    portion: null, featured: true,
  },
  {
    name_pt: 'P\u00e3o de Queijo',
    name_fr: 'P\u00e3o de Queijo',
    name_en: 'Cheese Bread',
    description_pt: 'P\u00e3o de queijo mineiro tradicional, macio por dentro e crocante por fora.',
    description_fr: 'Petit pain br\u00e9silien au fromage, moelleux \u00e0 l\'int\u00e9rieur et croustillant \u00e0 l\'ext\u00e9rieur.',
    description_en: 'Traditional Brazilian cheese bread, soft inside and crispy outside.',
    price: 12,
    image_url: 'https://images.unsplash.com/photo-1773399159824-5a63848662d2?w=800&q=80&fit=crop&auto=format',
    badge_pt: null, badge_fr: null, badge_en: null,
    portion: null, featured: true,
  },
];

const entrees_list = [
  {
    name_pt: 'Bolinho de Queijo',
    name_fr: 'Bolinho de Queijo',
    name_en: 'Cheese Croquette',
    description_pt: 'Bolinho crocante, recheio de queijo derretido.',
    description_fr: 'Boulette croustillante, farce de fromage fondant.',
    description_en: 'Crispy croquette with melted cheese filling.',
    price: 13,
  },
  {
    name_pt: 'Calabresa Acebolada',
    name_fr: 'Calabresa Acebolada',
    name_en: 'Grilled Calabrese Sausage',
    description_pt: 'Lingui\u00e7a calabresa grelhada com cebolas caramelizadas.',
    description_fr: 'Saucisse calabrese grill\u00e9e, oignons caram\u00e9lis\u00e9s.',
    description_en: 'Grilled Calabrese sausage with caramelized onions.',
    price: 17,
  },
  {
    name_pt: 'Torresmo',
    name_fr: 'Torresmo',
    name_en: 'Fried Pork Rinds',
    description_pt: 'Couro de porco frito, crocante por fora, macio por dentro.',
    description_fr: 'Couenne de porc frite, croustillante \u00e0 l\'ext\u00e9rieur.',
    description_en: 'Fried pork rinds, crispy on the outside.',
    price: 16,
  },
  {
    name_pt: 'Camar\u00e3o Empanado (6)',
    name_fr: 'Crevettes Pan\u00e9es (6)',
    name_en: 'Breaded Shrimp (6)',
    description_pt: 'Camar\u00f5es empanados e fritos, servidos com molho.',
    description_fr: 'Crevettes pan\u00e9es et frites, servies avec sauce.',
    description_en: 'Breaded and fried shrimp, served with dipping sauce.',
    price: 18,
    image_url: 'https://images.unsplash.com/photo-1582993728648-1f29c748e5ad?w=800&q=80&fit=crop&auto=format',
  },
  {
    name_pt: 'Asa de Frango (6)',
    name_fr: 'Ailes de Poulet (6)',
    name_en: 'Chicken Wings (6)',
    description_pt: 'Asas de frango temperadas e fritas.',
    description_fr: 'Ailes de poulet assaisonn\u00e9es et frites.',
    description_en: 'Seasoned and fried chicken wings.',
    price: 18,
    image_url: 'https://images.unsplash.com/photo-1571162437205-8889ff2fee26?w=800&q=80&fit=crop&auto=format',
  },
  {
    name_pt: 'Batata Frita',
    name_fr: 'Frites',
    name_en: 'French Fries',
    description_pt: 'Batatas fritas crocantes, temperadas na hora.',
    description_fr: 'Frites croustillantes, assaisonn\u00e9es sur commande.',
    description_en: 'Crispy french fries, seasoned to order.',
    price: 8,
    image_url: 'https://images.unsplash.com/photo-1630431341973-02e1b662ec35?w=800&q=80&fit=crop&auto=format',
  },
];

// ─── BROCHETTES / PLATS ─────────────────────────────────────

const plats_featured = {
  name_pt: 'Picanha',
  name_fr: 'Picanha',
  name_en: 'Picanha Steak',
  description_pt: 'Picanha grelhada na brasa, servida com fritas, farofa e vinagrete.',
  description_fr: 'Picanha grill\u00e9e au feu de bois, servie avec frites, farofa et vinaigrette.',
  description_en: 'Flame-grilled picanha steak, served with fries, farofa and vinaigrette.',
  price: 28,
  image_url: 'https://images.unsplash.com/photo-1558030137-a56c1b004fa3?w=800&q=80&fit=crop&auto=format',
  badge_pt: 'Grelhado na brasa', badge_fr: 'Grill\u00e9 au feu de bois', badge_en: 'Flame-grilled',
  featured: true,
  tagline_pt: 'O corte nobre do Brasil',
  tagline_fr: 'La coupe noble du Br\u00e9sil',
  tagline_en: 'Brazil\'s premium cut',
};

const plats_secondary = [
  {
    name_pt: 'Espeto de Frango',
    name_fr: 'Brochette de Poulet',
    name_en: 'Chicken Skewer',
    description_pt: 'Espeto de frango grelhado, servido com fritas, farofa e vinagrete.',
    description_fr: 'Brochette de poulet grill\u00e9, servie avec frites, farofa et vinaigrette.',
    description_en: 'Grilled chicken skewer, served with fries, farofa and vinaigrette.',
    price: 18,
  },
  {
    name_pt: 'Cora\u00e7\u00e3o de Frango',
    name_fr: 'C\u0153ur de Poulet',
    name_en: 'Chicken Heart Skewer',
    description_pt: 'Espeto de cora\u00e7\u00e3o de frango grelhado, servido com fritas, farofa e vinagrete.',
    description_fr: 'Brochette de c\u0153urs de poulet grill\u00e9s, servie avec frites, farofa et vinaigrette.',
    description_en: 'Grilled chicken heart skewer, served with fries, farofa and vinaigrette.',
    price: 17,
  },
  {
    name_pt: 'Queijo Coalho Grelhado',
    name_fr: 'Queijo Coalho Grill\u00e9',
    name_en: 'Grilled Coalho Cheese',
    description_pt: 'Queijo coalho grelhado importado do Brasil.',
    description_fr: 'Fromage grill\u00e9 import\u00e9 du Br\u00e9sil.',
    description_en: 'Grilled cheese imported from Brazil.',
    price: 20,
  },
];

// ─── DRINKS / BEBIDAS ───────────────────────────────────────

const drinks = [
  // ── Caipirinha & Cocktails ──
  {
    name_pt: 'Caipirinha', name_fr: 'Caipirinha', name_en: 'Caipirinha',
    description_pt: 'Cacha\u00e7a, lim\u00e3o, a\u00e7\u00facar e gelo. Verre $7 / Pichet $20.',
    description_fr: 'Cacha\u00e7a, lime, sucre et glace. Verre 7$ / Pichet 20$.',
    description_en: 'Cacha\u00e7a, lime, sugar and ice. Glass $7 / Pitcher $20.',
    price: 7,
    image_url: 'https://images.unsplash.com/photo-1644809818228-e29aa5aa8151?w=800&q=80&fit=crop&auto=format',
    featured: true,
    badge_pt: 'Cl\u00e1ssico', badge_fr: 'Classique', badge_en: 'Classic',
  },
  {
    name_pt: 'Caipiroska', name_fr: 'Caipiroska', name_en: 'Caipiroska',
    description_pt: 'Vodka, morangos, lim\u00e3o, a\u00e7\u00facar e gelo. Verre $9 / Pichet $25.',
    description_fr: 'Vodka, fraises, lime, sucre et glace. Verre 9$ / Pichet 25$.',
    description_en: 'Vodka, strawberries, lime, sugar and ice. Glass $9 / Pitcher $25.',
    price: 9,
    image_url: 'https://images.unsplash.com/photo-1581927692308-be9e43b4d860?w=800&q=80&fit=crop&auto=format',
    featured: true,
  },
  {
    name_pt: 'Sakerinha', name_fr: 'Sakerinha', name_en: 'Sakerinha',
    description_pt: 'Saqu\u00ea, morangos ou lim\u00e3o, a\u00e7\u00facar e gelo. Verre $9.50 / Pichet $27.',
    description_fr: 'Sak\u00e9, fraises ou lime, sucre et glace. Verre 9,50$ / Pichet 27$.',
    description_en: 'Sake, strawberries or lime, sugar and ice. Glass $9.50 / Pitcher $27.',
    price: 9.50,
  },
  {
    name_pt: 'Rio Sunset', name_fr: 'Rio Sunset', name_en: 'Rio Sunset',
    description_pt: 'Cura\u00e7au, suco de laranja e folhas de hortel\u00e3. Verre $9.50 / Pichet $27.',
    description_fr: 'Cura\u00e7ao, jus d\'orange et feuilles de menthe. Verre 9,50$ / Pichet 27$.',
    description_en: 'Cura\u00e7ao, orange juice and mint leaves. Glass $9.50 / Pitcher $27.',
    price: 9.50,
  },
  {
    name_pt: 'Xeque-Mate', name_fr: 'Xeque-Mate', name_en: 'Xeque-Mate',
    description_pt: 'Cacha\u00e7a, mate, guaran\u00e1 e suco de lim\u00e3o. Verre $11 / Pichet $31.',
    description_fr: 'Cacha\u00e7a, mat\u00e9, guaran\u00e1 et jus de lime. Verre 11$ / Pichet 31$.',
    description_en: 'Cacha\u00e7a, mate, guaran\u00e1 and lime juice. Glass $11 / Pitcher $31.',
    price: 11,
  },
  {
    name_pt: 'Amaz\u00f4nia', name_fr: 'Amaz\u00f4nia', name_en: 'Amaz\u00f4nia',
    description_pt: 'Cacha\u00e7a, frutas vermelhas, lim\u00e3o, a\u00e7\u00facar e gelo. Verre $11 / Pichet $31.',
    description_fr: 'Cacha\u00e7a, fraises ou lime, sucre et glace. Verre 11$ / Pichet 31$.',
    description_en: 'Cacha\u00e7a, berries, lime, sugar and ice. Glass $11 / Pitcher $31.',
    price: 11,
  },
  {
    name_pt: 'Matsunaga', name_fr: 'Matsunaga', name_en: 'Matsunaga',
    description_pt: 'Coquetel especial da casa.',
    description_fr: 'Cocktail sp\u00e9cial de la maison.',
    description_en: 'House special cocktail.',
    price: 13,
  },
  {
    name_pt: 'Borogod\u00f3', name_fr: 'Borogod\u00f3', name_en: 'Borogod\u00f3',
    description_pt: 'Cacha\u00e7a, tequila, suco de laranja, grenadina.',
    description_fr: 'Cacha\u00e7a, tequila, jus d\'orange, grenadine.',
    description_en: 'Cacha\u00e7a, tequila, orange juice, grenadine.',
    price: 15, featured: true,
  },

  // ── Shots ──
  {
    name_pt: 'Caipirinha Tradicional com Corona',
    name_fr: 'Ca\u00efpirinha Trad. Servie avec Corona',
    name_en: 'Traditional Caipirinha with Corona',
    description_pt: 'Caipirinha tradicional servida com uma Corona invertida.',
    description_fr: 'Ca\u00efpirinha trad. servie avec une Corona renvers\u00e9e.',
    description_en: 'Traditional Caipirinha served with an inverted Corona.',
    price: 8, featured: true,
  },

  // ── Draft Beers ──
  {
    name_pt: 'Corona Extra', name_fr: 'Corona Extra', name_en: 'Corona Extra',
    description_pt: 'Cerveja mexicana clara.',
    description_fr: 'Bi\u00e8re mexicaine blonde.',
    description_en: 'Mexican lager.',
    price: 9.50,
    image_url: 'https://images.unsplash.com/photo-1608742598121-15038a8db33c?w=800&q=80&fit=crop&auto=format',
    featured: true,
  },
  {
    name_pt: 'Corona Zero', name_fr: 'Corona Zero', name_en: 'Corona Zero',
    description_pt: 'Vers\u00e3o sem \u00e1lcool da Corona.',
    description_fr: 'Version sans alcool de la Corona.',
    description_en: 'Non-alcoholic version of Corona.',
    price: 8.50,
  },
  {
    name_pt: 'Balde Corona (5)',
    name_fr: 'Bucket Corona (5)',
    name_en: 'Corona Bucket (5)',
    description_pt: 'Balde com 5 Coronas.',
    description_fr: 'Seau de 5 Coronas.',
    description_en: 'Bucket of 5 Coronas.',
    price: 38,
  },

  // ── Bottled Beers ──
  {
    name_pt: 'Labatt 50', name_fr: 'Labatt 50', name_en: 'Labatt 50',
    description_pt: 'Cerveja canadense cl\u00e1ssica.',
    description_fr: 'Bi\u00e8re canadienne classique.',
    description_en: 'Classic Canadian beer.',
    price: 8,
  },
  {
    name_pt: 'Michelob Ultra', name_fr: 'Michelob Ultra', name_en: 'Michelob Ultra',
    description_pt: 'Cerveja leve e refrescante.',
    description_fr: 'Bi\u00e8re l\u00e9g\u00e8re et rafra\u00eechissante.',
    description_en: 'Light and refreshing beer.',
    price: 5,
  },
  {
    name_pt: 'Belle Mer', name_fr: 'Belle Mer', name_en: 'Belle Mer',
    description_pt: 'Cerveja artesanal canadense.',
    description_fr: 'Bi\u00e8re artisanale canadienne.',
    description_en: 'Canadian craft beer.',
    price: 3.50,
  },
  {
    name_pt: 'Chipie', name_fr: 'Chipie', name_en: 'Chipie',
    description_pt: 'Cerveja artesanal local.',
    description_fr: 'Bi\u00e8re artisanale locale.',
    description_en: 'Local craft beer.',
    price: 3.50,
  },
  {
    name_pt: 'Modelo', name_fr: 'Modelo', name_en: 'Modelo',
    description_pt: 'Cerveja mexicana tradicional.',
    description_fr: 'Bi\u00e8re mexicaine traditionnelle.',
    description_en: 'Traditional Mexican beer.',
    price: 3.50,
  },
  {
    name_pt: 'Stella Artois', name_fr: 'Stella Artois', name_en: 'Stella Artois',
    description_pt: 'Cerveja belga premium.',
    description_fr: 'Bi\u00e8re belge premium.',
    description_en: 'Premium Belgian beer.',
    price: 5,
  },

  // ── Ciders & Other ──
  {
    name_pt: 'Cidre / Lacroix Ros\u00e9',
    name_fr: 'Cidres / Lacroix Ros\u00e9',
    name_en: 'Cider / Lacroix Ros\u00e9',
    description_pt: 'Cidre ou Lacroix Ros\u00e9.',
    description_fr: 'Cidre ou Lacroix Ros\u00e9.',
    description_en: 'Cider or Lacroix Ros\u00e9.',
    price: 9.50,
  },
  {
    name_pt: '\u00c1gua com G\u00e1s',
    name_fr: 'Eau Petillante',
    name_en: 'Sparkling Water',
    description_pt: '\u00c1gua mineral com g\u00e1s.',
    description_fr: 'Eau min\u00e9rale gazeuse.',
    description_en: 'Sparkling mineral water.',
    price: 5,
  },

  // ── Soft Drinks ──
  {
    name_pt: 'Guaran\u00e1', name_fr: 'Guaran\u00e1', name_en: 'Guaran\u00e1',
    description_pt: 'Refrigerante brasileiro de guaran\u00e1.',
    description_fr: 'Soda br\u00e9silien au guarana.',
    description_en: 'Brazilian guaran\u00e1 soda.',
    price: 5, featured: true,
  },
  {
    name_pt: 'Coca-Cola', name_fr: 'Coca-Cola', name_en: 'Coca-Cola',
    description_pt: 'Refrigerante de cola.',
    description_fr: 'Soda cola.',
    description_en: 'Cola soda.',
    price: 3.50,
  },
  {
    name_pt: 'Coca-Cola Zero', name_fr: 'Coca-Cola Zero', name_en: 'Coca-Cola Zero',
    description_pt: 'Refrigerante de cola sem a\u00e7\u00facar.',
    description_fr: 'Soda cola sans sucre.',
    description_en: 'Sugar-free cola soda.',
    price: 3.50,
  },
  {
    name_pt: 'Sprite', name_fr: 'Sprite', name_en: 'Sprite',
    description_pt: 'Refrigerante de lim\u00e3o.',
    description_fr: 'Soda citron-lime.',
    description_en: 'Lemon-lime soda.',
    price: 3.50,
  },
  {
    name_pt: 'Suco de Laranja',
    name_fr: 'Jus d\'Orange',
    name_en: 'Orange Juice',
    description_pt: 'Suco de laranja natural.',
    description_fr: 'Jus d\'orange frais.',
    description_en: 'Fresh orange juice.',
    price: 5,
  },
];

// ─── GENERATE SQL ──────────────────────────────────────────────

let sql = `-- MIGRATION: Boteco PDF Menu
-- Run this in Supabase SQL Editor

-- Clear existing data
delete from menu_items;
delete from menu_categories;

-- 1. Menu Categories
insert into menu_categories (name_pt, name_fr, name_en, slug, sort_order) values
${CATEGORIES.map(c => `(${esc(c.name_pt)}, ${esc(c.name_fr)}, ${esc(c.name_en)}, ${esc(c.slug)}, ${c.sort_order})`).join(',\n')};

`;

let sort = 0;
const itemRows = [];

function addRow(catSlug, item, extra = {}) {
  itemRows.push(`(${catId(catSlug)}, ${esc(item.name_pt)}, ${esc(item.name_fr)}, ${esc(item.name_en)}, ${esc(item.description_pt)}, ${esc(item.description_fr)}, ${esc(item.description_en)}, ${item.price}, ${esc(item.image_url || null)}, ${esc(extra.badge_pt ?? item.badge_pt ?? null)}, ${esc(extra.badge_fr ?? item.badge_fr ?? null)}, ${esc(extra.badge_en ?? item.badge_en ?? null)}, ${bool(extra.featured ?? item.featured ?? false)}, ${esc(item.portion ?? null)}, ${esc(extra.tagline_pt ?? item.tagline_pt ?? null)}, ${esc(extra.tagline_fr ?? item.tagline_fr ?? null)}, ${esc(extra.tagline_en ?? item.tagline_en ?? null)}, ${sort}, true)`);
  sort++;
}

for (const item of entrees_featured) addRow('entrees', item, { featured: true });
for (const item of entrees_list) addRow('entrees', item);
addRow('plats', plats_featured, { featured: true, badge_pt: 'Grelhado na brasa', badge_fr: 'Grill\u00e9 au feu de bois', badge_en: 'Flame-grilled', tagline_pt: 'O corte nobre do Brasil', tagline_fr: 'La coupe noble du Br\u00e9sil', tagline_en: 'Brazil\'s premium cut' });
for (const item of plats_secondary) addRow('plats', item);
for (const item of drinks) addRow('bebidas', item);

sql += `-- 2. Menu Items (${sort} total)
insert into menu_items (category_id, name_pt, name_fr, name_en, description_pt, description_fr, description_en, price, image_url, badge_pt, badge_fr, badge_en, featured, portion, tagline_pt, tagline_fr, tagline_en, sort_order, active) values
${itemRows.join(',\n')};
`;

// ─── GENERATE local menu.json ──────────────────────────────────

const toLocalEnt = i => ({
  name_pt: i.name_pt, name_fr: i.name_fr, name_en: i.name_en,
  price: i.price,
  description_pt: i.description_pt, description_fr: i.description_fr, description_en: i.description_en,
  image_url: i.image_url, image: i.image_url || undefined,
  badge_pt: i.badge_pt ?? null, badge_fr: i.badge_fr ?? null, badge_en: i.badge_en ?? null,
  portion_pt: null, portion_fr: null, portion_en: null,
});

const toLocalDrink = i => ({
  type_pt: 'BEBIDA', type_fr: 'BOISSON', type_en: 'DRINK',
  name_pt: i.name_pt, name_fr: i.name_fr, name_en: i.name_en,
  description_pt: i.description_pt, description_fr: i.description_fr, description_en: i.description_en,
  price: i.price, image_url: i.image_url || null, image: i.image_url || undefined,
  featured: !!i.featured,
});

const localMenuJson = {
  categories: [
    { id: 'cat-1', label: 'Entr\u00e9es', default: false },
    { id: 'cat-2', label: 'Plats Principaux', default: false },
    { id: 'cat-3', label: 'Boissons', default: false },
    { id: 'cat-4', label: 'Desserts', default: false },
  ],
  entrees: {
    featured: entrees_featured.map(toLocalEnt),
    list: entrees_list.map(toLocalEnt),
  },
  plats: {
    featured: {
      name_pt: plats_featured.name_pt, name_fr: plats_featured.name_fr, name_en: plats_featured.name_en,
      price: plats_featured.price,
      description_pt: plats_featured.description_pt, description_fr: plats_featured.description_fr, description_en: plats_featured.description_en,
      image_url: plats_featured.image_url, image: plats_featured.image_url || undefined,
      badge_pt: plats_featured.badge_pt, badge_fr: plats_featured.badge_fr, badge_en: plats_featured.badge_en,
      tagline_pt: plats_featured.tagline_pt, tagline_fr: plats_featured.tagline_fr, tagline_en: plats_featured.tagline_en,
    },
    secondary: plats_secondary.map(i => ({
      name_pt: i.name_pt, name_fr: i.name_fr, name_en: i.name_en,
      price: i.price,
      description_pt: i.description_pt, description_fr: i.description_fr, description_en: i.description_en,
    })),
  },
  drinks_desserts: drinks.map(toLocalDrink),
};

// ─── WRITE OUTPUTS ─────────────────────────────────────────────

writeFileSync(resolve(__dirname, '..', 'scripts', 'pdf-menu-migration.sql'), sql);
writeFileSync(resolve(DATA_DIR, 'menu.json'), JSON.stringify(localMenuJson, null, 2));

console.log('Done! Generated:');
console.log('  scripts/pdf-menu-migration.sql');
console.log('  .local-data/menu.json');
console.log(`Total: ${sort} items (${entrees_featured.length} featured entr\u00e9es, ${entrees_list.length} entr\u00e9es, ${1 + plats_secondary.length} plats, ${drinks.length} drinks)`);
