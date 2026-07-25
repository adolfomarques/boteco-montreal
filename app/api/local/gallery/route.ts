import { NextRequest, NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/local-store';

const STORAGE_KEY = 'gallery';

export type LocalGalleryItem = {
  id: string;
  type: 'image' | 'video';
  src: string;
  sort_order: number;
  active: boolean;
};

export async function GET() {
  const data = readStore<LocalGalleryItem[]>(STORAGE_KEY, []);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { items?: LocalGalleryItem[] };
  if (body.items) {
    writeStore(STORAGE_KEY, body.items);
  }
  return NextResponse.json({ ok: true });
}
