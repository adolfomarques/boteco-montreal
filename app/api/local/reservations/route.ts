import { NextRequest, NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/local-store';
import { supabase } from '@/lib/supabase';

const STORAGE_KEY = 'reservations';

export type LocalReservation = {
  id: string;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  name: string;
  phone: string;
  email: string;
  special_requests: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
};

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return url.startsWith('https://') && !url.includes('your-project');
}

export async function GET() {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) return NextResponse.json(data);
  }
  const data = readStore<LocalReservation[]>(STORAGE_KEY, []);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { reservations?: any[] };
  if (body.reservations) {
    writeStore(STORAGE_KEY, body.reservations);
  }
  return NextResponse.json({ ok: true });
}
