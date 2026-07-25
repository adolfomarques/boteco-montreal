import { supabase } from '../supabase';
import type { MenuCategory, MenuItem } from '../types';

export async function getMenuCategories(): Promise<MenuCategory[]> {
  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .order('sort_order');
  if (error) throw error;
  return data as unknown as MenuCategory[];
}

export async function getMenuItems(): Promise<(MenuItem & { category_slug: string })[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*, menu_categories!inner(slug)')
    .eq('active', true)
    .order('sort_order');
  if (error) throw error;
  return (data as unknown as (MenuItem & { menu_categories: { slug: string } })[]).map((item) => ({
    ...item,
    category_slug: item.menu_categories?.slug ?? '',
  }));
}

export async function createMenuItem(item: Record<string, unknown>): Promise<MenuItem> {
  const { data, error } = await supabase.from('menu_items').insert(item).select().single();
  if (error) throw error;
  return data as unknown as MenuItem;
}

export async function updateMenuItem(id: string, item: Record<string, unknown>): Promise<MenuItem> {
  const { data, error } = await supabase.from('menu_items').update(item).eq('id', id).select().single();
  if (error) throw error;
  return data as unknown as MenuItem;
}

export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  if (error) throw error;
}
