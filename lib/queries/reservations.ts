import { supabase } from '../supabase';
import type { Reservation } from '../types';

export async function createReservation(reservation: Record<string, unknown>): Promise<Reservation> {
  const { data, error } = await supabase.from('reservations').insert(reservation).select().single();
  if (error) throw error;
  return data as unknown as Reservation;
}

export async function getReservations(): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as unknown as Reservation[];
}

export async function updateReservationStatus(id: string, status: string): Promise<Reservation> {
  const { data, error } = await supabase.from('reservations').update({ status }).eq('id', id).select().single();
  if (error) throw error;
  return data as unknown as Reservation;
}
