'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import type { LandingSettings, LandingItem } from '@/app/api/local/landing/route';

const DEFAULT_ITEM: LandingItem = {
  name_pt: '', name_fr: '', name_en: '',
  description_pt: '', description_fr: '', description_en: '',
  image_url: '',
};

export default function AdminLandingPage() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [items, setItems] = useState<LandingItem[]>([{ ...DEFAULT_ITEM }, { ...DEFAULT_ITEM }, { ...DEFAULT_ITEM }]);
  const [menuItems, setMenuItems] = useState<{ name_pt: string; name_fr: string; name_en: string; image_url: string }[]>([]);
  const [toast, setToast] = useState<{ msg: string; kind: 'success' | 'error' } | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

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
          const all: { name_pt: string; name_fr: string; name_en: string; image_url: string }[] = [];
          for (const item of [...(menu.entrees?.featured || []), ...(menu.entrees?.list || []), ...(menu.plats?.secondary || []), ...(menu.drinks_desserts || [])]) {
            if (item.name_pt) all.push({ name_pt: item.name_pt, name_fr: item.name_fr || '', name_en: item.name_en || '', image_url: item.image_url || item.image || '' });
          }
          setMenuItems(all);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  function updateItem(idx: number, field: keyof LandingItem, value: string) {
    setItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }

  function pickFromMenu(idx: number, menuItem: typeof menuItems[0]) {
    setItems(prev => {
      const next = [...prev];
      next[idx] = {
        name_pt: menuItem.name_pt || next[idx].name_pt,
        name_fr: menuItem.name_fr || next[idx].name_fr,
        name_en: menuItem.name_en || next[idx].name_en,
        description_pt: next[idx].description_pt,
        description_fr: next[idx].description_fr,
        description_en: next[idx].description_en,
        image_url: menuItem.image_url || next[idx].image_url,
      };
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/local/landing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items } as LandingSettings),
      });
      if (res.ok) {
        setToast({ msg: 'Landing page atualizada com sucesso!', kind: 'success' });
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({ msg: 'Erro ao salvar', kind: 'error' });
      }
    } catch {
      setToast({ msg: 'Erro ao salvar', kind: 'error' });
    }
    setSaving(false);
  }

  const btnRef = useRef<HTMLButtonElement>(null);

  if (loading) {
    return (
      <>
        <AdminTopBar title="NOSSA COZINHA" />
        <div className="p-gutter max-w-container-max w-full mx-auto space-y-4 pb-24">
          {[1, 2, 3].map(n => (
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
      <AdminTopBar title="NOSSA COZINHA" />
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-2xl border text-sm font-bold flex items-center gap-3 ${
          toast.kind === 'success' ? 'bg-secondary/20 border-secondary/40 text-secondary' : 'bg-error/20 border-error/40 text-error'
        }`}>
          <span className="material-symbols-outlined text-sm">{toast.kind === 'success' ? 'check_circle' : 'error'}</span>
          {toast.msg}
        </div>
      )}
      <div className="p-gutter max-w-container-max w-full mx-auto space-y-6 pb-24">
        <div className="glass-card rounded-xl p-6 space-y-2">
          <h2 className="font-headline-sm text-on-surface">NOSSA COZINHA</h2>
          <p className="text-on-surface-variant text-sm">Gerencie os 3 pratos exibidos na seção NOSSA COZINHA da landing page.</p>
        </div>

        {items.map((item, idx) => (
          <div key={idx} className="glass-card rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-on-surface flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center text-secondary text-sm font-bold">{idx + 1}</span>
                Prato {idx + 1}
              </h3>
              <div className="relative">
                <button
                  onClick={() => setSelectedIdx(selectedIdx === idx ? null : idx)}
                  className="text-xs font-label-caps text-secondary hover:text-secondary-fixed transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">restaurant_menu</span>
                  Importar do cardápio
                </button>
                {selectedIdx === idx && menuItems.length > 0 && (
                  <div className="absolute right-0 top-full mt-1 z-50 w-72 bg-surface-container-high rounded-xl shadow-2xl border border-outline-variant/10 max-h-64 overflow-y-auto">
                    {menuItems.map((mi, miIdx) => (
                      <button
                        key={miIdx}
                        onClick={() => { pickFromMenu(idx, mi); setSelectedIdx(null); }}
                        className="w-full text-left px-4 py-2.5 hover:bg-surface-container-low text-sm text-on-surface transition-colors flex items-center gap-3 border-b border-outline-variant/5 last:border-0"
                      >
                        <span className="material-symbols-outlined text-on-surface-variant text-sm">restaurant</span>
                        <span>{mi.name_pt || mi.name_fr || mi.name_en}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-40 h-40 rounded-xl overflow-hidden bg-surface-container-high flex-shrink-0">
                {item.image_url ? (
                  <div className="relative w-full h-full">
                    <Image className="object-cover" src={item.image_url} alt="" fill sizes="160px" />
                    <button
                      onClick={() => updateItem(idx, 'image_url', '')}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant gap-1">
                    <span className="material-symbols-outlined text-2xl">image</span>
                    <span className="text-[10px] font-label-caps">Sem imagem</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-label-caps text-on-surface-variant">Português</label>
                    <input className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50" value={item.name_pt} onChange={e => updateItem(idx, 'name_pt', e.target.value)} placeholder="Nome" />
                  </div>
                  <div>
                    <label className="text-[10px] font-label-caps text-on-surface-variant">Français</label>
                    <input className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50" value={item.name_fr} onChange={e => updateItem(idx, 'name_fr', e.target.value)} placeholder="Nom" />
                  </div>
                  <div>
                    <label className="text-[10px] font-label-caps text-on-surface-variant">English</label>
                    <input className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50" value={item.name_en} onChange={e => updateItem(idx, 'name_en', e.target.value)} placeholder="Name" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-label-caps text-on-surface-variant">URL da Imagem</label>
                    <input className="w-full bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50" value={item.image_url} onChange={e => updateItem(idx, 'image_url', e.target.value)} placeholder="https://..." />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-3">
                    <label className="text-[10px] font-label-caps text-on-surface-variant">Descrição (3 idiomas)</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <textarea className="h-20 bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface resize-none outline-none focus:ring-2 focus:ring-secondary/50" value={item.description_pt} onChange={e => updateItem(idx, 'description_pt', e.target.value)} placeholder="Descrição PT" />
                      <textarea className="h-20 bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface resize-none outline-none focus:ring-2 focus:ring-secondary/50" value={item.description_fr} onChange={e => updateItem(idx, 'description_fr', e.target.value)} placeholder="Description FR" />
                      <textarea className="h-20 bg-surface-container-low border border-outline-variant/20 rounded-lg px-3 py-2 text-sm text-on-surface resize-none outline-none focus:ring-2 focus:ring-secondary/50" value={item.description_en} onChange={e => updateItem(idx, 'description_en', e.target.value)} placeholder="Description EN" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <button
            ref={btnRef}
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
