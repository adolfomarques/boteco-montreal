import { NextRequest, NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/local-store';
import { supabase } from '@/lib/supabase';
import { CATEGORIES, ENTREES, PLATS, DRINKS_DESSERTS } from '@/lib/data/menu';

const STORAGE_KEY = 'menu';

interface StoredMenu {
  categories: typeof CATEGORIES;
  entrees: typeof ENTREES;
  plats: typeof PLATS;
  drinks_desserts: typeof DRINKS_DESSERTS;
}

const FALLBACK: StoredMenu = {
  categories: CATEGORIES,
  entrees: ENTREES,
  plats: PLATS,
  drinks_desserts: DRINKS_DESSERTS,
};

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return url.startsWith('https://') && !url.includes('your-project');
}

function deepMerge(target: any, source: any): any {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = result[key];
    if (
      sv !== null && sv !== undefined && !Array.isArray(sv) &&
      typeof sv === 'object' &&
      tv !== null && tv !== undefined && !Array.isArray(tv) &&
      typeof tv === 'object'
    ) {
      result[key] = deepMerge(tv, sv);
    } else {
      result[key] = sv;
    }
  }
  return result;
}

export async function GET() {
  if (isSupabaseConfigured()) {
    const [catRes, itemRes] = await Promise.all([
      supabase.from('menu_categories').select('*').order('sort_order'),
      supabase.from('menu_items').select('*, menu_categories!inner(slug)').eq('active', true).order('sort_order'),
    ]);

    if (!catRes.error && !itemRes.error && itemRes.data && itemRes.data.length > 0) {
      const rows = itemRes.data as unknown as (Record<string, unknown> & { menu_categories?: { slug: string } })[];
      const entrees = rows.filter(r => (r.menu_categories as { slug: string })?.slug === 'entrees');
      const plats = rows.filter(r => (r.menu_categories as { slug: string })?.slug === 'plats');
      const drinks = rows.filter(r => ['desserts', 'bebidas'].includes((r.menu_categories as { slug: string })?.slug ?? ''));

      const cats = (catRes.data || []).map(c => ({ id: c.slug, label: c.name_fr || c.name_en || c.name_pt, default: false }));

      const supabaseData = {
        categories: cats,
        entrees: {
          featured: entrees.filter(e => e.featured).map(mapToLocal),
          list: entrees.filter(e => !e.featured).map(mapToLocal),
        },
        plats: {
          featured: (() => {
            const f = plats.find(p => p.featured) || plats[0];
            return {
              name_pt: f?.name_pt as string || '', name_fr: f?.name_fr as string || '', name_en: f?.name_en as string || '',
              price: (f?.price as number) ?? 0,
              description_pt: f?.description_pt as string || '', description_fr: f?.description_fr as string || '', description_en: f?.description_en as string || '',
              image_url: (f?.image_url as string) || null,
              badge_pt: f?.badge_pt as string || null, badge_fr: f?.badge_fr as string || null, badge_en: f?.badge_en as string || null,
              tagline_pt: f?.tagline_pt as string || null, tagline_fr: f?.tagline_fr as string || null, tagline_en: f?.tagline_en as string || null,
            };
          })(),
          secondary: plats.filter(p => !p.featured && p !== (plats.find(x => x.featured) || plats[0])).map(mapToLocal),
        },
        drinks_desserts: drinks.map(d => ({
          type_pt: 'BEBIDA', type_fr: 'BOISSON', type_en: 'DRINK',
          name_pt: d.name_pt as string || '', name_fr: d.name_fr as string || '', name_en: d.name_en as string || '',
          description_pt: d.description_pt as string || '', description_fr: d.description_fr as string || '', description_en: d.description_en as string || '',
          price: (d.price as number) ?? 0,
          image_url: (d.image_url as string) || null,
          featured: !!(d.featured as boolean),
        })),
      };
      return NextResponse.json(supabaseData);
    }
  }
  const data = readStore<StoredMenu>(STORAGE_KEY, FALLBACK);
  return NextResponse.json(data);
}

function mapToLocal(item: Record<string, unknown>): Record<string, unknown> {
  return {
    name_pt: (item.name_pt as string) || '',
    name_fr: (item.name_fr as string) || '',
    name_en: (item.name_en as string) || '',
    price: (item.price as number) ?? 0,
    description_pt: (item.description_pt as string) || '',
    description_fr: (item.description_fr as string) || '',
    description_en: (item.description_en as string) || '',
    image_url: (item.image_url as string) || null,
    badge_pt: (item.badge_pt as string) || null,
    badge_fr: (item.badge_fr as string) || null,
    badge_en: (item.badge_en as string) || null,
    tagline_pt: (item.tagline_pt as string) || null,
    tagline_fr: (item.tagline_fr as string) || null,
    tagline_en: (item.tagline_en as string) || null,
    portion: (item.portion as string) || null,
  };
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<StoredMenu>;
  const current = readStore<StoredMenu>(STORAGE_KEY, FALLBACK);
  const merged = deepMerge(current, body);
  writeStore(STORAGE_KEY, merged);
  return NextResponse.json({ ok: true });
}
