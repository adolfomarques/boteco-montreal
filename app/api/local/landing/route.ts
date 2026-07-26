import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const LANDING_KEY = 'landing_featured';

export interface LandingItem {
  name_pt: string;
  name_fr: string;
  name_en: string;
  description_pt: string;
  description_fr: string;
  description_en: string;
  image_url: string;
}

export interface LandingSettings {
  items: LandingItem[];
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return url.startsWith('https://') && !url.includes('your-project');
}

const FALLBACK: LandingSettings = {
  items: [
    {
      name_pt: 'Pão de Queijo', name_fr: 'Pão de Queijo', name_en: 'Cheese Bread',
      description_pt: 'Pãezinhos de queijo crocantes por fora e macios por dentro. Feitos com amor.',
      description_fr: 'Petits pains au fromage croustillants à l\'extérieur et moelleux à l\'intérieur. Fait maison avec amour.',
      description_en: 'Crispy on the outside, soft on the inside cheese bread. Made with love.',
      image_url: 'https://images.unsplash.com/photo-1773399159824-5a63848662d2?w=800&q=80&fit=crop&auto=format',
    },
    {
      name_pt: 'Calabresa Acebolada', name_fr: 'Calabresa Acebolada', name_en: 'Grilled Calabrese Sausage',
      description_pt: 'Linguiça calabresa grelhada com cebolas caramelizadas. O clássico indispensável de todo boteco.',
      description_fr: 'Saucisse calabraise grillée avec oignons caramélisés. Le classique indispensable de tout vrai boteco.',
      description_en: 'Grilled Calabrese sausage with caramelized onions. The essential classic of any real boteco.',
      image_url: 'https://images.unsplash.com/photo-1695089028198-80245e2f5d06?w=800&q=80&fit=crop&auto=format',
    },
    {
      name_pt: 'Coxinha', name_fr: 'Coxinha', name_en: 'Coxinha',
      description_pt: 'Croquete de frango desfiado com queijo cremoso, envolto em uma crosta perfeitamente dourada.',
      description_fr: 'Croquette de poulet effiloché avec fromage crémeux, enveloppée dans une croûte parfaitement dorée.',
      description_en: 'Shredded chicken croquette with creamy cheese, wrapped in a perfectly golden crust.',
      image_url: 'https://images.unsplash.com/photo-1700353763351-cb61036f3232?w=800&q=80&fit=crop&auto=format',
    },
  ],
};

export async function GET() {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', LANDING_KEY)
      .maybeSingle();
    if (!error && data?.value) {
      const settings = data.value as unknown as LandingSettings;
      if (settings?.items?.length > 0) return NextResponse.json(settings);
    }
    // Fallback: build from featured items
    const { data: items, error: itemsErr } = await supabase
      .from('menu_items')
      .select('*, menu_categories!inner(slug)')
      .eq('active', true)
      .eq('featured', true)
      .eq('menu_categories.slug', 'entrees')
      .order('sort_order')
      .limit(3);
    if (!itemsErr && items && items.length > 0) {
      return NextResponse.json({
        items: items.map(i => ({
          name_pt: i.name_pt || '', name_fr: i.name_fr || '', name_en: i.name_en || '',
          description_pt: i.description_pt || '', description_fr: i.description_fr || '', description_en: i.description_en || '',
          image_url: i.image_url || '',
        })),
      });
    }
  }
  return NextResponse.json(FALLBACK);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LandingSettings;
    if (!body?.items || !Array.isArray(body.items)) {
      return NextResponse.json({ error: 'invalid payload' }, { status: 400 });
    }
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: LANDING_KEY, value: body as unknown as Record<string, unknown> }, { onConflict: 'key' });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
