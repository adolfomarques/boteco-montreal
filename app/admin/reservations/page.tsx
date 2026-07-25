'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { supabase } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/components/admin/AuthProvider';

const STORAGE_KEY = 'boteco_admin_reservations';

interface ReservationRow {
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
}

function loadLocal(): ReservationRow[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocal(data: ReservationRow[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

async function syncToApi(data: ReservationRow[]) {
  try {
    await fetch('/api/local/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reservations: data }),
    });
  } catch {}
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-CA');
  } catch { return dateStr; }
}

const STATUS_OPTIONS = ['pending', 'confirmed', 'cancelled'] as const;

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-secondary/10 text-secondary',
  confirmed: 'bg-primary/10 text-primary',
  cancelled: 'bg-error/10 text-error',
};

export default function AdminReservationsPageWrapper() {
  return (
    <Suspense fallback={<div className="p-gutter"><p className="text-on-surface-variant text-sm">Carregando...</p></div>}>
      <AdminReservationsPage />
    </Suspense>
  );
}

function AdminReservationsPage() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>(searchParams?.get('filter') || 'all');
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase.from('reservations').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
        if (!error && data) {
          setReservations(data as unknown as ReservationRow[]);
        }
        setLoading(false);
      });
    } else {
      const data = loadLocal();
      setReservations(data);
      setLoading(false);
      if (!synced) {
        syncToApi(data);
        setSynced(true);
      }
    }
  }, [synced]);

  function updateStatus(id: string, newStatus: 'pending' | 'confirmed' | 'cancelled') {
    const updated = reservations.map((r) =>
      r.id === id ? { ...r, status: newStatus } : r
    );
    setReservations(updated);
    if (isSupabaseConfigured()) {
      supabase.from('reservations').update({ status: newStatus }).eq('id', id).then(({ error }) => {
        if (error) console.error(error);
      });
    }
    saveLocal(updated);
    syncToApi(updated);
  }

  function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta reserva?')) return;
    const updated = reservations.filter((r) => r.id !== id);
    setReservations(updated);
    if (isSupabaseConfigured()) {
      supabase.from('reservations').delete().eq('id', id).then(({ error }) => {
        if (error) console.error(error);
      });
    }
    saveLocal(updated);
    syncToApi(updated);
  }

  const filtered = filter === 'all'
    ? reservations
    : reservations.filter((r) => r.status === filter);

  const counts = {
    total: reservations.length,
    pending: reservations.filter((r) => r.status === 'pending').length,
    confirmed: reservations.filter((r) => r.status === 'confirmed').length,
    cancelled: reservations.filter((r) => r.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <>
        <AdminTopBar title="Reservations" />
        <div className="flex items-center justify-center h-64">
          <span className="text-on-surface-variant">Carregando...</span>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminTopBar title="Reservations" />
      <div className="p-gutter max-w-container-max w-full mx-auto space-y-4 pb-24">
        {!isSupabaseConfigured() && (
          <div className="bg-secondary/10 text-secondary p-3 rounded-lg text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">cloud_off</span>
            Modo local — dados salvos no navegador. Conecte o Supabase para persistência remota.
          </div>
        )}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Todas', value: counts.total, filter: 'all', color: 'bg-surface-container-highest' },
            { label: 'Pendentes', value: counts.pending, filter: 'pending', color: 'bg-secondary/20' },
            { label: 'Confirmadas', value: counts.confirmed, filter: 'confirmed', color: 'bg-primary/20' },
            { label: 'Canceladas', value: counts.cancelled, filter: 'cancelled', color: 'bg-error/20' },
          ].map((item) => (
            <button
              key={item.filter}
              onClick={() => setFilter(item.filter)}
              className={`glass-card p-3 rounded-xl text-left transition-all ${
                filter === item.filter ? 'ring-2 ring-secondary' : ''
              }`}
            >
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${item.color} mb-1.5`} />
              <p className="font-label-caps text-[10px] text-on-surface-variant">{item.label}</p>
              <p className="font-headline-xs text-on-surface">{item.value}</p>
            </button>
          ))}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-headline-xs text-on-surface">
              {filter === 'all' ? 'Todas as reservas' : `Reservas ${filter}`}
            </h3>
            <span className="text-on-surface-variant font-body-md text-sm">
              {filtered.length} reserva{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3">event_busy</span>
              <p className="text-on-surface-variant text-sm">Nenhuma reserva encontrada</p>
            </div>
          ) : (
              <div className="glass-card rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant">
                      <tr>
                        <th className="px-3 py-2 font-label-caps text-[10px]">Nome</th>
                        <th className="px-3 py-2 font-label-caps text-[10px]">Data</th>
                        <th className="px-3 py-2 font-label-caps text-[10px]">Horário</th>
                        <th className="px-3 py-2 font-label-caps text-[10px]">Convidados</th>
                        <th className="px-3 py-2 font-label-caps text-[10px]">Telefone</th>
                        <th className="px-3 py-2 font-label-caps text-[10px]">Email</th>
                        <th className="px-3 py-2 font-label-caps text-[10px]">Status</th>
                        <th className="px-3 py-2 font-label-caps text-[10px] text-right">Ações</th>
                      </tr>
                    </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {filtered.map((r) => (
                      <tr key={r.id} className="hover:bg-surface-container-high transition-colors">
                        <td className="px-3 py-2 font-bold text-on-surface text-sm">{r.name || '—'}</td>
                        <td className="px-3 py-2 text-on-surface-variant text-xs">{formatDate(r.reservation_date)}</td>
                        <td className="px-3 py-2 text-on-surface-variant text-xs">{r.reservation_time}</td>
                        <td className="px-3 py-2 text-on-surface-variant text-xs">{r.guests}</td>
                        <td className="px-3 py-2 text-on-surface-variant text-xs">{r.phone}</td>
                        <td className="px-3 py-2 text-on-surface-variant text-xs">{r.email || '—'}</td>
                        <td className="px-3 py-2">
                          <select
                            value={r.status}
                            onChange={(e) => updateStatus(r.id, e.target.value as 'pending' | 'confirmed' | 'cancelled')}
                            className={`text-[10px] font-bold px-2 py-1 rounded cursor-pointer outline-none ${STATUS_STYLES[r.status]}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => handleDelete(r.id)}
                            className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors"
                          >
                            delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        {filtered.some((r) => r.special_requests) && (
          <section className="glass-card p-4 rounded-xl">
            <h4 className="font-label-caps text-[10px] text-on-surface-variant mb-3">Detalhes da reserva</h4>
            {filtered.map((r) => (
              r.special_requests && (
                <div key={r.id} className="mb-2 last:mb-0 p-3 bg-surface-container-low rounded-lg">
                  <p className="font-bold text-on-surface text-sm">{r.name}</p>
                  <p className="text-on-surface-variant text-sm italic">{r.special_requests}</p>
                </div>
              )
            ))}
          </section>
        )}
      </div>
    </>
  );
}
