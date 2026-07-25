import { NextRequest, NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/local-store';

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

export async function GET() {
  const data = readStore<LocalEvent[]>(STORAGE_KEY, []);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { events?: LocalEvent[] };
  if (body.events) {
    writeStore(STORAGE_KEY, body.events);
  }
  return NextResponse.json({ ok: true });
}
