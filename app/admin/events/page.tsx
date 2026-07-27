'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, Reorder } from 'framer-motion';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { WEEKLY_EVENTS } from '@/lib/data/events';

const COLOR_OPTIONS = ['primary', 'secondary', 'tertiary'] as const;

interface EventRow {
  id: string;
  day_label: string;
  day_label_pt: string;
  day_label_fr: string;
  day_label_en: string;
  title_pt: string;
  title_fr: string;
  title_en: string;
  description_pt: string;
  description_fr: string;
  description_en: string;
  time_range: string;
  icon: string;
  color: string;
  image_url: string | null;
  sort_order: number;
  active: boolean;
  highlight: boolean;
}

const EMPTY_FORM: Omit<EventRow, 'id'> = {
  day_label: '',
  day_label_pt: '',
  day_label_fr: '',
  day_label_en: '',
  title_pt: '',
  title_fr: '',
  title_en: '',
  description_pt: '',
  description_fr: '',
  description_en: '',
  time_range: '',
  icon: 'event',
  color: 'secondary',
  image_url: '',
  sort_order: 0,
  active: true,
  highlight: false,
};

function buildInitialEvents(): EventRow[] {
  return WEEKLY_EVENTS.map((ev, idx) => ({
    id: `seed_events_${idx + 1}`,
    day_label: ev.day_label_fr || ev.day_label_en || ev.day_label_pt || '',
    day_label_pt: ev.day_label_pt || '',
    day_label_fr: ev.day_label_fr || '',
    day_label_en: ev.day_label_en || '',
    title_pt: ev.title_pt || '',
    title_fr: ev.title_fr || '',
    title_en: ev.title_en || '',
    description_pt: ev.description_pt || '',
    description_fr: ev.description_fr || '',
    description_en: ev.description_en || '',
    time_range: ev.time_range || '',
    icon: ev.icon || 'event',
    color: ev.color || 'secondary',
    image_url: ev.image_url || null,
    sort_order: idx + 1,
    active: true,
    highlight: false,
  }));
}

function isSupabaseConfigured(): boolean {
  if (typeof window === 'undefined') return false;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return url.startsWith('https://') && !url.includes('your-project');
}

const STORAGE_KEY = 'boteco_admin_events';

function loadLocalEvents(): EventRow[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as EventRow[];
    const hasAnyImage = parsed.some(e => e.image_url);
    if (!hasAnyImage) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveLocalEvents(events: EventRow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  syncEventsToApi(events);
}

async function syncEventsToApi(events: EventRow[]) {
  try {
    await fetch('/api/local/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
    });
  } catch {}
}

let localCounter = 1;
function nextLocalId(): string {
  return `local_${Date.now()}_${localCounter++}`;
}

export default function AdminEventsPage() {
  const { t } = useLanguage();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<EventRow, 'id'>>({ ...EMPTY_FORM });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);


  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) {
        const local = loadLocalEvents();
        setEvents(local.length > 0 ? local : buildInitialEvents());
        setLoading(false);
        return;
      }
      const { data } = await supabase.from('events').select('*').order('sort_order', { ascending: true });
      if (data && data.length > 0) {
        setEvents(data as unknown as EventRow[]);
      } else {
        const local = loadLocalEvents();
        setEvents(local.length > 0 ? local : buildInitialEvents());
      }
      setLoading(false);
    }
    load();
  }, []);

  function openNew() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setSelectedImage(null);
    setShowModal(true);
  }

  function openEdit(ev: EventRow) {
    setForm({
      day_label: ev.day_label,
      day_label_pt: ev.day_label_pt || '',
      day_label_fr: ev.day_label_fr || '',
      day_label_en: ev.day_label_en || '',
      title_pt: ev.title_pt,
      title_fr: ev.title_fr,
      title_en: ev.title_en,
      description_pt: ev.description_pt,
      description_fr: ev.description_fr,
      description_en: ev.description_en,
      time_range: ev.time_range,
      icon: ev.icon,
      color: ev.color,
      image_url: ev.image_url ?? '',
      sort_order: ev.sort_order,
      active: ev.active,
      highlight: ev.highlight,
    });
    setSelectedImage(ev.image_url ?? null);
    setEditingId(ev.id);
    setShowModal(true);
  }

  function updateForm(field: string, value: string | number | boolean) {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'day_label_fr' && value) {
        updated.day_label = value as string;
      }
      if (field === 'day_label') {
        updated.day_label_pt = updated.day_label_pt || (value as string);
        updated.day_label_fr = updated.day_label_fr || (value as string);
        updated.day_label_en = updated.day_label_en || (value as string);
      }
      return updated;
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const record = { ...form, image_url: form.image_url || null };
    const supabaseRecord: Record<string, unknown> = {
      day_label: record.day_label,
      title_pt: record.title_pt, title_fr: record.title_fr, title_en: record.title_en,
      description_pt: record.description_pt, description_fr: record.description_fr, description_en: record.description_en,
      time_range: record.time_range, icon: record.icon, color: record.color,
      image_url: record.image_url, sort_order: record.sort_order, active: record.active,
      highlight: record.highlight,
    };

    if (!isSupabaseConfigured()) {
      let updated: EventRow[];
      if (editingId) {
        updated = events.map((ev) => (ev.id === editingId ? { ...ev, ...record, id: editingId } : ev));
      } else {
        const newEvent: EventRow = { ...record, id: nextLocalId() };
        updated = [...events, newEvent];
      }
      setEvents(updated);
      saveLocalEvents(updated);
      setShowModal(false);
      return;
    }

    if (editingId) {
      const { error } = await supabase.from('events').update(supabaseRecord).eq('id', editingId);
      if (error) {
        alert(`Error: ${error.message}`);
        return;
      }
      setEvents((prev) => prev.map((ev) => (ev.id === editingId ? { ...ev, ...record } : ev)));
    } else {
      const { data, error } = await supabase.from('events').insert(supabaseRecord).select();
      if (error) {
        alert(`Error: ${error.message}`);
        return;
      }
      if (data) {
        setEvents((prev) => [...prev, data[0] as unknown as EventRow]);
      }
    }
    setShowModal(false);
  }

  async function handleDelete(id: string) {
    if (!confirm(t('admin.eventsDeleteConfirm'))) return;

    if (!isSupabaseConfigured()) {
      const updated = events.filter((ev) => ev.id !== id);
      setEvents(updated);
      saveLocalEvents(updated);
      return;
    }

    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      alert(`Error: ${error.message}`);
      return;
    }
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  }

  function moveEvent(id: string, direction: 'up' | 'down') {
    const idx = events.findIndex((e) => e.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === events.length - 1) return;
    const swapped = [...events];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [swapped[idx], swapped[swapIdx]] = [swapped[swapIdx], swapped[idx]];
    const reordered = swapped.map((ev, i) => ({ ...ev, sort_order: i + 1 }));
    setEvents(reordered);
    saveLocalEvents(reordered);
  }

  function handleReorder(reordered: EventRow[]) {
    const withOrder = reordered.map((ev, i) => ({ ...ev, sort_order: i + 1 }));
    setEvents(withOrder);
    saveLocalEvents(withOrder);
  }

  function handleToggleActive(id: string, current: boolean) {
    if (!isSupabaseConfigured()) {
      const updated = events.map((ev) => (ev.id === id ? { ...ev, active: !current } : ev));
      setEvents(updated);
      saveLocalEvents(updated);
      return;
    }
    supabase.from('events').update({ active: !current }).eq('id', id).then(({ error }) => {
      if (error) return;
      setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, active: !current } : ev)));
    });
  }

  async function handleToggleHighlight(id: string, current: boolean) {
    if (!isSupabaseConfigured()) {
      const updated = events.map((ev) => ({
        ...ev,
        highlight: ev.id === id ? !current : false,
      }));
      setEvents(updated);
      saveLocalEvents(updated);
      return;
    }
    const { error } = await supabase.from('events').update({ highlight: !current }).eq('id', id);
    if (error) {
      alert(`Error: ${error.message}`);
      return;
    }
    const updated = events.map((ev) => ({
      ...ev,
      highlight: ev.id === id ? !current : false,
    }));
    setEvents(updated);
  }

  if (loading) {
    return (
      <>
        <AdminTopBar title={t('admin.eventsHeading')} />
        <div className="flex items-center justify-center h-64">
          <span className="text-on-surface-variant">{t('admin.menuLoading')}</span>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminTopBar title={t('admin.eventsHeading')} />
      <div className="p-gutter max-w-container-max w-full mx-auto space-y-4 pb-24">
        <section className="flex items-center justify-between">
          <p className="text-on-surface-variant">{t('admin.eventsDesc')}</p>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-6 py-3 bg-secondary text-on-secondary rounded-xl font-bold hover:scale-105 transition-transform active:scale-95"
          >
            <span className="material-symbols-outlined">add</span>
            {t('admin.eventsAdd')}
          </button>
        </section>

        {!isSupabaseConfigured() && (
          <div className="bg-secondary/10 text-secondary p-3 rounded-lg text-xs flex items-center gap-2">
            Modo local — dados salvos no navegador. Conecte o Supabase para persistência remota.
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">event_busy</span>
            <p className="text-on-surface-variant">{t('admin.eventsNoEvents')}</p>
          </div>
        ) : (
          <Reorder.Group axis="y" values={events} onReorder={handleReorder} className="flex flex-col gap-gutter">
            {events.map((ev) => (
              <Reorder.Item
                key={ev.id}
                value={ev}
                className={`glass-card rounded-xl p-4 border cursor-grab active:cursor-grabbing ${ev.active ? 'border-outline-variant/10' : 'border-outline-variant/5 opacity-60'}`}
                style={{ listStyle: 'none' }}
                whileDrag={{
                  scale: 1.03,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  zIndex: 50,
                  position: 'relative',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      ev.color === 'tertiary' ? 'bg-tertiary/20' : ev.color === 'primary' ? 'bg-primary/20' : 'bg-secondary/20'
                    }`}>
                      <span className={`material-symbols-outlined ${
                        ev.color === 'tertiary' ? 'text-tertiary' : ev.color === 'primary' ? 'text-primary' : 'text-secondary'
                      }`}>{ev.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-on-surface truncate text-sm">{ev.title_pt || ev.title_fr || ev.title_en}</h3>
                        <span className="bg-surface-container-highest px-2.5 py-0.5 rounded text-[10px] font-label-caps text-on-surface-variant uppercase tracking-wider">
                          {ev.day_label}
                        </span>
                        <span className="text-secondary font-label-caps text-sm">{ev.time_range}</span>
                      </div>
                      <p className="text-on-surface-variant text-sm mt-1 line-clamp-2">{ev.description_pt || ev.description_fr || ev.description_en}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex flex-col items-center gap-0">
                      <button onClick={() => moveEvent(ev.id, 'up')} disabled={events.indexOf(ev) === 0} className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-on-surface disabled:opacity-20 transition-all rounded-lg hover:bg-surface-container-high">
                        <span className="material-symbols-outlined text-sm">keyboard_arrow_up</span>
                      </button>
                      <button onClick={() => moveEvent(ev.id, 'down')} disabled={events.indexOf(ev) === events.length - 1} className="w-7 h-7 flex items-center justify-center text-on-surface-variant hover:text-on-surface disabled:opacity-20 transition-all rounded-lg hover:bg-surface-container-high">
                        <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
                      </button>
                    </div>
                    <button
                      onClick={() => handleToggleActive(ev.id, ev.active)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                        ev.active ? 'bg-secondary/20 text-secondary' : 'bg-surface-container text-on-surface-variant'
                      }`}
                      title={ev.active ? 'Active' : 'Inactive'}
                    >
                      <span className="material-symbols-outlined text-sm">{ev.active ? 'visibility' : 'visibility_off'}</span>
                    </button>
                    <button
                      onClick={() => handleToggleHighlight(ev.id, ev.highlight)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                        ev.highlight
                          ? 'bg-yellow-500/20 text-yellow-500'
                          : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                      }`}
                      title={ev.highlight ? 'Em destaque' : 'Destacar'}
                    >
                      <span className="material-symbols-outlined text-sm">{ev.highlight ? 'star' : 'star_border'}</span>
                    </button>
                    <button
                      onClick={() => openEdit(ev)}
                      className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(ev.id)}
                      className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-surface rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-outline-variant/10" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSave}>
              <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
                <h2 className="font-headline-sm text-on-surface flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-sm">{editingId ? 'edit' : 'add'}</span>
                  </span>
                  {editingId ? t('admin.eventsEdit') : t('admin.eventsAdd')}
                </h2>
                <button type="button" onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Image Section */}
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-48 h-48 rounded-xl overflow-hidden bg-surface-container-high flex-shrink-0">
                    {selectedImage && (selectedImage.startsWith('http://') || selectedImage.startsWith('https://')) ? (
                      <div className="relative w-full h-full">
                        <Image className="object-cover" src={selectedImage} alt="Preview" fill sizes="192px" />
                        <button
                          type="button"
                          onClick={() => { setSelectedImage(null); updateForm('image_url', ''); }}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                        >
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
                    <label className="text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">{t('admin.eventsImage')}</label>
                    <input
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50"
                      value={form.image_url ?? ''}
                      onChange={(e) => { updateForm('image_url', e.target.value); setSelectedImage(e.target.value || null); }}
                      placeholder={t('admin.eventsImageDesc')}
                    />
                    <p className="text-[10px] text-on-surface-variant">Insira uma URL pública de imagem ou deixe vazio para usar um placeholder.</p>
                  </div>
                </div>

                {/* Time + Day Label */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">{t('admin.eventsTimeRange')}</label>
                    <input
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50"
                      value={form.time_range}
                      onChange={(e) => updateForm('time_range', e.target.value)}
                      placeholder={t('admin.eventsTimeRangeDesc')}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">
                      Dia da Semana (3 idiomas)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50"
                        value={form.day_label_pt} onChange={(e) => updateForm('day_label_pt', e.target.value)}
                        placeholder="PT"
                      />
                      <input
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50"
                        value={form.day_label_fr} onChange={(e) => updateForm('day_label_fr', e.target.value)}
                        placeholder="FR"
                      />
                      <input
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50"
                        value={form.day_label_en} onChange={(e) => updateForm('day_label_en', e.target.value)}
                        placeholder="EN"
                      />
                    </div>
                  </div>
                </div>

                {/* Titles (3 languages) */}
                <div>
                  <label className="text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase mb-3 block">
                    Título (3 idiomas)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-[10px] font-label-caps">
                        <span className="w-2 h-2 rounded-full bg-secondary" />
                        Português
                      </label>
                      <input
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50"
                        value={form.title_pt}
                        onChange={(e) => updateForm('title_pt', e.target.value)}
                        placeholder="Ex: Feijoada"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-[10px] font-label-caps">
                        <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim" />
                        Français
                      </label>
                      <input
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50"
                        value={form.title_fr}
                        onChange={(e) => updateForm('title_fr', e.target.value)}
                        placeholder="Ex: Feijoada"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="flex items-center gap-1.5 text-[10px] font-label-caps">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        English
                      </label>
                      <input
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50"
                        value={form.title_en}
                        onChange={(e) => updateForm('title_en', e.target.value)}
                        placeholder="Ex: Feijoada"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Descriptions (3 languages) */}
                <div>
                  <label className="text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase mb-3 block">
                    Descrição (3 idiomas)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {([
                      { lang: 'pt' as const, label: 'Português', color: 'bg-secondary' },
                      { lang: 'fr' as const, label: 'Français', color: 'bg-tertiary-fixed-dim' },
                      { lang: 'en' as const, label: 'English', color: 'bg-primary' },
                    ]).map(({ lang, label, color }) => (
                      <div key={lang} className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-[10px] font-label-caps">
                          <span className={`w-2 h-2 rounded-full ${color}`} />
                          {label}
                        </label>
                        <textarea
                          className="w-full h-24 bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-sm text-on-surface resize-none outline-none focus:ring-2 focus:ring-secondary/50"
                          value={form[`description_${lang}`]}
                          onChange={(e) => updateForm(`description_${lang}`, e.target.value)}
                          placeholder="Descrição do evento..."
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Icon + Color + Sort Order */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">{t('admin.eventsIcon')}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                        <span className="material-symbols-outlined text-sm">{form.icon || 'auto_awesome'}</span>
                      </span>
                      <input
                        className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50"
                        value={form.icon}
                        onChange={(e) => updateForm('icon', e.target.value)}
                        placeholder="event"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">{t('admin.eventsColor')}</label>
                    <div className="relative">
                      <select
                        className="appearance-none w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50 pr-10"
                        value={form.color}
                        onChange={(e) => updateForm('color', e.target.value)}
                      >
                        {COLOR_OPTIONS.map((c) => (
                          <option key={c} value={c}>{t(`admin.eventsColor${c.charAt(0).toUpperCase() + c.slice(1)}`)}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">
                        <span className="material-symbols-outlined text-sm">expand_more</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-label-caps text-on-surface-variant tracking-widest uppercase">Ordem</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl p-3 text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary/50"
                      value={form.sort_order}
                      onChange={(e) => updateForm('sort_order', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                {/* Status Toggle */}
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-11 h-6 rounded-full transition-colors relative ${form.active ? 'bg-primary' : 'bg-outline-variant'}`}>
                      <div className={`absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform ${form.active ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                      <input type="checkbox" checked={form.active} onChange={(e) => updateForm('active', e.target.checked)} className="sr-only" />
                    </div>
                    <span className="text-sm text-on-surface font-bold">{t('admin.eventsActive')}</span>
                  </label>
                </div>
              </div>

              <div className="p-6 border-t border-outline-variant/10 flex items-center justify-between">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 text-on-surface-variant font-bold hover:text-on-surface transition-colors">
                  {t('admin.eventsCancel')}
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-secondary text-on-secondary rounded-xl font-bold shadow-lg shadow-secondary/20 hover:scale-105 transition-transform active:scale-95 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">save</span>
                  {t('admin.eventsSave')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
