'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { isSupabaseConfigured } from '@/components/admin/AuthProvider';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import ImageUploadField from '@/components/admin/ImageUploadField';

interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  sort_order: number;
  active: boolean;
}

const STORAGE_KEY = 'boteco_admin_gallery';

const INITIAL_ITEMS: GalleryItem[] = [
  { id: 'g-video-1', type: 'video', src: '/carrosel/carrosel_video.mp4', sort_order: 1, active: true },
  { id: 'g-img-1', type: 'image', src: '/carrosel/slide1.jpg', sort_order: 2, active: true },
  { id: 'g-img-2', type: 'image', src: '/carrosel/slide2.jpg', sort_order: 3, active: true },
  { id: 'g-img-3', type: 'image', src: '/carrosel/slide4.jpg', sort_order: 4, active: true },
];

function loadLocal(): GalleryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GalleryItem[];
    if (parsed.length === 0) return [];
    return parsed;
  } catch { return []; }
}

function saveLocal(items: GalleryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  syncToApi(items);
}

async function syncToApi(items: GalleryItem[]) {
  try {
    await fetch('/api/local/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
  } catch {}
}

export default function AdminGalleryPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState<'image' | 'video'>('image');
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      const stored = loadLocal();
      setItems(stored.length > 0 ? stored : INITIAL_ITEMS);
      setLoading(false);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  function handleAdd() {
    if (!newUrl.trim()) return;
    const newItem: GalleryItem = {
      id: `g-${Date.now()}`,
      type: newType,
      src: newUrl.trim(),
      sort_order: items.length + 1,
      active: true,
    };
    const updated = [...items, newItem];
    setItems(updated);
    saveLocal(updated);
    setNewUrl('');
  }

  function handleDelete(id: string) {
    const updated = items.filter((i) => i.id !== id).map((i, idx) => ({ ...i, sort_order: idx + 1 }));
    setItems(updated);
    saveLocal(updated);
  }

  function handleToggleActive(id: string) {
    const updated = items.map((i) => (i.id === id ? { ...i, active: !i.active } : i));
    setItems(updated);
    saveLocal(updated);
  }

  // Native HTML5 DnD
  function handleDragStart(ev: React.DragEvent, id: string) {
    setDragId(id);
    ev.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(ev: React.DragEvent, idx: number) {
    ev.preventDefault();
    ev.dataTransfer.dropEffect = 'move';
    setDragOverIdx(idx);
  }

  function handleDrop(ev: React.DragEvent, targetId: string) {
    ev.preventDefault();
    setDragOverIdx(null);
    const sourceId = dragId;
    if (!sourceId || sourceId === targetId) return;
    const fromIdx = items.findIndex((i) => i.id === sourceId);
    const toIdx = items.findIndex((i) => i.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    const reordered = [...items];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const withOrder = reordered.map((i, idx) => ({ ...i, sort_order: idx + 1 }));
    setItems(withOrder);
    saveLocal(withOrder);
    setDragId(null);
  }

  if (loading) {
    return (
      <>
        <AdminTopBar title="Gallery" />
        <div className="p-gutter max-w-container-max w-full mx-auto space-y-gutter pb-32">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-xl p-4 flex items-center gap-4 animate-pulse">
              <div className="w-24 h-20 bg-surface-container-high rounded-lg" />
              <div className="flex-1 space-y-2"><div className="h-4 w-40 bg-surface-container-high rounded" /><div className="h-3 w-24 bg-surface-container-high rounded" /></div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <AdminTopBar title="Gallery" />
      <div className="p-gutter max-w-container-max w-full mx-auto space-y-4 pb-24">

        {!isSupabaseConfigured() && (
          <div className="bg-secondary/10 text-secondary p-3 rounded-lg text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">cloud_off</span>
            Modo local — dados salvos no navegador. Conecte o Supabase para persistência remota.
          </div>
        )}

        {/* Add form */}
        <section className="glass-card rounded-xl p-4 border border-outline-variant/10">
          <h2 className="font-bold text-on-surface mb-3">Add Media</h2>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex items-center gap-2 bg-surface-container-low rounded-xl px-1">
              <button
                onClick={() => setNewType('image')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${newType === 'image' ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >Image</button>
              <button
                onClick={() => setNewType('video')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${newType === 'video' ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:text-on-surface'}`}
              >Video</button>
            </div>
            <input
              className="flex-1 bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2.5 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder={newType === 'image' ? 'https://example.com/photo.jpg' : '/carrosel/video.mp4'}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button
              onClick={handleAdd}
              className="px-6 py-2.5 bg-secondary text-on-secondary rounded-xl font-bold hover:scale-105 transition-transform active:scale-95 flex items-center gap-2 whitespace-nowrap"
            >
              <span className="material-symbols-outlined">add</span>
              Add
            </button>
          </div>

          {/* Upload option */}
          <div className="mt-4 pt-4 border-t border-outline-variant/10">
            <ImageUploadField
              value={newUrl || null}
              onChange={(url) => { if (url) setNewUrl(url); }}
              folder="gallery"
              accept={newType}
              label={`Ou envie ${newType === 'image' ? 'uma imagem' : 'um video'} do seu computador`}
            />
          </div>
        </section>

        {/* Items list */}
        {items.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3">photo_library</span>
              <p className="text-on-surface-variant text-sm">No media in gallery. Add your first item above.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
            {items.map((item, idx) => (
              <motion.div
                key={item.id}
                layout
                className={`glass-card rounded-xl overflow-hidden border transition-all ${item.active ? 'border-outline-variant/10' : 'border-outline-variant/5 opacity-60'} ${dragOverIdx === idx ? 'ring-2 ring-secondary' : ''}`}
              >
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, item.id)}
                  onDragEnd={() => { setDragId(null); setDragOverIdx(null); }}
                  className={`flex items-center gap-3 p-3 cursor-grab active:cursor-grabbing ${dragId === item.id ? 'opacity-40' : ''}`}
                >
                  {/* Thumbnail */}
                  <div className="w-20 h-16 rounded-lg overflow-hidden bg-surface-container-high flex-shrink-0 relative">
                    {item.type === 'video' ? (
                      <div className="w-full h-full flex items-center justify-center bg-black/10">
                        <span className="material-symbols-outlined text-3xl text-on-surface-variant">play_circle</span>
                      </div>
                    ) : item.src.startsWith('http') ? (
                      <Image className="object-cover" src={item.src} alt="" fill sizes="96px" />
                    ) : (
                      <Image className="object-cover" src={item.src} alt="" fill sizes="96px" />
                    )}
                    <span className="absolute top-1 left-1 bg-black/60 text-white text-[8px] font-label-caps px-1.5 py-0.5 rounded">
                      {item.type === 'video' ? 'VIDEO' : 'IMG'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-on-surface font-bold truncate">{item.src}</p>
                    <p className="text-[10px] text-on-surface-variant font-label-caps mt-0.5">#{item.sort_order}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleToggleActive(item.id)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${item.active ? 'bg-secondary/20 text-secondary' : 'bg-surface-container text-on-surface-variant'}`}
                      title={item.active ? 'Active' : 'Inactive'}
                    >
                      <span className="material-symbols-outlined text-sm">{item.active ? 'visibility' : 'visibility_off'}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="w-7 h-7 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
