import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { WEEKLY_EVENTS as FALLBACK_EVENTS, GROUP_IMAGES } from '@/lib/data/events';
import { getLocale, getTranslator } from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/translations';
import EventsSection from '@/components/public/EventosPageSection';

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return url.startsWith('https://') && !url.includes('your-project');
}

interface WeeklyEvent {
  day: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
  image: string;
  highlight: boolean;
}

function mapEvent(ev: Record<string, unknown>, locale: Locale): WeeklyEvent {
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
    description: description as string,
    time: (ev.time_range || ev.time) as string,
    icon: ev.icon as string,
    color: ev.color as string,
    image: (ev.image_url || ev.image) as string ?? '',
    highlight: (ev.highlight as boolean) ?? false,
  };
}

async function fetchEvents(locale: Locale): Promise<WeeklyEvent[]> {
  if (!isSupabaseConfigured()) {
    try {
      const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const res = await fetch(`${base}/api/local/events`, { next: { revalidate: 0 } });
      if (res.ok) {
        const data = (await res.json()) as Record<string, unknown>[];
        if (Array.isArray(data) && data.length > 0) {
          const activeEvents = data.filter((ev) => ev.active !== false);
          if (activeEvents.length > 0) return activeEvents.map((ev) => mapEvent(ev, locale));
        }
      }
    } catch {}
    return FALLBACK_EVENTS.map(ev => mapEvent(ev, locale));
  }
  try {
    const { data } = await supabase.from('events').select('*').eq('active', true).order('sort_order');
    if (!data) return FALLBACK_EVENTS.map(ev => mapEvent(ev, locale));
    return (data as unknown as Record<string, unknown>[]).map((ev) => mapEvent(ev, locale));
  } catch {
    return FALLBACK_EVENTS.map(ev => mapEvent(ev, locale));
  }
}

const GROUP_IMAGES_CONST = GROUP_IMAGES;

export default async function EventosPage() {
  const locale = await getLocale();
  const t = getTranslator(locale);
  const WEEKLY_EVENTS = await fetchEvents(locale);

  const highlighted = WEEKLY_EVENTS.find((ev) => ev.highlight);

  return (
    <>
      <section className="relative min-h-[70vh] flex flex-col justify-start overflow-hidden copacabana-pattern pt-4 md:pt-6">
        <div className="absolute inset-0 opacity-20 organic-overlay pointer-events-none">
          <svg className="text-secondary opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%">
            <path d="M0 50 Q 25 30 50 50 T 100 50" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <path d="M0 60 Q 25 40 50 60 T 100 60" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>

        <div className="container-max relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-gutter items-center py-section-gap">
          <div className="space-y-stack-md">
            <div className="inline-flex items-center gap-2 bg-tertiary-container text-tertiary px-4 py-1.5 rounded-full font-label-caps border border-tertiary/20">
              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
              {highlighted
                ? `${highlighted.day} | ${highlighted.time}`
                : t('eventosPage.heroDate')}
            </div>
            <h1 className="font-display-mobile lg:font-display-lg leading-none uppercase text-white">
              {highlighted ? (
                highlighted.title
              ) : (
                <>{t('eventosPage.heroTitle1')} <span className="text-secondary">{t('eventosPage.heroTitle2')}</span></>
              )}
              <br />
              <span className="italic font-normal lowercase font-headline-md text-secondary/80">
                {highlighted ? t('eventosPage.heroSubtitle2') : t('eventosPage.heroSubtitle2')}
              </span>
            </h1>
            <p className="font-body-lg text-on-surface-variant max-w-md">
              {highlighted ? highlighted.description : t('eventosPage.heroDescription')}
            </p>
            {!highlighted && (
              <p className="italic text-secondary font-headline-sm text-[20px] lg:text-headline-sm">
                {t('eventosPage.heroTagline')}
              </p>
            )}
            <div className="flex flex-wrap gap-stack-md pt-stack-sm">
              <Link
                href="/reservas"
                className="inline-flex items-center justify-center bg-secondary text-on-secondary px-8 py-4 rounded-lg font-headline-sm font-bold hover:brightness-110 transition-all shadow-lg shadow-secondary/20"
              >
                {t('reservation.submit')}
              </Link>
              <Link
                href="/eventos?view=calendar#eventos-calendario"
                className="border-2 border-outline-variant text-on-surface px-8 py-4 rounded-lg font-headline-sm font-bold hover:bg-surface-variant transition-all inline-flex items-center justify-center"
              >
                {t('eventosPage.calendarBtn')}
              </Link>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end mt-12 lg:mt-0">
            <div className="relative w-full max-w-[480px] aspect-[3/4] bg-surface-container-high rounded-2xl overflow-hidden shadow-2xl border border-white/5">
              <Image
                className="object-cover"
                src={highlighted ? highlighted.image : '/carrosel/IMG_8301.jpg'}
                alt={highlighted ? highlighted.title : t('eventosPage.heroImageAlt')}
                fill
                sizes="(max-width: 480px) 100vw, 480px"
              />
            </div>
          </div>
        </div>
      </section>

      <EventsSection weeklyEvents={WEEKLY_EVENTS} />

      <section className="bg-surface py-section-gap overflow-hidden relative">
        <div className="container-max relative z-10">
          <div className="glass-card rounded-3xl p-8 lg:p-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 space-y-stack-md text-center lg:text-left order-2 lg:order-1">
              <h2 className="font-display-mobile lg:font-display-lg text-white">{t('eventosPage.groupTitle')}</h2>
              <p className="text-body-lg text-on-surface-variant max-w-lg mx-auto lg:mx-0">
                {t('eventosPage.groupSubtitle')}
              </p>
              <div className="space-y-4 py-4">
                {[
                  t('eventosPage.groupFeature1'),
                  t('eventosPage.groupFeature2'),
                  t('eventosPage.groupFeature3'),
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 justify-center lg:justify-start">
                    <span className="material-symbols-outlined text-secondary">check_circle</span>
                    <span className="text-on-surface">{item}</span>
                  </div>
                ))}
              </div>
              <div className="pt-stack-md">
                <button className="bg-secondary text-on-secondary px-10 py-4 rounded-xl font-anybody font-bold text-[18px] hover:scale-105 transition-transform active:scale-95 shadow-xl shadow-secondary/20">
                  {t('eventosPage.groupCta')}
                </button>
              </div>
            </div>

            <div className="flex-1 w-full order-1 lg:order-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden aspect-square h-48 md:h-64 lg:h-48 xl:h-64 shadow-lg">
                    <div className="relative w-full h-full">
                      <Image className="object-cover" src={GROUP_IMAGES_CONST[0]} alt={t('eventosPage.imgAlt1')} fill sizes="(max-width: 1024px) 50vw, 25vw" />
                    </div>
                  </div>
                  <div className="rounded-2xl overflow-hidden aspect-[3/4] shadow-lg">
                    <div className="relative w-full h-full">
                      <Image className="object-cover" src={GROUP_IMAGES_CONST[1]} alt={t('eventosPage.imgAlt2')} fill sizes="(max-width: 1024px) 50vw, 25vw" />
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="rounded-2xl overflow-hidden aspect-[3/4] shadow-lg">
                    <div className="relative w-full h-full">
                      <Image className="object-cover" src={GROUP_IMAGES_CONST[2]} alt={t('eventosPage.imgAlt3')} fill sizes="(max-width: 1024px) 50vw, 25vw" />
                    </div>
                  </div>
                  <div className="rounded-2xl overflow-hidden aspect-square h-48 md:h-64 lg:h-48 xl:h-64 shadow-lg">
                    <div className="relative w-full h-full">
                      <Image className="object-cover" src={GROUP_IMAGES_CONST[3]} alt={t('eventosPage.imgAlt4')} fill sizes="(max-width: 1024px) 50vw, 25vw" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
