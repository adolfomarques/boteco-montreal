import { NextRequest, NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/local-store';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'gallery';

export type LocalGalleryItem = {
  id: string;
  type: 'image' | 'video';
  src: string;
  sort_order: number;
  active: boolean;
};

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return url.startsWith('https://') && !url.includes('your-project');
}

export async function GET() {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data && data.length > 0) return NextResponse.json(data);
  }
  const data = readStore<LocalGalleryItem[]>(STORAGE_KEY, []);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { items?: LocalGalleryItem[] };
  if (!body.items) return NextResponse.json({ ok: true });

  if (isSupabaseConfigured()) {
    const { error: delErr } = await supabase.from('gallery_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delErr && !delErr.message.includes('does not exist')) console.error('gallery clear error:', delErr);
    const { error } = await supabase.from('gallery_items').insert(body.items.map(i => ({
      type: i.type, src: i.src, sort_order: i.sort_order ?? 0,
      active: i.active ?? true,
    })));
    if (error && !error.message.includes('does not exist')) console.error('gallery insert error:', error);
  }
  writeStore(STORAGE_KEY, body.items);
  return NextResponse.json({ ok: true });
}
