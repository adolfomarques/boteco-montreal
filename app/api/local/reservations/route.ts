import { NextRequest, NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/local-store';

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

export async function GET() {
  const data = readStore<LocalReservation[]>(STORAGE_KEY, []);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { reservations?: LocalReservation[] };
  if (body.reservations) {
    writeStore(STORAGE_KEY, body.reservations);
  }
  return NextResponse.json({ ok: true });
}
