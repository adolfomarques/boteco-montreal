export interface MenuItemData {
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
  active: boolean;
}

export interface CategoryData {
  id: string;
  name_pt: string;
  name_fr: string;
  name_en: string;
}

export interface EventData {
  id: string;
  day_label: string;
  day_label_pt: string;
  day_label_fr: string;
  day_label_en: string;
  title_pt: string;
  title_fr: string;
  title_en: string;
  time_range: string;
  icon: string;
  color: string;
  active: boolean;
}

export interface ReservationData {
  id: string;
  name: string;
  reservation_date: string;
  reservation_time: string;
  guests: number;
  status: string;
}

export interface HealthScore {
  score: number;
  max: number;
  pct: number;
  issues: { text: string; href: string }[];
}

export interface PriceOverview {
  min: number;
  max: number;
  avg: number;
  count: number;
  ranges: { label: string; count: number; pct: number }[];
  cheapestName: string;
  mostExpensiveName: string;
}

export interface TranslationScore {
  lang: string;
  label: string;
  total: number;
  complete: number;
  pct: number;
  missingCount: number;
}

export interface CategoryDist {
  id: string;
  name: string;
  count: number;
  pct: number;
}

export interface DayEventGroup {
  dayLabel: string;
  events: EventData[];
  hasEvent: boolean;
}

const DAY_NAMES_PT = ['DOMINGO', 'SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO'];

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

export function loadMenuItems(): MenuItemData[] {
  return loadJSON<MenuItemData[]>('boteco_admin_menu_items', []);
}

export function loadCategories(): CategoryData[] {
  return loadJSON<CategoryData[]>('boteco_admin_categories', []);
}

export function loadEvents(): EventData[] {
  return loadJSON<EventData[]>('boteco_admin_events', []);
}

export function loadReservations(): ReservationData[] {
  return loadJSON<ReservationData[]>('boteco_admin_reservations', []);
}

export function computeHealthScore(items: MenuItemData[]): HealthScore {
  const issues: { text: string; href: string }[] = [];
  let deductions = 0;

  for (const item of items) {
    if (!item.image_url) {
      issues.push({ text: `"${item.name_pt}" sem imagem`, href: '/admin/menu' });
      deductions++;
    }
    if (!item.description_pt && !item.description_fr && !item.description_en) {
      issues.push({ text: `"${item.name_pt}" sem descrição`, href: '/admin/menu' });
      deductions++;
    }
    if (!item.name_pt || !item.name_fr || !item.name_en) {
      deductions++;
    }
  }

  const max = items.length * 3;
  const score = Math.max(0, max - deductions);
  const pct = max > 0 ? Math.round((score / max) * 100) : 100;

  return { score, max, pct, issues };
}

export function computePriceOverview(items: MenuItemData[]): PriceOverview {
  const prices = items.filter(i => i.active).map(i => i.price);
  const count = prices.length;
  if (count === 0) {
    return { min: 0, max: 0, avg: 0, count: 0, ranges: [], cheapestName: '', mostExpensiveName: '' };
  }

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = Math.round((prices.reduce((a, b) => a + b, 0) / count) * 100) / 100;

  const sorted = [...items.filter(i => i.active)].sort((a, b) => a.price - b.price);
  const cheapestName = sorted[0]?.name_pt || '';
  const mostExpensiveName = sorted[sorted.length - 1]?.name_pt || '';

  const step = (max - min) / 4 || 1;
  const ranges = [];
  for (let i = 0; i < 4; i++) {
    const lo = min + i * step;
    const hi = lo + step;
    const rangeCount = prices.filter(p => p >= lo && (i === 3 ? p <= hi : p < hi)).length;
    ranges.push({
      label: i === 0 ? `≤ $${hi.toFixed(0)}` : i === 3 ? `> $${lo.toFixed(0)}` : `$${lo.toFixed(0)}-${hi.toFixed(0)}`,
      count: rangeCount,
      pct: Math.round((rangeCount / count) * 100),
    });
  }

  return { min, max, avg, count, ranges, cheapestName, mostExpensiveName };
}

export function computeTranslationScores(items: MenuItemData[]): TranslationScore[] {
  const langs = [
    { lang: 'pt', label: 'PT' },
    { lang: 'fr', label: 'FR' },
    { lang: 'en', label: 'EN' },
  ];

  return langs.map(({ lang, label }) => {
    const total = items.length;
    const complete = items.filter(i => {
      const name = (i as any)[`name_${lang}`];
      const desc = (i as any)[`description_${lang}`];
      return name && name.trim() !== '' && desc && desc.trim() !== '';
    }).length;
    const pct = total > 0 ? Math.round((complete / total) * 100) : 100;
    return { lang, label, total, complete, pct, missingCount: total - complete };
  });
}

export function computeCategoryDist(items: MenuItemData[], categories: CategoryData[]): CategoryDist[] {
  const catNames: Record<string, string> = {};
  for (const c of categories) {
    catNames[c.id] = c.name_pt || c.name_fr || c.name_en || 'Sem nome';
  }

  const counts: Record<string, number> = {};
  for (const item of items) {
    if (!item.active) continue;
    const id = item.category_id || 'uncategorized';
    counts[id] = (counts[id] || 0) + 1;
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return Object.entries(counts).map(([id, count]) => ({
    id,
    name: catNames[id] || 'Sem categoria',
    count,
    pct: total > 0 ? Math.round((count / total) * 100) : 0,
  })).sort((a, b) => b.count - a.count);
}

export function getTodayReservations(reservations: ReservationData[]): ReservationData[] {
  const today = new Date().toISOString().slice(0, 10);
  return reservations
    .filter(r => (r.reservation_date || '').slice(0, 10) === today)
    .sort((a, b) => (a.reservation_time || '').localeCompare(b.reservation_time || ''));
}

export function getWeeklyEvents(events: EventData[]): DayEventGroup[] {
  const dayOrder = ['SEGUNDA-FEIRA', 'TERÇA-FEIRA', 'QUARTA-FEIRA', 'QUINTA-FEIRA', 'SEXTA-FEIRA', 'SÁBADO', 'DOMINGO'];

  return dayOrder.map(dayLabel => {
    const matching = events.filter(e => {
      const eventDay = (e.day_label_pt || e.day_label_fr || e.day_label_en || '').toUpperCase();
      return e.active && eventDay === dayLabel;
    });
    return { dayLabel, events: matching, hasEvent: matching.length > 0 };
  });
}

export function getTodayEvent(events: EventData[]): EventData | null {
  const now = new Date();
  const todayIndex = now.getDay();
  const todayNamePT = DAY_NAMES_PT[todayIndex];

  for (const e of events) {
    if (!e.active) continue;
    const eventDay = (e.day_label_pt || e.day_label_fr || e.day_label_en || '').toUpperCase();
    if (eventDay === todayNamePT) return e;
  }
  return null;
}

export function computeDashboardTotals(items: MenuItemData[], events: EventData[], reservations: ReservationData[]) {
  return {
    menuCount: items.length,
    activeMenuCount: items.filter(i => i.active !== false).length,
    eventsCount: events.length,
    activeEventsCount: events.filter(e => e.active !== false).length,
    pendingReservations: reservations.filter(r => r.status === 'pending').length,
    totalReservations: reservations.length,
    todayReservations: getTodayReservations(reservations).length,
    recentReservations: [...reservations]
      .sort((a: any, b: any) => new Date(b.created_at || b.id).getTime() - new Date(a.created_at || a.id).getTime())
      .slice(0, 5),
  };
}
