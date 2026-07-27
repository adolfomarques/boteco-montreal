import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { WEEKLY_EVENTS as FALLBACK_EVENTS } from '@/lib/data/events';
import { getLocale, getTranslator } from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/translations';

function colorHover(color: string): string {
  const map: Record<string, string> = {
    primary: 'hover:border-secondary hover:shadow-secondary/20',
    secondary: 'hover:border-secondary hover:shadow-secondary/20',
    tertiary: 'hover:border-tertiary hover:shadow-tertiary/20',
  };
  return map[color] || map.secondary;
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return url.startsWith('https://') && !url.includes('your-project');
}

interface MappedEvent {
  day: string;
  title: string;
  time: string;
  description: string;
  icon: string;
  color: string;
  image: string;
}

function mapEvent(ev: Record<string, unknown>, locale: Locale): MappedEvent {
  let title = ev.title_en;
  let description = ev.description_en;
  let day = ev.day_label;

  if (locale === 'fr') {
    title = ev.title_fr || ev.title_en || ev.title_pt;
    description = ev.description_fr || ev.description_en || ev.description_pt;
    day = ev.day_label_fr || ev.day_label || ev.day_label_en || ev.day_label_pt;
  } else if (locale === 'pt') {
    title = ev.title_pt || ev.title_en || ev.title_fr;
    description = ev.description_pt || ev.description_en || ev.description_fr;
    day = ev.day_label_pt || ev.day_label || ev.day_label_en || ev.day_label_fr;
  } else {
    title = ev.title_en || ev.title_fr || ev.title_pt;
    description = ev.description_en || ev.description_fr || ev.description_pt;
    day = ev.day_label_en || ev.day_label || ev.day_label_fr || ev.day_label_pt;
  }

  return {
    day: day as string,
    title: title as string,
    time: (ev.time_range || ev.time) as string,
    description: description as string,
    icon: ev.icon as string,
    color: ev.color as string,
    image: (ev.image_url || ev.image) as string ?? '',
  };
}

async function fetchEvents(locale: Locale): Promise<MappedEvent[]> {
  if (!isSupabaseConfigured()) {
    try {
      const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const res = await fetch(`${base}/api/local/events`, { next: { revalidate: 0 } });
      if (res.ok) {
        const data = (await res.json()) as Record<string, unknown>[];
        if (Array.isArray(data) && data.length > 0) {
          const active = data.filter((ev) => ev.active !== false);
          if (active.length > 0) return active.map((ev) => mapEvent(ev, locale));
        }
      }
    } catch {}
    return FALLBACK_EVENTS.map((ev) => mapEvent(ev, locale));
  }
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    if (data && data.length > 0) {
      return (data as unknown as Record<string, unknown>[]).map((ev) => mapEvent(ev, locale));
    }
  } catch {
    // fallback
  }
  return FALLBACK_EVENTS.map((ev) => mapEvent(ev, locale));
}

export default async function EventsSection() {
  const locale = await getLocale();
  const t = getTranslator(locale);
  const events = await fetchEvents(locale);
  const preview = events.slice(0, 3);

  return (
    <section className="bg-surface-container-lowest py-section-gap overflow-hidden">
      <div className="container-max">
        <div className="text-center mb-16">
          <h2 className="font-display-mobile md:font-headline-md text-on-surface">{t('eventosPage.heroTitle')}</h2>
          <p className="text-on-surface-variant font-body-lg mt-4 max-w-xl mx-auto">{t('eventosPage.heroSubtitle')}</p>
          <div className="w-16 h-1 bg-secondary mx-auto mt-6 rounded-full opacity-50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter items-stretch">
          {preview.map((event) => (
            <div
              key={event.title}
              className={`group flex flex-col h-full overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-high transition-all shadow-sm hover:shadow-lg ${colorHover(event.color)}`}
            >
              <div className="aspect-[4/3] w-full relative overflow-hidden">
                <Image
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  src={event.image}
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-secondary text-on-secondary px-3 py-1 rounded font-label-caps text-[10px] uppercase font-bold tracking-wider">{event.day}</span>
                </div>
              </div>
              <div className="p-stack-md flex flex-col flex-grow">
                <h3 className="font-headline-sm text-[20px] lg:text-headline-sm text-on-surface mb-2">{event.title}</h3>
                <p className="text-on-surface-variant mb-6 text-body-md flex-grow">{event.description}</p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/10">
                  <span className="text-secondary font-bold font-label-caps">{event.time}</span>
                  <span className="material-symbols-outlined text-secondary">{event.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/eventos"
            className="inline-flex items-center gap-2 bg-transparent border-2 border-secondary text-secondary px-10 py-4 rounded-xl font-anybody font-bold text-[18px] hover:bg-secondary hover:text-on-secondary transition-all active:scale-95"
          >
            {t('eventosPage.heroTagline')}
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
