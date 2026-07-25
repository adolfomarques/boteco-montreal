import { NextRequest, NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/local-store';
import { RESTAURANT } from '@/lib/data/restaurant';

const STORAGE_KEY = 'settings';

export type LocalSettings = typeof RESTAURANT;

export async function GET() {
  const data = readStore<LocalSettings>(STORAGE_KEY, RESTAURANT as unknown as LocalSettings);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<LocalSettings>;
  const current = readStore<LocalSettings>(STORAGE_KEY, RESTAURANT as unknown as LocalSettings);
  const merged = { ...current, ...body };
  writeStore(STORAGE_KEY, merged);
  return NextResponse.json({ ok: true });
}
