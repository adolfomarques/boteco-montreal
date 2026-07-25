import { supabase } from '../supabase';
import type { Event } from '../types';

export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('active', true)
    .order('sort_order');
  if (error) throw error;
  return data as unknown as Event[];
}

export async function createEvent(event: Record<string, unknown>): Promise<Event> {
  const { data, error } = await supabase.from('events').insert(event).select().single();
  if (error) throw error;
  return data as unknown as Event;
}

export async function updateEvent(id: string, event: Record<string, unknown>): Promise<Event> {
  const { data, error } = await supabase.from('events').update(event).eq('id', id).select().single();
  if (error) throw error;
  return data as unknown as Event;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}
