'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import AdminTopBar from '@/components/admin/AdminTopBar';
import type { LandingSettings, LandingItem } from '@/app/api/local/landing/route';
import ImageUploadField from '@/components/admin/ImageUploadField';

const EMPTY_ITEM: LandingItem = {
  name_pt: '', name_fr: '', name_en: '',
  description_pt: '', description_fr: '', description_en: '',
  image_url: '', price: 0,
};

function Toast({ msg, kind, onClose }: { msg: string; kind: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-2xl border text-sm font-bold flex items-center gap-3 animate-[slideIn_0.3s_ease-out] ${
      kind === 'success' ? 'bg-secondary/20 border-secondary/40 text-secondary' : 'bg-error/20 border-error/40 text-error'
    }`}>
      <span className="material-symbols-outlined text-sm">{kind === 'success' ? 'check_circle' : 'error'}</span>
      {msg}
    </div>
  );
}

export default function AdminLandingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<LandingItem[]>(() => [EMPTY_ITEM, EMPTY_ITEM, EMPTY_ITEM].map(i => ({ ...i })));
  const [menuItems, setMenuItems] = useState<LandingItem[]>([]);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'error' } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const [landingRes, menuRes] = await Promise.all([
          fetch('/api/local/landing'),
          fetch('/api/local/menu'),
        ]);
        if (landingRes.ok) {
          const data: LandingSettings = await landingRes.json();
          if (data?.items?.length === 3) setItems(data.items);
        }
        if (menuRes.ok) {
          const menu = await menuRes.json();
          const all: LandingItem[] = [];
          for (const item of [
            ...(menu.entrees?.featured || []), ...(menu.entrees?.list || []),
            ...(menu.plats?.secondary || []), ...(menu.drinks_desserts || []),
          ]) {
            if (item.name_pt) all.push({
              name_pt: item.name_pt, name_fr: item.name_fr || '', name_en: item.name_en || '',
              description_pt: item.description_pt || '', description_fr: item.description_fr || '', description_en: item.description_en || '',
              image_url: item.image_url || item.image || '', price: item.price ?? 0,
            });
          }
          setMenuItems(all);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    if (openDropdown !== null) {
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }
  }, [openDropdown]);

  function update(idx: number, field: keyof LandingItem, value: string | number) {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  }

  function pickFromMenu(idx: number, mi: LandingItem) {
    setItems(prev => prev.map((item, i) => i === idx ? {
      ...item,
      name_pt: mi.name_pt || item.name_pt,
      name_fr: mi.name_fr || item.name_fr,
      name_en: mi.name_en || item.name_en,
      price: mi.price ?? item.price,
      image_url: mi.image_url || item.image_url,
    } : item));
    setOpenDropdown(null);
  }

  function resetSlots() {
    setItems([EMPTY_ITEM, EMPTY_ITEM, EMPTY_ITEM].map(i => ({ ...i })));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/local/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items } as LandingSettings),
      });
      setToast({ msg: res.ok ? 'NOSSA COZINHA atualizada!' : 'Erro ao salvar', kind: res.ok ? 'success' : 'error' });
    } catch {
      setToast({ msg: 'Erro ao salvar', kind: 'error' });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <>
        <AdminTopBar title="NOSSA COZINHA" />
        <div className="p-gutter max-w-container-max w-full mx-auto space-y-4 pb-24">
          {[1, 2, 3].map(n => (
            <div key={n} className="glass-card rounded-xl p-6 animate-pulse">
              <div className="flex gap-6">
                <div className="w-32 h-32 bg-surface-container-high rounded-xl shrink-0" />
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
      <AdminTopBar title="NOSSA COZINHA" />
      {toast && <Toast msg={toast.msg} kind={toast.kind} onClose={() => setToast(null)} />}

      <div className="p-gutter max-w-container-max w-full mx-auto space-y-6 pb-24">
        <div className="flex items-center justify-between glass-card rounded-xl p-6">
          <div>
            <h2 className="font-headline-sm text-on-surface">NOSSA COZINHA</h2>
            <p className="text-on-surface-variant text-sm mt-1">Gerencie os 3 pratos em destaque na landing page.</p>
          </div>
          <button onClick={resetSlots} className="text-sm text-on-surface-variant hover:text-error transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">refresh</span>
            Limpar
          </button>
        </div>

        {items.map((item, idx) => (
          <div key={idx} className="glass-card rounded-xl overflow-hidden border border-outline-variant/10">
            <div className="flex items-center justify-between px-6 py-3 bg-surface-container-high border-b border-outline-variant/5">
              <h3 className="font-bold text-on-surface flex items-center gap-2 text-sm">
                <span className="w-6 h-6 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                Prato {idx + 1}
              </h3>
              <div ref={openDropdown === idx ? dropdownRef : undefined} className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === idx ? null : idx)}
                  className="text-xs font-label-caps text-secondary hover:text-secondary-fixed transition-colors flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-secondary/10"
                >
                  <span className="material-symbols-outlined text-sm">restaurant_menu</span>
                  Importar
                </button>
                {openDropdown === idx && (
                  <div className="absolute right-0 top-full mt-1 z-50 w-72 bg-surface-container-high rounded-xl shadow-2xl border border-outline-variant/10 max-h-64 overflow-y-auto">
                    {menuItems.length === 0 ? (
                      <div className="p-4 text-sm text-on-surface-variant text-center">Nenhum item no cardápio</div>
                    ) : menuItems.map((mi, miIdx) => (
                      <button
                        key={miIdx}
                        onClick={() => pickFromMenu(idx, mi)}
                        className="w-full text-left px-4 py-2.5 hover:bg-surface-container-low text-sm text-on-surface transition-colors flex items-center gap-3 border-b border-outline-variant/5 last:border-0"
                      >
                        <span className="material-symbols-outlined text-on-surface-variant text-sm">restaurant</span>
                        <span className="truncate">{mi.name_pt || mi.name_fr || mi.name_en}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-40 h-40 rounded-xl overflow-hidden bg-surface-container-high shrink-0 relative">
                  {item.image_url ? (
                    <>
                      <Image className="object-cover" src={item.image_url} alt="" fill sizes="160px" />
                      <button
                        onClick={() => update(idx, 'image_url', '')}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors z-10"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant gap-1">
                      <span className="material-symbols-outlined text-3xl">image</span>
                      <span className="text-[10px] font-label-caps">Sem imagem</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4 min-w-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {([
                      { key: 'name_pt' as const, label: 'Português', placeholder: 'Nome do prato' },
                      { key: 'name_fr' as const, label: 'Français', placeholder: 'Nom du plat' },
                      { key: 'name_en' as const, label: 'English', placeholder: 'Dish name' },
                    ]).map(field => (
                      <div key={field.key}>
                        <label className="text-[10px] font-label-caps text-on-surface-variant tracking-wider">{field.label}</label>
                        <input
                          className="w-full mt-1 bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50 transition-shadow"
                          value={item[field.key] as string}
                          onChange={e => update(idx, field.key, e.target.value)}
                          placeholder={field.placeholder}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <ImageUploadField
                        value={item.image_url || null}
                        onChange={(url) => update(idx, 'image_url', url ?? '')}
                        folder="landing"
                        label="Imagem"
                      />
                    </div>
                    <div className="w-24 max-w-full">
                      <label className="text-[10px] font-label-caps text-on-surface-variant tracking-wider">Preço (CAD)</label>
                      <input
                        type="number" step="0.01" min="0"
                        className="w-full mt-1 bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50 transition-shadow"
                        value={item.price || ''}
                        onChange={e => update(idx, 'price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-label-caps text-on-surface-variant tracking-wider">Descrição (3 idiomas)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                      {([
                        { key: 'description_pt' as const, placeholder: 'Descrição em português' },
                        { key: 'description_fr' as const, placeholder: 'Description en français' },
                        { key: 'description_en' as const, placeholder: 'Description in English' },
                      ]).map(field => (
                        <textarea
                          key={field.key}
                          className="h-20 bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface resize-none outline-none focus:ring-2 focus:ring-secondary/50 transition-shadow"
                          value={item[field.key] as string}
                          onChange={e => update(idx, field.key, e.target.value)}
                          placeholder={field.placeholder}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-secondary text-on-secondary rounded-xl font-bold shadow-lg shadow-secondary/20 hover:scale-105 transition-transform active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </>
  );
}
