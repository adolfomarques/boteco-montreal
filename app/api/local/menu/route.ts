import { NextRequest, NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/local-store';
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
  const data = readStore<StoredMenu>(STORAGE_KEY, FALLBACK);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<StoredMenu>;
  const current = readStore<StoredMenu>(STORAGE_KEY, FALLBACK);
  const merged = deepMerge(current, body);
  writeStore(STORAGE_KEY, merged);
  return NextResponse.json({ ok: true });
}
