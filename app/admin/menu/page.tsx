'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { isSupabaseConfigured } from '@/components/admin/AuthProvider';
import { CATEGORIES, ENTREES, PLATS, DRINKS_DESSERTS } from '@/lib/data/menu';

const STORAGE_KEY = 'boteco_admin_menu_items';
const CATEGORIES_KEY = 'boteco_admin_categories';

type LangKey = 'pt' | 'fr' | 'en';

interface MenuItemRow {
  id: string;
  name_pt: string;
  name_fr: string;
  name_en: string;
  description_pt: string;
  description_fr: string;
  description_en: string;
  price: number;
  image_url: string | null;
  category_id: string;
  category_name: string;
  featured: boolean;
  active: boolean;
  sort_order: number;
}

interface Category {
  id: string;
  name_pt: string;
  name_fr: string;
  name_en: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name_pt: 'Entradas', name_fr: 'Entrées', name_en: 'Starters' },
  { id: 'cat-2', name_pt: 'Pratos Principais', name_fr: 'Plats Principaux', name_en: 'Main Courses' },
  { id: 'cat-3', name_pt: 'Bebidas', name_fr: 'Boissons', name_en: 'Beverages' },
  { id: 'cat-4', name_pt: 'Sobremesas', name_fr: 'Desserts', name_en: 'Desserts' },
];

function buildInitialItems(cats: Category[]): MenuItemRow[] {
  const items: MenuItemRow[] = [];
  let order = 1;

  for (const e of ENTREES.featured) {
    const cat = cats.find(c => c.id === 'cat-1')!;
    items.push({
      id: `seed_${order}`, name_pt: e.name_pt || '', name_fr: e.name_fr || '', name_en: e.name_en || '',
      description_pt: e.description_pt || '', description_fr: e.description_fr || '', description_en: e.description_en || '',
      price: e.price, image_url: (e as any).image || null,
      category_id: cat.id, category_name: getCatName(cat),
      featured: true, active: true, sort_order: order++,
    });
  }

  for (const e of ENTREES.list) {
    const cat = cats.find(c => c.id === 'cat-1')!;
    items.push({
      id: `seed_${order}`, name_pt: e.name_pt || '', name_fr: e.name_fr || '', name_en: e.name_en || '',
      description_pt: e.description_pt || '', description_fr: e.description_fr || '', description_en: e.description_en || '',
      price: e.price, image_url: (e as any).image || null,
      category_id: cat.id, category_name: getCatName(cat),
      featured: false, active: true, sort_order: order++,
    });
  }

  const platFeatured = PLATS.featured;
  const cat2 = cats.find(c => c.id === 'cat-2')!;
  items.push({
    id: `seed_${order}`, name_pt: platFeatured.name_pt || '', name_fr: platFeatured.name_fr || '', name_en: platFeatured.name_en || '',
    description_pt: platFeatured.description_pt || '', description_fr: platFeatured.description_fr || '', description_en: platFeatured.description_en || '',
    price: platFeatured.price, image_url: (platFeatured as any).image || null,
    category_id: cat2.id, category_name: getCatName(cat2),
    featured: true, active: true, sort_order: order++,
  });

  for (const p of PLATS.secondary) {
    items.push({
      id: `seed_${order}`, name_pt: p.name_pt || '', name_fr: p.name_fr || '', name_en: p.name_en || '',
      description_pt: p.description_pt || '', description_fr: p.description_fr || '', description_en: p.description_en || '',
      price: p.price, image_url: (p as any).image || null,
      category_id: cat2.id, category_name: getCatName(cat2),
      featured: false, active: true, sort_order: order++,
    });
  }

  for (const d of DRINKS_DESSERTS) {
    const catId = d.name_pt === 'Brigadeiro' || d.name_pt === 'Quindim' ? 'cat-4' : 'cat-3';
    const cat = cats.find(c => c.id === catId)!;
    items.push({
      id: `seed_${order}`, name_pt: d.name_pt || '', name_fr: d.name_fr || '', name_en: d.name_en || '',
      description_pt: d.description_pt || '', description_fr: d.description_fr || '', description_en: d.description_en || '',
      price: d.price, image_url: (d as any).image || null,
      category_id: cat.id, category_name: getCatName(cat),
      featured: !!(d as any).featured, active: true, sort_order: order++,
    });
  }

  return items;
}

let idCounter = Date.now();
function newId(): string { return `item_${idCounter++}`; }
function newCatId(): string { return `cat_${idCounter++}`; }

function formatPrice(n: number): string {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2 }).format(n);
}

function getDisplayName(item: MenuItemRow): string {
  return item.name_pt || item.name_fr || item.name_en || 'Sem nome';
}

function getDisplayDesc(item: MenuItemRow): string {
  return item.description_pt || item.description_fr || item.description_en || '';
}

function getCatName(cat: { name_pt?: string; name_fr?: string; name_en?: string }): string {
  return cat.name_fr || cat.name_pt || cat.name_en || 'Sem categoria';
}

type ToastKind = 'success' | 'error' | 'info';

function useToast() {
  const [toasts, setToasts] = useState<{ id: number; msg: string; kind: ToastKind }[]>([]);
  const nextId = useRef(0);

  const toast = useCallback((msg: string, kind: ToastKind = 'success') => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { id, msg, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const ToastContainer = useCallback(() => {
    if (toasts.length === 0) return null;
    return (
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto px-5 py-3 rounded-xl shadow-2xl border text-sm font-bold flex items-center gap-3 animate-[slideIn_0.3s_ease-out] ${
              t.kind === 'success'
                ? 'bg-secondary/20 border-secondary/40 text-secondary'
                : t.kind === 'error'
                ? 'bg-error/20 border-error/40 text-error'
                : 'bg-surface-container-highest border-outline-variant text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {t.kind === 'success' ? 'check_circle' : t.kind === 'error' ? 'error' : 'info'}
            </span>
            {t.msg}
          </div>
        ))}
      </div>
    );
  }, [toasts]);

  return { toast, ToastContainer };
}

const EMPTY_FORM: Omit<MenuItemRow, 'id'> = {
  name_pt: '', name_fr: '', name_en: '',
  description_pt: '', description_fr: '', description_en: '',
  price: 0, image_url: null,
  category_id: '', category_name: '',
  featured: false, active: true, sort_order: 0,
};

function findExistingImage(arr: any[], namePt: string): string | null {
  const match = arr.find((x: any) => x.name_pt === namePt || x.name_en === namePt || x.name_fr === namePt);
  if (match) return match.image_url || match.image || null;
  return null;
}

export default function AdminMenuPage() {
  const { t } = useLanguage();
  const { toast, ToastContainer } = useToast();

  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<MenuItemRow, 'id'>>({ ...EMPTY_FORM });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showCatManager, setShowCatManager] = useState(false);
  const [showGlobalPrice, setShowGlobalPrice] = useState(false);
  const [globalPricePct, setGlobalPricePct] = useState(0);
  const [catForm, setCatForm] = useState<Category>({ id: '', name_pt: '', name_fr: '', name_en: '' });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) {
        const stored = localStorage.getItem(STORAGE_KEY);
        const storedCats = localStorage.getItem(CATEGORIES_KEY);
        let cats: Category[];
        if (storedCats) cats = JSON.parse(storedCats) as Category[];
        else cats = DEFAULT_CATEGORIES;
        setCategories(cats);
        if (stored) {
          const parsed = JSON.parse(stored) as MenuItemRow[];
          const hasAnyImage = parsed.some(i => i.image_url);
          setItems(hasAnyImage ? parsed : buildInitialItems(cats));
        } else setItems(buildInitialItems(cats));
        setLoading(false);
        return;
      }
      const [catRes, itemRes] = await Promise.all([
        supabase.from('menu_categories').select('*').order('sort_order'),
        supabase.from('menu_items').select('*, menu_categories!inner(name_fr, name_pt, name_en)').order('sort_order'),
      ]);
      if (catRes.data) setCategories(catRes.data as unknown as Category[]);
      if (itemRes.data) {
        setItems((itemRes.data as unknown as (Record<string, unknown> & { menu_categories: Record<string, string> })[]).map((r) => ({
          id: r.id as string,
          name_pt: (r.name_pt as string) ?? '',
          name_fr: (r.name_fr as string) ?? '',
          name_en: (r.name_en as string) ?? '',
          description_pt: (r.description_pt as string) ?? '',
          description_fr: (r.description_fr as string) ?? '',
          description_en: (r.description_en as string) ?? '',
          price: (r.price as number) ?? 0,
          image_url: (r.image_url as string) ?? null,
          category_id: r.category_id as string,
          category_name: (r.menu_categories?.name_fr as string) ?? '',
          featured: (r.featured as boolean) ?? false,
          active: (r.active as boolean) ?? true,
          sort_order: (r.sort_order as number) ?? 0,
        })));
      }
      setLoading(false);
    }
    load();
  }, []);

  function persist(data: { items: MenuItemRow[]; categories: Category[] }) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.items));
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(data.categories));
    syncMenuToApi(data.items, data.categories);
  }

  async function syncMenuToApi(menuItems: MenuItemRow[], cats: Category[]) {
    try {
      const res = await fetch('/api/local/menu');
      const existing = res.ok ? await res.json() : { categories: [], entrees: { featured: [], list: [] }, plats: {}, drinks_desserts: [] };

      const cat1Items = menuItems.filter(i => i.category_id === cats[0]?.id || i.category_id === 'cat-1');
      const cat2Items = menuItems.filter(i => i.category_id === (cats[1]?.id || 'cat-2'));
      const cat3Items = menuItems.filter(i => i.category_id === (cats[2]?.id || 'cat-3'));
      const cat4Items = menuItems.filter(i => i.category_id === (cats[3]?.id || 'cat-4'));
      const drinksItems = [...cat3Items, ...cat4Items];

      function findExistingImg(namePt: string): string | null {
        const match = menuItems.find(i => i.name_pt === namePt || i.name_en === namePt);
        return match?.image_url || null;
      }

      const payload = {
        categories: cats.map(c => ({ id: c.id, label: getCatName(c), default: false })),
        entrees: {
          featured: cat1Items.filter(i => i.featured).slice(0, 3).map(i => ({
            name_pt: i.name_pt, name_fr: i.name_fr, name_en: i.name_en,
            price: i.price,
            description_pt: i.description_pt, description_fr: i.description_fr, description_en: i.description_en,
            image_url: i.image_url || findExistingImage(existing.entrees?.featured || [], i.name_pt) || null,
            image: i.image_url || findExistingImage(existing.entrees?.featured || [], i.name_pt) || undefined,
          })),
          list: cat1Items.filter(i => !i.featured).map(i => ({
            name_pt: i.name_pt, name_fr: i.name_fr, name_en: i.name_en,
            price: i.price,
            description_pt: i.description_pt, description_fr: i.description_fr, description_en: i.description_en,
            image_url: i.image_url || findExistingImage(existing.entrees?.list || [], i.name_pt) || null,
            image: i.image_url || findExistingImage(existing.entrees?.list || [], i.name_pt) || undefined,
          })),
        },
        plats: cat2Items.length > 0 ? {
          featured: (() => {
            const f = cat2Items.find(i => i.featured) || cat2Items[0];
            return {
              name_pt: f.name_pt, name_fr: f.name_fr, name_en: f.name_en,
              price: f.price,
              description_pt: f.description_pt, description_fr: f.description_fr, description_en: f.description_en,
              image_url: f.image_url || (existing.plats?.featured ? (existing.plats.featured as any).image_url || (existing.plats.featured as any).image : null) || null,
              image: f.image_url || (existing.plats?.featured ? (existing.plats.featured as any).image_url || (existing.plats.featured as any).image : null) || undefined,
            };
          })(),
          secondary: cat2Items.filter(i => !i.featured && i !== cat2Items.find(x => x.featured) && i !== cat2Items[0]).map(i => ({
            name_pt: i.name_pt, name_fr: i.name_fr, name_en: i.name_en,
            price: i.price,
            description_pt: i.description_pt, description_fr: i.description_fr, description_en: i.description_en,
          })),
        } : existing.plats,
        drinks_desserts: drinksItems.length > 0 ? drinksItems.map(i => ({
          type_pt: i.category_id === (cats[3]?.id || 'cat-4') ? 'SOBREMESA' : 'BEBIDA ASSINATURA',
          type_fr: i.category_id === (cats[3]?.id || 'cat-4') ? 'DESSERT' : 'BOISSON SIGNATURE',
          type_en: i.category_id === (cats[3]?.id || 'cat-4') ? 'DESSERT' : 'SIGNATURE DRINK',
          name_pt: i.name_pt, name_fr: i.name_fr, name_en: i.name_en,
          description_pt: i.description_pt, description_fr: i.description_fr, description_en: i.description_en,
          price: i.price,
          image_url: i.image_url || null,
          image: i.image_url || undefined,
          featured: i.featured,
        })) : existing.drinks_desserts,
      };

      await fetch('/api/local/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (isSupabaseConfigured()) {
        const catMap: Record<string, string> = {};
        for (const catSlug of ['entrees', 'plats', 'desserts', 'bebidas']) {
          const { data } = await supabase.from('menu_categories').select('id').eq('slug', catSlug).maybeSingle();
          if (data) {
            if (catSlug === 'entrees') { catMap[cats[0]?.id] = data.id; catMap['cat-1'] = data.id; }
            if (catSlug === 'plats') { catMap[cats[1]?.id] = data.id; catMap['cat-2'] = data.id; }
            if (catSlug === 'bebidas') { catMap[cats[3]?.id] = data.id; catMap['cat-3'] = data.id; }
            if (catSlug === 'desserts') { catMap[cats[2]?.id] = data.id; catMap['cat-4'] = data.id; }
          }
        }
        const rows = menuItems.filter(i => i.name_pt).map(i => ({
          category_id: catMap[i.category_id] || catMap[cats[0]?.id] || '',
          name_pt: i.name_pt, name_fr: i.name_fr, name_en: i.name_en,
          description_pt: i.description_pt, description_fr: i.description_fr, description_en: i.description_en,
          price: i.price, image_url: i.image_url || null,
          featured: i.featured ?? false, sort_order: i.sort_order ?? 0, active: i.active ?? true,
        }));
        const { error: delErr } = await supabase.from('menu_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (delErr) { console.error('menu_items clear error:', delErr); return; }
        const { error } = await supabase.from('menu_items').insert(rows);
        if (error) console.error('menu_items insert error:', error);
      }
    } catch {}
  }

  function replaceItems(newItems: MenuItemRow[]) {
    setItems(newItems);
    persist({ items: newItems, categories });
  }

  function replaceCats(newCats: Category[]) {
    setCategories(newCats);
    persist({ items, categories: newCats });
  }

  function openNew() {
    const firstCat = categories[0];
    setForm({
      name_pt: '', name_fr: '', name_en: '',
      description_pt: '', description_fr: '', description_en: '',
      price: 0, image_url: null,
      category_id: firstCat?.id ?? '',
      category_name: firstCat ? getCatName(firstCat) : '',
      featured: false, active: true,
      sort_order: items.length + 1,
    });
    setEditingId(null);
    setSelectedImage(null);
    setShowModal(true);
  }

  function openEdit(item: MenuItemRow) {
    setForm({
      name_pt: item.name_pt, name_fr: item.name_fr, name_en: item.name_en,
      description_pt: item.description_pt, description_fr: item.description_fr, description_en: item.description_en,
      price: item.price,
      image_url: item.image_url,
      category_id: item.category_id,
      category_name: item.category_name,
      featured: item.featured,
      active: item.active,
      sort_order: item.sort_order,
    });
    setEditingId(item.id);
    setSelectedImage(item.image_url);
    setShowModal(true);
  }

  function updateForm(field: string, value: string | number | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'category_id') {
      const cat = categories.find(c => c.id === value);
      if (cat) setForm((prev) => ({ ...prev, category_name: getCatName(cat) }));
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const record = { ...form, image_url: form.image_url || null };

    let updated: MenuItemRow[];
    if (editingId) {
      updated = items.map((it) => (it.id === editingId ? { ...it, ...record, id: editingId } : it));
    } else {
      const newItem: MenuItemRow = { ...record, id: newId() };
      updated = [...items, newItem];
    }
    replaceItems(updated);
    setShowModal(false);
    toast(editingId ? 'Item atualizado com sucesso' : 'Item adicionado com sucesso');
  }

  function handleDelete(id: string) {
    const updated = items.filter((it) => it.id !== id);
    replaceItems(updated);
    setShowDeleteConfirm(null);
    toast('Item excluído com sucesso', 'info');
  }

  function duplicateItem(item: MenuItemRow) {
    const newItem: MenuItemRow = {
      ...item,
      id: newId(),
      name_pt: `${item.name_pt} (cópia)`,
      name_fr: `${item.name_fr} (copie)`,
      name_en: `${item.name_en} (copy)`,
      sort_order: items.length + 1,
    };
    replaceItems([...items, newItem]);
    toast('Item duplicado com sucesso');
  }

  function moveItem(id: string, direction: 'left' | 'right') {
    const fIdx = filtered.findIndex((i) => i.id === id);
    if (fIdx === -1) return;
    if (direction === 'left' && fIdx === 0) return;
    if (direction === 'right' && fIdx === filtered.length - 1) return;
    const targetId = filtered[direction === 'left' ? fIdx - 1 : fIdx + 1].id;
    const idxA = items.findIndex((i) => i.id === id);
    const idxB = items.findIndex((i) => i.id === targetId);
    if (idxA === -1 || idxB === -1) return;
    const swapped = [...items];
    [swapped[idxA], swapped[idxB]] = [swapped[idxB], swapped[idxA]];
    replaceItems(swapped);
  }

  function handleReorder(reordered: MenuItemRow[]) {
    const reorderedIds = new Set(reordered.map((r) => r.id));
    const newItems = items.map((item) => (reorderedIds.has(item.id) ? null : item));
    let ri = 0;
    for (let i = 0; i < newItems.length; i++) {
      if (newItems[i] === null) {
        newItems[i] = { ...reordered[ri], sort_order: i + 1 };
        ri++;
      }
    }
    replaceItems(newItems as MenuItemRow[]);
  }

  const dragIdRef = useRef<string | null>(null);

  function handleDragStart(ev: React.DragEvent, id: string) {
    dragIdRef.current = id;
    ev.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(ev: React.DragEvent, id: string) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(ev: React.DragEvent, targetId: string) {
    ev.preventDefault();
    const sourceId = dragIdRef.current;
    if (!sourceId || sourceId === targetId) return;
    const fFrom = filtered.findIndex((i) => i.id === sourceId);
    const fTo = filtered.findIndex((i) => i.id === targetId);
    if (fFrom === -1 || fTo === -1) return;
    const reordered = [...filtered];
    const [moved] = reordered.splice(fFrom, 1);
    reordered.splice(fTo, 0, moved);
    handleReorder(reordered);
    dragIdRef.current = null;
  }

  function toggleActive(item: MenuItemRow) {
    const updated = items.map((it) => (it.id === item.id ? { ...it, active: !it.active } : it));
    replaceItems(updated);
  }

  function toggleFeatured(item: MenuItemRow) {
    const updated = items.map((it) => (it.id === item.id ? { ...it, featured: !it.featured } : it));
    replaceItems(updated);
  }

  function applyGlobalPriceAdjustment() {
    if (!globalPricePct || globalPricePct === 0) return;
    const multiplier = 1 + globalPricePct / 100;
    const updated = items.map((it) => ({ ...it, price: Math.round(it.price * multiplier * 100) / 100 }));
    replaceItems(updated);
    setShowGlobalPrice(false);
    setGlobalPricePct(0);
    toast(`Preços ajustados em ${globalPricePct > 0 ? '+' : ''}${globalPricePct}%`);
  }

  function openNewCat() {
    setCatForm({ id: newCatId(), name_pt: '', name_fr: '', name_en: '' });
    setEditingCatId(null);
  }

  function openEditCat(cat: Category) {
    setCatForm({ ...cat });
    setEditingCatId(cat.id);
  }

  function handleSaveCat() {
    if (!catForm.name_pt && !catForm.name_fr && !catForm.name_en) {
      toast('Preencha pelo menos um nome', 'error');
      return;
    }
    let updated: Category[];
    if (editingCatId) {
      updated = categories.map((c) => (c.id === editingCatId ? { ...catForm } : c));
    } else {
      updated = [...categories, { ...catForm }];
    }
    replaceCats(updated);
    setCatForm({ id: '', name_pt: '', name_fr: '', name_en: '' });
    setEditingCatId(null);
    toast(editingCatId ? 'Categoria atualizada' : 'Categoria criada');
  }

  function handleDeleteCat(id: string) {
    const inUse = items.some((it) => it.category_id === id);
    if (inUse) {
      toast('Não é possível excluir: existem itens nesta categoria', 'error');
      return;
    }
    replaceCats(categories.filter((c) => c.id !== id));
    toast('Categoria excluída', 'info');
  }

  const filtered = items.filter((item) => {
    if (activeCategoryFilter && item.category_id !== activeCategoryFilter) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.name_pt.toLowerCase().includes(q) ||
      item.name_fr.toLowerCase().includes(q) ||
      item.name_en.toLowerCase().includes(q) ||
      item.description_pt.toLowerCase().includes(q) ||
      item.description_fr.toLowerCase().includes(q) ||
      item.description_en.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: items.length,
    active: items.filter((i) => i.active).length,
    inactive: items.filter((i) => !i.active).length,
    featured: items.filter((i) => i.featured).length,
  };

  if (loading) {
    return (
      <>
        <AdminTopBar title="Menu Management" />
      <div className="p-gutter max-w-container-max w-full mx-auto space-y-4 pb-24">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-card rounded-xl p-6 animate-pulse">
              <div className="flex gap-6">
                <div className="w-32 h-32 bg-surface-container-high rounded-xl" />
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-48 bg-surface-container-high rounded" />
                  <div className="h-4 w-32 bg-surface-container-high rounded" />
                  <div className="h-4 w-full bg-surface-container-high rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <AdminTopBar title="Menu Management" />
      <ToastContainer />

      <div className="p-gutter max-w-container-max w-full mx-auto space-y-4 pb-24">

        {/* Stats Bar */}
        <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button onClick={() => setActiveCategoryFilter(null)} className={`glass-card p-3 rounded-xl text-left transition-all ${!activeCategoryFilter ? 'ring-2 ring-secondary' : 'hover:border-secondary/40'}`}>
            <p className="font-label-caps text-[10px] text-on-surface-variant">Total</p>
            <p className="text-xl font-bold text-on-surface">{stats.total}</p>
          </button>
          <button onClick={() => setActiveCategoryFilter(null)} className="glass-card p-3 rounded-xl text-left hover:border-secondary/40">
            <p className="font-label-caps text-[10px] text-on-surface-variant">Ativos</p>
            <p className="text-xl font-bold text-primary">{stats.active}</p>
          </button>
          <button onClick={() => setActiveCategoryFilter(null)} className="glass-card p-3 rounded-xl text-left hover:border-secondary/40">
            <p className="font-label-caps text-[10px] text-on-surface-variant">Inativos</p>
            <p className="text-xl font-bold text-on-surface-variant">{stats.inactive}</p>
          </button>
          <button onClick={() => setActiveCategoryFilter(null)} className="glass-card p-3 rounded-xl text-left hover:border-secondary/40">
            <p className="font-label-caps text-[10px] text-on-surface-variant">Destaques</p>
            <p className="text-xl font-bold text-secondary">{stats.featured}</p>
          </button>
          <button onClick={() => setShowGlobalPrice(true)} className="glass-card p-3 rounded-xl text-left hover:border-secondary/40 group cursor-pointer" title="Ajuste global de preços">
            <p className="font-label-caps text-[10px] text-on-surface-variant group-hover:text-secondary transition-colors">Preços</p>
            <p className="text-xl font-bold text-on-surface-variant group-hover:text-secondary transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">euro</span>
            </p>
          </button>
        </section>

        {!isSupabaseConfigured() && (
          <div className="bg-secondary/10 text-secondary p-3 rounded-lg text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">cloud_off</span>
            Modo local — dados salvos no navegador. Conecte o Supabase para persistência remota.
          </div>
        )}

        {/* Toolbar */}
        <section className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategoryFilter(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-label-caps transition-all ${
                !activeCategoryFilter
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-surface-container-highest text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-label-caps transition-all ${
                  activeCategoryFilter === cat.id
                    ? 'bg-secondary text-on-secondary'
                    : 'bg-surface-container-highest text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {getCatName(cat)}
              </button>
            ))}
            <button
              onClick={() => setShowCatManager(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold font-label-caps bg-surface-container-highest text-secondary hover:bg-secondary/20 transition-all flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">edit</span>
              Categorias
            </button>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
              <input
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl pl-9 pr-4 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50"
                placeholder="Buscar por nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              )}
            </div>
            <button
              onClick={openNew}
              className="flex items-center gap-1.5 px-4 py-2 bg-secondary text-on-secondary rounded-xl text-sm font-bold hover:scale-105 transition-transform active:scale-95 whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Novo Item
            </button>
          </div>
        </section>

        {/* Items Grid / Empty State */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-surface-container-high flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant">restaurant_menu</span>
            </div>
            {searchQuery || activeCategoryFilter ? (
              <>
                <p className="text-headline-sm text-on-surface mb-2">Nenhum resultado encontrado</p>
                <p className="text-on-surface-variant">Tente ajustar sua busca ou filtro.</p>
              </>
            ) : (
              <>
                <p className="text-headline-sm text-on-surface mb-2">Cardápio vazio</p>
                <p className="text-on-surface-variant mb-6">Adicione seu primeiro item ao menu do Boteco.</p>
                <button onClick={openNew} className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-on-secondary rounded-xl font-bold hover:scale-105 transition-transform active:scale-95">
                  <span className="material-symbols-outlined">add</span>
                  Adicionar Item
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map((item) => (
              <motion.div key={item.id} layout className={`glass-card rounded-xl overflow-hidden group ${!item.active ? 'opacity-60' : ''}`}>
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragOver={(e) => handleDragOver(e, item.id)}
                  onDrop={(e) => handleDrop(e, item.id)}
                  onDragEnd={() => { dragIdRef.current = null; }}
                  className={`cursor-grab active:cursor-grabbing ${dragIdRef.current === item.id ? 'opacity-30' : ''}`}
                >
                  {/* Image */}
                  <div className="relative h-32 bg-surface-container-high overflow-hidden cursor-pointer" onClick={() => openEdit(item)}>
                    {item.image_url ? (
                      <Image className="object-cover group-hover:scale-105 transition-transform duration-500" src={item.image_url} alt={getDisplayName(item)} fill sizes="(max-width: 768px) 100vw, 400px" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-5xl text-surface-variant">restaurant</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-2 right-2 flex gap-1">
                      {item.featured && (
                        <span className="bg-secondary text-on-secondary px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 shadow-lg">
                          <span className="material-symbols-outlined text-[10px]">star</span>
                          Destaque
                        </span>
                      )}
                      {!item.active && (
                        <span className="bg-surface/80 text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-bold shadow-lg">
                          Inativo
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-2 left-3">
                      <span className="bg-surface/80 text-on-surface backdrop-blur-sm px-2.5 py-1 rounded-lg text-sm font-bold">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-on-surface truncate" title={getDisplayName(item)}>{getDisplayName(item)}</h3>
                        <p className="text-xs text-on-surface-variant truncate" title={getDisplayDesc(item)}>{getDisplayDesc(item) || 'Sem descrição'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-label-caps bg-surface-container-highest text-on-surface-variant px-2 py-0.5 rounded">
                        {categories.find(c => c.id === item.category_id) ? getCatName(categories.find(c => c.id === item.category_id)!) : 'Sem categoria'}
                      </span>
                      <span className="text-[10px] font-label-caps text-on-surface-variant">
                        #{item.sort_order}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 pt-1.5 border-t border-outline-variant/10">
                      <button onClick={() => openEdit(item)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-on-surface-variant hover:text-secondary hover:bg-secondary/10 transition-all">
                        <span className="material-symbols-outlined text-xs">edit</span>
                        Editar
                      </button>
                      <button onClick={() => toggleActive(item)} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        item.active ? 'text-primary hover:bg-primary/10' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                      }`}>
                        <span className="material-symbols-outlined text-xs">{item.active ? 'visibility' : 'visibility_off'}</span>
                      </button>
                      <button onClick={() => toggleFeatured(item)} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        item.featured ? 'text-secondary hover:bg-secondary/10' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                      }`}>
                        <span className="material-symbols-outlined text-xs">{item.featured ? 'star' : 'star_border'}</span>
                      </button>
                      <button onClick={() => duplicateItem(item)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all">
                        <span className="material-symbols-outlined text-xs">content_copy</span>
                      </button>
                      <div className="flex items-center gap-0 ml-auto">
                        <button onClick={() => moveItem(item.id, 'left')} disabled={filtered.findIndex((i) => i.id === item.id) === 0} className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-on-surface disabled:opacity-20 transition-all rounded-lg hover:bg-surface-container-high">
                          <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        <button onClick={() => moveItem(item.id, 'right')} disabled={filtered.findIndex((i) => i.id === item.id) === filtered.length - 1} className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-on-surface disabled:opacity-20 transition-all rounded-lg hover:bg-surface-container-high">
                          <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                      </div>
                      <button
                        onClick={() => setShowDeleteConfirm(item.id)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold text-on-surface-variant hover:text-error hover:bg-error/10 transition-all"
                      >
                        <span className="material-symbols-outlined text-xs">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-surface rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-outline-variant/10" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSave}>
              <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
                <h2 className="font-headline-sm text-on-surface flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-sm">{editingId ? 'edit' : 'add'}</span>
                  </span>
                  {editingId ? 'Editar Item' : 'Novo Item do Cardápio'}
                </h2>
                <button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <div className="p-6 space-y-8">
                {/* Image Section */}
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden bg-surface-container-high flex-shrink-0">
                    {selectedImage && (selectedImage.startsWith('http://') || selectedImage.startsWith('https://')) ? (
                      <div className="relative w-full h-full">
                        <Image className="object-cover" src={selectedImage} alt="Preview" fill sizes="192px" />
                        <button type="button" onClick={() => { setSelectedImage(null); updateForm('image_url', ''); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors">
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant gap-2">
                        <span className="material-symbols-outlined text-3xl">image</span>
                        <span className="text-[10px] font-label-caps">Preview</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">URL da Imagem</label>
                    <input
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50"
                      value={form.image_url ?? ''}
                      onChange={(e) => { updateForm('image_url', e.target.value); setSelectedImage(e.target.value || null); }}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                    <p className="text-[10px] text-on-surface-variant">Insira uma URL pública de imagem ou deixe vazio para usar um placeholder.</p>
                  </div>
                </div>

                {/* Names */}
                <div>
                  <label className="text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase mb-3 block">Nome do Item (3 idiomas)</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-[10px] font-label-caps">
                        <span className="w-2 h-2 rounded-full bg-secondary" />
                        Português
                      </label>
                      <input className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50" value={form.name_pt} onChange={(e) => updateForm('name_pt', e.target.value)} placeholder="Ex: Coxinha" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-[10px] font-label-caps">
                        <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim" />
                        Français
                      </label>
                      <input className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50" value={form.name_fr} onChange={(e) => updateForm('name_fr', e.target.value)} placeholder="Ex: Coxinha" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-[10px] font-label-caps">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        English
                      </label>
                      <input className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50" value={form.name_en} onChange={(e) => updateForm('name_en', e.target.value)} placeholder="Ex: Coxinha" required />
                    </div>
                  </div>
                </div>

                {/* Descriptions */}
                <div>
                  <label className="text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase mb-3 block">Descrição (3 idiomas)</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(Object.entries({ pt: 'Português', fr: 'Français', en: 'English' }) as [LangKey, string][]).map(([lang, label]) => (
                      <div key={lang} className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-[10px] font-label-caps">
                          <span className={`w-2 h-2 rounded-full ${lang === 'fr' ? 'bg-tertiary-fixed-dim' : lang === 'pt' ? 'bg-secondary' : 'bg-primary'}`} />
                          {label}
                        </label>
                        <textarea
                          className="w-full h-24 bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-sm text-on-surface resize-none outline-none focus:ring-2 focus:ring-secondary/50"
                          value={form[`description_${lang}`]}
                          onChange={(e) => updateForm(`description_${lang}`, e.target.value)}
                          placeholder="Descrição do prato..."
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price + Category + Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">Preço (CAD)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">$</span>
                      <input type="number" step="0.01" min="0" className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl pl-8 pr-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50" value={form.price} onChange={(e) => updateForm('price', parseFloat(e.target.value) || 0)} required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">Categoria</label>
                    <div className="relative">
                      <select className="appearance-none w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50 pr-10" value={form.category_id} onChange={(e) => updateForm('category_id', e.target.value)}>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{getCatName(c)}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                        <span className="material-symbols-outlined text-sm">expand_more</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Toggles */}
                <div className="flex flex-wrap items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-11 h-6 rounded-full transition-colors relative ${form.active ? 'bg-primary' : 'bg-outline-variant'}`}>
                      <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${form.active ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                      <input type="checkbox" checked={form.active} onChange={(e) => updateForm('active', e.target.checked)} className="sr-only" />
                    </div>
                    <span className="text-sm text-on-surface font-bold">Ativo</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-11 h-6 rounded-full transition-colors relative ${form.featured ? 'bg-secondary' : 'bg-outline-variant'}`}>
                      <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${form.featured ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                      <input type="checkbox" checked={form.featured} onChange={(e) => updateForm('featured', e.target.checked)} className="sr-only" />
                    </div>
                    <span className="text-sm text-on-surface font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-secondary">star</span>
                      Destaque
                    </span>
                  </label>
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-label-caps text-on-surface-variant">Ordem</label>
                    <input type="number" min="0" className="w-20 bg-surface-container-low border border-outline-variant/20 rounded-xl p-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50 text-center" value={form.sort_order} onChange={(e) => updateForm('sort_order', parseInt(e.target.value) || 0)} />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-outline-variant/10 flex items-center justify-between">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 text-on-surface-variant font-bold hover:text-on-surface transition-colors">
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-secondary text-on-secondary rounded-xl font-bold shadow-lg shadow-secondary/20 hover:scale-105 transition-transform active:scale-95 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">save</span>
                  {editingId ? 'Atualizar Item' : 'Adicionar Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-surface rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-outline-variant/10 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-error">delete_forever</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface">Excluir Item</h3>
                <p className="text-sm text-on-surface-variant">Tem certeza? Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setShowDeleteConfirm(null)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors">
                Cancelar
              </button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-error text-on-error hover:brightness-110 transition-all">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Manager Modal */}
      {showCatManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowCatManager(false)}>
          <div className="bg-surface rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-outline-variant/10" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
              <h2 className="font-headline-sm text-on-surface flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-sm">category</span>
                </span>
                Gerenciar Categorias
              </h2>
              <button type="button" onClick={() => setShowCatManager(false)} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Cat form */}
              <div className="glass-card rounded-xl p-4 space-y-3">
                <p className="text-[10px] font-label-caps text-secondary tracking-widest uppercase">
                  {editingCatId ? 'Editar Categoria' : 'Nova Categoria'}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input className="bg-surface-container-low border border-outline-variant/20 rounded-lg p-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50" value={catForm.name_pt} onChange={(e) => setCatForm((prev) => ({ ...prev, name_pt: e.target.value }))} placeholder="Nome (PT)" />
                  <input className="bg-surface-container-low border border-outline-variant/20 rounded-lg p-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50" value={catForm.name_fr} onChange={(e) => setCatForm((prev) => ({ ...prev, name_fr: e.target.value }))} placeholder="Nome (FR)" />
                  <input className="bg-surface-container-low border border-outline-variant/20 rounded-lg p-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50" value={catForm.name_en} onChange={(e) => setCatForm((prev) => ({ ...prev, name_en: e.target.value }))} placeholder="Nome (EN)" />
                </div>
                <div className="flex justify-end gap-2">
                  {editingCatId && (
                    <button onClick={() => { setCatForm({ id: '', name_pt: '', name_fr: '', name_en: '' }); setEditingCatId(null); }} className="px-4 py-2 text-sm text-on-surface-variant hover:text-on-surface transition-colors">
                      Cancelar
                    </button>
                  )}
                  <button onClick={handleSaveCat} className="px-5 py-2 rounded-lg text-sm font-bold bg-secondary text-on-secondary hover:brightness-110 transition-all">
                    {editingCatId ? 'Atualizar' : 'Adicionar'}
                  </button>
                </div>
              </div>

              {/* Cat list */}
              {categories.length === 0 ? (
                <p className="text-center text-on-surface-variant py-8">Nenhuma categoria criada.</p>
              ) : (
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/10">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-secondary" />
                        <span className="text-sm font-bold text-on-surface">{getCatName(cat)}</span>
                        <span className="text-[10px] text-on-surface-variant">
                          ({items.filter((i) => i.category_id === cat.id).length} itens)
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditCat(cat)} className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-secondary hover:bg-secondary/10 transition-all">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button onClick={() => handleDeleteCat(cat.id)} className="w-8 h-8 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-error hover:bg-error/10 transition-all">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Price Adjustment Modal */}
      {showGlobalPrice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowGlobalPrice(false)}>
          <div className="bg-surface rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-outline-variant/10 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-secondary">euro</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface">Ajuste Global de Preços</h3>
                <p className="text-sm text-on-surface-variant">Aplica um percentual a todos os itens do cardápio.</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-label-caps text-on-surface-variant">Percentual de ajuste</label>
              <div className="relative">
                <input type="number" step="0.1" className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50 pr-10" value={globalPricePct} onChange={(e) => setGlobalPricePct(parseFloat(e.target.value) || 0)} placeholder="Ex: 10 para +10%, -5 para -5%" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">%</span>
              </div>
              {globalPricePct !== 0 && (
                <p className="text-xs text-on-surface-variant">
                  {globalPricePct > 0 ? '+' : ''}{globalPricePct}% sobre {items.length} itens
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => { setShowGlobalPrice(false); setGlobalPricePct(0); }} className="px-5 py-2.5 rounded-xl text-sm font-bold text-on-surface-variant hover:text-on-surface transition-colors">
                Cancelar
              </button>
              <button onClick={applyGlobalPriceAdjustment} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-secondary text-on-secondary hover:brightness-110 transition-all">
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
