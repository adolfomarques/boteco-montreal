import { NextRequest, NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/local-store';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'events';

export type LocalEvent = {
  id: string;
  day_label: string;
  day_label_pt: string;
  day_label_fr: string;
  day_label_en: string;
  title_pt: string;
  title_fr: string;
  title_en: string;
  description_pt: string;
  description_fr: string;
  description_en: string;
  time_range: string;
  icon: string;
  color: string;
  image_url: string | null;
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
      .from('events')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) return NextResponse.json(data);
  }
  const data = readStore<LocalEvent[]>(STORAGE_KEY, []);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { events?: any[] };
  if (!body.events) return NextResponse.json({ ok: true });

  if (isSupabaseConfigured()) {
    const { error: delErr } = await supabase.from('events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delErr) console.error('events clear error:', delErr);
    const { error } = await supabase.from('events').insert(body.events.map(e => ({
      day_label: e.day_label,
      title_pt: e.title_pt, title_fr: e.title_fr, title_en: e.title_en,
      description_pt: e.description_pt, description_fr: e.description_fr, description_en: e.description_en,
      time_range: e.time_range, icon: e.icon, color: e.color,
      image_url: e.image_url || null,
      sort_order: e.sort_order ?? 0, active: e.active ?? true,
    })));
    if (error) console.error('events insert error:', error);
  }
  writeStore(STORAGE_KEY, body.events);
  return NextResponse.json({ ok: true });
}
