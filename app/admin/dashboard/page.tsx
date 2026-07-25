'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { isSupabaseConfigured } from '@/components/admin/AuthProvider';
import {
  loadMenuItems, loadCategories, loadEvents, loadReservations,
  computeHealthScore, computePriceOverview, computeTranslationScores,
  computeCategoryDist, getTodayReservations, getTodayEvent, getWeeklyEvents,
  computeDashboardTotals,
  type MenuItemData, type CategoryData, type EventData, type ReservationData,
  type HealthScore, type PriceOverview, type TranslationScore,
  type CategoryDist, type DayEventGroup,
} from '@/lib/dashboard-data';

interface Snapshot {
  menuCount: number;
  activeMenuCount: number;
  eventsCount: number;
  activeEventsCount: number;
  totalReservations: number;
  pendingReservations: number;
}

function getSnapshot(): Snapshot | null {
  try {
    const raw = localStorage.getItem('boteco_admin_dashboard_snapshot');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveSnapshot(totals: ReturnType<typeof computeDashboardTotals>) {
  const snap: Snapshot = {
    menuCount: totals.menuCount,
    activeMenuCount: totals.activeMenuCount,
    eventsCount: totals.eventsCount,
    activeEventsCount: totals.activeEventsCount,
    totalReservations: totals.totalReservations,
    pendingReservations: totals.pendingReservations,
  };
  localStorage.setItem('boteco_admin_dashboard_snapshot', JSON.stringify(snap));
}

function fmtDelta(current: number, previous?: number): { text: string; up: boolean } | null {
  if (previous === undefined || previous === null) return null;
  const diff = current - previous;
  if (diff === 0) return null;
  return { text: diff > 0 ? `+${diff}` : `${diff}`, up: diff > 0 };
}

const statusClass: Record<string, string> = {
  pending: 'bg-secondary/10 text-secondary',
  confirmed: 'bg-primary/10 text-primary',
  cancelled: 'bg-error/10 text-error',
};
const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  cancelled: 'Cancelado',
};

function EventDayCard({ day, index }: { day: DayEventGroup; index: number }) {
  const dayLabels: Record<string, string> = {
    'SEGUNDA-FEIRA': 'Seg', 'TERÇA-FEIRA': 'Ter', 'QUARTA-FEIRA': 'Qua',
    'QUINTA-FEIRA': 'Qui', 'SEXTA-FEIRA': 'Sex', 'SÁBADO': 'Sáb', 'DOMINGO': 'Dom',
  };
  const now = new Date();
  const todayIndex = now.getDay();
  const nameToIndex: Record<string, number> = {
    'DOMINGO': 0, 'SEGUNDA-FEIRA': 1, 'TERÇA-FEIRA': 2, 'QUARTA-FEIRA': 3,
    'QUINTA-FEIRA': 4, 'SEXTA-FEIRA': 5, 'SÁBADO': 6,
  };
  const isToday = nameToIndex[day.dayLabel] === todayIndex;

  return (
    <div className={`p-2 rounded-lg ${isToday ? 'bg-secondary/10 ring-1 ring-secondary/30' : 'bg-surface-container-low'} min-w-[80px] flex-1`}>
      <div className="flex items-center gap-1 mb-1">
        <span className={`text-[10px] font-bold ${isToday ? 'text-secondary' : 'text-on-surface-variant'}`}>
          {dayLabels[day.dayLabel] || day.dayLabel.slice(0, 3)}
        </span>
        {isToday && <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />}
      </div>
      {day.hasEvent ? (
        day.events.map(ev => (
          <div key={ev.id} className="text-[10px] leading-tight">
            <span className="text-on-surface font-bold block truncate">{ev.title_pt || ev.title_fr || ev.title_en}</span>
            {ev.time_range && <span className="text-on-surface-variant">{ev.time_range}</span>}
          </div>
        ))
      ) : (
        <Link href="/admin/events" className="text-[10px] text-on-surface-variant hover:text-secondary transition-colors flex items-center gap-0.5">
          <span className="material-symbols-outlined text-[10px]">add</span>
          Criar
        </Link>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const [prev, setPrev] = useState<Snapshot | null>(null);

  const [items, setItems] = useState<MenuItemData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [reservations, setReservations] = useState<ReservationData[]>([]);

  function loadAll() {
    setItems(loadMenuItems());
    setCategories(loadCategories());
    setEvents(loadEvents());
    setReservations(loadReservations());
  }

  useEffect(() => {
    const snap = getSnapshot();
    setPrev(snap);
    loadAll();
  }, []);

  const totals = computeDashboardTotals(items, events, reservations);
  const health = computeHealthScore(items);
  const prices = computePriceOverview(items);
  const trans = computeTranslationScores(items);
  const dist = computeCategoryDist(items, categories);
  const todayRsv = getTodayReservations(reservations);
  const todayEvent = getTodayEvent(events);
  const weekEvents = getWeeklyEvents(events);

  const dMenu = fmtDelta(totals.menuCount, prev?.menuCount);
  const dEvents = fmtDelta(totals.activeEventsCount, prev?.activeEventsCount);
  const dReservations = fmtDelta(totals.totalReservations, prev?.totalReservations);

  const STATS = [
    { icon: 'restaurant_menu', iconBg: 'bg-secondary-container', iconColor: 'text-on-secondary-container',
      label: 'Itens no Menu', value: `${totals.menuCount}`, sub: `${totals.activeMenuCount} ativos`,
      delta: dMenu, href: '/admin/menu' },
    { icon: 'event', iconBg: 'bg-tertiary-container', iconColor: 'text-tertiary',
      label: 'Eventos', value: `${totals.activeEventsCount}`, sub: `${totals.eventsCount} total`,
      delta: dEvents, live: totals.activeEventsCount > 0, href: '/admin/events' },
    { icon: 'event_seat', iconBg: 'bg-surface-container-highest', iconColor: 'text-on-surface',
      label: 'Reservas', value: `${totals.totalReservations}`, sub: `${totals.pendingReservations} pendentes`,
      delta: dReservations,
      badge: totals.pendingReservations > 0 ? `${totals.pendingReservations} pendente(s)` : undefined,
      badgeClass: totals.pendingReservations > 0 ? 'text-secondary bg-secondary/10' : undefined,
      href: '/admin/reservations' },
  ];

  const alerts: { text: string; action?: { label: string; href: string } }[] = [];
  if (totals.pendingReservations > 0)
    alerts.push({ text: `${totals.pendingReservations} reserva(s) pendente(s)`, action: { label: 'Ver', href: '/admin/reservations' } });
  if (totals.menuCount === 0)
    alerts.push({ text: 'Cardápio vazio — adicione itens ao menu', action: { label: 'Adicionar', href: '/admin/menu' } });
  if (totals.activeMenuCount < totals.menuCount)
    alerts.push({ text: `${totals.menuCount - totals.activeMenuCount} item(ns) inativo(s) no menu`, action: { label: 'Ver', href: '/admin/menu' } });

  const QUICK_ACTIONS = [
    { icon: 'add', label: 'Criar Item', href: '/admin/menu' },
    { icon: 'event_note', label: 'Novo Evento', href: '/admin/events' },
    { icon: 'pending_actions', label: 'Ver Pendentes', href: '/admin/reservations' },
  ];

  return (
    <>
      <AdminTopBar title="Dashboard" />
      <div className="p-gutter max-w-container-max mx-auto w-full space-y-4 pb-24">

        {!isSupabaseConfigured() && (
          <div className="bg-secondary/10 text-secondary p-3 rounded-lg text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">cloud_off</span>
            Modo local — dados salvos no navegador.
          </div>
        )}

        {/* Row 1: Stats + Health Score */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {STATS.map(stat => (
            <Link key={stat.label} href={stat.href}
              className="glass-card p-4 rounded-xl flex flex-col hover:ring-1 hover:ring-secondary/30 transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className={`h-8 w-8 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                  <span className={`material-symbols-outlined text-sm ${stat.iconColor}`}>{stat.icon}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {'badge' in stat && stat.badge && (
                    <span className={`font-label-caps text-[10px] ${stat.badgeClass} px-2 py-1 rounded`}>{stat.badge}</span>
                  )}
                  {'live' in stat && stat.live && (
                    <span className="flex items-center gap-1 font-label-caps text-[10px] text-tertiary">
                      <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" /> ATIVO
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-sm text-on-surface">{stat.value}</span>
                {'delta' in stat && stat.delta && (
                  <span className={`text-[11px] font-bold ${stat.delta.up ? 'text-primary' : 'text-error'}`}>{stat.delta.text}</span>
                )}
              </div>
              <span className="text-on-surface-variant font-label-caps text-[10px]">{stat.label}</span>
              {'sub' in stat && stat.sub && <p className="text-[11px] text-on-surface-variant mt-0.5">{stat.sub}</p>}
            </Link>
          ))}

          {/* Health Score */}
          <Link href="/admin/menu" className="glass-card p-4 rounded-xl flex flex-col hover:ring-1 hover:ring-secondary/30 transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className="h-8 w-8 rounded-lg bg-surface-container-highest flex items-center justify-center">
                <span className="material-symbols-outlined text-sm text-on-surface">heart_plus</span>
              </div>
              <span className={`font-label-caps text-[10px] px-2 py-1 rounded ${health.pct >= 80 ? 'bg-primary/10 text-primary' : health.pct >= 50 ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'}`}>
                {health.pct}%
              </span>
            </div>
            <span className="font-headline-sm text-on-surface">{health.score}/{health.max}</span>
            <span className="text-on-surface-variant font-label-caps text-[10px]">Health Score</span>
            {health.issues.length > 0 && (
              <p className="text-[11px] text-on-surface-variant mt-0.5">{health.issues.length} pendência(s)</p>
            )}
          </Link>
        </div>

        {/* Row 2: Distribution + Price Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-on-surface">Distribuição do Cardápio</h4>
              <Link href="/admin/menu" className="text-secondary text-[10px] font-bold hover:underline">Gerenciar</Link>
            </div>
            {dist.length === 0 ? (
              <p className="text-on-surface-variant text-xs">Nenhum item ativo</p>
            ) : (
              <div className="space-y-2">
                {dist.map(cat => (
                  <div key={cat.id}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-on-surface truncate">{cat.name}</span>
                      <span className="text-on-surface-variant ml-2">{cat.count} ({cat.pct}%)</span>
                    </div>
                    <div className="h-2 bg-surface-container-highest rounded-full overflow-hidden">
                      <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${cat.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-on-surface">Overview de Preços</h4>
              <Link href="/admin/menu" className="text-secondary text-[10px] font-bold hover:underline">Gerenciar</Link>
            </div>
            {prices.count === 0 ? (
              <p className="text-on-surface-variant text-xs">Nenhum item ativo</p>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-surface-container-high rounded-lg p-2 text-center">
                    <span className="text-[18px] font-bold text-on-surface">${prices.min.toFixed(0)}</span>
                    <p className="text-[10px] text-on-surface-variant">Mín</p>
                  </div>
                  <div className="bg-surface-container-high rounded-lg p-2 text-center">
                    <span className="text-[18px] font-bold text-on-surface">${prices.avg.toFixed(0)}</span>
                    <p className="text-[10px] text-on-surface-variant">Méd</p>
                  </div>
                  <div className="bg-surface-container-high rounded-lg p-2 text-center">
                    <span className="text-[18px] font-bold text-on-surface">${prices.max.toFixed(0)}</span>
                    <p className="text-[10px] text-on-surface-variant">Máx</p>
                  </div>
                </div>
                <div className="space-y-1">
                  {prices.ranges.map(r => (
                    <div key={r.label} className="flex items-center gap-2 text-[10px]">
                      <span className="w-16 text-on-surface-variant flex-shrink-0">{r.label}</span>
                      <div className="flex-1 h-2 bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${r.pct}%` }} />
                      </div>
                      <span className="w-6 text-right text-on-surface-variant">{r.count}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-on-surface-variant mt-2">
                  Mais barato: <span className="text-on-surface font-bold">{prices.cheapestName}</span>
                  &nbsp;·&nbsp; Mais caro: <span className="text-on-surface font-bold">{prices.mostExpensiveName}</span>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Row 3: Weekly Events + Today Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 glass-card p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-on-surface">Eventos da Semana</h4>
              <Link href="/admin/events" className="text-secondary text-[10px] font-bold hover:underline">Gerenciar</Link>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {weekEvents.map((day, i) => (
                <EventDayCard key={day.dayLabel} day={day} index={i} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="glass-card p-4 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-on-surface">Resumo Diário</h4>
                <span className="text-[10px] text-on-surface-variant">
                  {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }).replace('.', '')}
                </span>
              </div>

              {todayEvent ? (
                <div className="mb-3 p-2.5 rounded-lg bg-tertiary/10 border border-tertiary/20">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-sm text-tertiary">{todayEvent.icon}</span>
                    <span className="text-xs font-bold text-on-surface">{todayEvent.title_pt || todayEvent.title_fr || todayEvent.title_en}</span>
                  </div>
                  {todayEvent.time_range && (
                    <p className="text-[10px] text-on-surface-variant ml-6">{todayEvent.time_range}</p>
                  )}
                </div>
              ) : (
                <div className="mb-3 p-2.5 rounded-lg bg-surface-container-high text-center">
                  <p className="text-[10px] text-on-surface-variant">Nenhum evento hoje</p>
                  <Link href="/admin/events" className="text-[10px] text-secondary font-bold hover:underline">Criar evento</Link>
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-on-surface-variant">Reservas hoje</span>
                <span className="font-bold text-lg text-on-surface">{totals.todayReservations}</span>
              </div>

              {todayRsv.length > 0 && (
                <div className="space-y-1 max-h-[120px] overflow-y-auto">
                  {todayRsv.map(r => (
                    <div key={r.id} className="flex items-center justify-between text-[10px] p-1.5 rounded bg-surface-container-low">
                      <span className="text-on-surface truncate">{r.name}</span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-on-surface-variant">{r.reservation_time}</span>
                        <span className="text-on-surface-variant">{r.guests}p</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card p-4 rounded-xl">
              <h4 className="font-bold text-on-surface mb-3">Ações Rápidas</h4>
              <div className="grid grid-cols-1 gap-1.5">
                {QUICK_ACTIONS.map(action => (
                  <Link key={action.label} href={action.href}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-container-high hover:bg-secondary-container hover:text-on-secondary-container transition-all group">
                    <span className="material-symbols-outlined text-sm text-secondary group-hover:text-on-secondary-container">{action.icon}</span>
                    <span className="font-bold text-xs">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 4: Translation Score + Reservations Table + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 space-y-3">
            {/* Translation Score */}
            <div className="glass-card p-4 rounded-xl">
              <h4 className="font-bold text-on-surface mb-3">Score de Tradução</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {trans.map(t => (
                  <div key={t.lang} className="bg-surface-container-high rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-on-surface">{t.label}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${t.pct === 100 ? 'bg-primary/10 text-primary' : t.pct >= 50 ? 'bg-secondary/10 text-secondary' : 'bg-error/10 text-error'}`}>
                        {t.pct}%
                      </span>
                    </div>
                    <div className="h-2.5 bg-surface-container-highest rounded-full overflow-hidden mb-1.5">
                      <div className={`h-full rounded-full transition-all ${t.pct === 100 ? 'bg-primary' : 'bg-secondary'}`}
                        style={{ width: `${t.pct}%` }} />
                    </div>
                    <p className="text-[10px] text-on-surface-variant">
                      {t.complete}/{t.total} itens
                      {t.missingCount > 0 && (
                        <span className="text-error"> · {t.missingCount} faltando</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reservations Table */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="p-4 border-b border-outline-variant flex justify-between items-center">
                <h4 className="font-bold text-on-surface">Reservas Recentes</h4>
                <div className="flex items-center gap-3">
                  {totals.recentReservations.length > 0 && (
                    <Link href="/admin/reservations" className="text-secondary font-label-caps text-xs hover:underline">Ver todas</Link>
                  )}
                  <button onClick={() => loadAll()} className="text-on-surface-variant hover:text-secondary transition-colors" title="Atualizar">
                    <span className="material-symbols-outlined text-sm">refresh</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                {totals.recentReservations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-3">event_busy</span>
                    <p className="text-on-surface-variant text-sm mb-4">Nenhuma reserva ainda</p>
                    <Link href="/admin/reservations" className="text-secondary font-bold text-xs hover:underline flex items-center gap-1">
                      Gerenciar reservas <span className="material-symbols-outlined text-xs">arrow_forward</span>
                    </Link>
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-low text-on-surface-variant border-b border-outline-variant">
                      <tr>
                        <th className="px-4 py-2 font-label-caps text-[10px]">Convidado</th>
                        <th className="px-4 py-2 font-label-caps text-[10px]">Data</th>
                        <th className="px-4 py-2 font-label-caps text-[10px]">Pessoas</th>
                        <th className="px-4 py-2 font-label-caps text-[10px]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {totals.recentReservations.map(r => (
                        <tr key={r.id} onClick={() => router.push('/admin/reservations')}
                          className="hover:bg-surface-container-high transition-colors cursor-pointer">
                          <td className="px-4 py-2 font-bold text-on-surface text-sm">{r.name}</td>
                          <td className="px-4 py-2 text-on-surface-variant text-sm">{r.reservation_date}</td>
                          <td className="px-4 py-2 text-on-surface-variant text-sm">{r.guests}</td>
                          <td className="px-4 py-2">
                            <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold ${statusClass[r.status] || ''}`}>
                              {statusLabels[r.status] || r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="space-y-3">
            <div className="glass-card p-4 rounded-xl">
              <h4 className="font-bold text-on-surface mb-3">Alertas</h4>
              {alerts.length === 0 ? (
                <div className="flex items-center gap-2 text-on-surface-variant text-xs">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Tudo em ordem
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {alerts.map(alert => (
                    <li key={alert.text} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-container-high">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="material-symbols-outlined text-sm text-secondary flex-shrink-0">info</span>
                        <span className="text-xs text-on-surface truncate">{alert.text}</span>
                      </div>
                      {alert.action && (
                        <Link href={alert.action.href} className="text-[10px] font-bold text-secondary hover:underline flex-shrink-0">
                          {alert.action.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="glass-card p-4 rounded-xl">
              <h4 className="font-bold text-on-surface mb-3">Health Score</h4>
              {health.issues.length === 0 ? (
                <div className="flex items-center gap-2 text-on-surface-variant text-xs">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  Cardápio em dia
                </div>
              ) : (
                <ul className="space-y-1 max-h-[200px] overflow-y-auto">
                  {health.issues.map(issue => (
                    <li key={issue.text} className="flex items-center gap-2 p-1.5 rounded-lg bg-surface-container-high">
                      <span className="material-symbols-outlined text-xs text-secondary flex-shrink-0">warning</span>
                      <span className="text-[10px] text-on-surface truncate">{issue.text}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/admin/menu" className="text-secondary text-[10px] font-bold hover:underline mt-2 inline-block">
                Revisar cardápio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
