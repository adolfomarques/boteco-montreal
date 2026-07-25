'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import EventCalendar from './EventCalendar';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

interface WeeklyEvent {
  title: string;
  day: string;
  time: string;
  description: string;
  icon: string;
  color: string;
  image: string;
}

function colorClass(color: string, type: 'border' | 'shadow') {
  const map: Record<string, string> = {
    primary: type === 'border' ? 'hover:border-secondary' : 'hover:shadow-secondary/20',
    secondary: type === 'border' ? 'hover:border-secondary' : 'hover:shadow-secondary/20',
    tertiary: type === 'border' ? 'hover:border-tertiary' : 'hover:shadow-tertiary/20',
  };
  return map[color] || map.secondary;
}

function chipClass(color: string) {
  const map: Record<string, string> = {
    primary: 'bg-primary text-on-primary',
    secondary: 'bg-secondary text-on-secondary',
    tertiary: 'bg-tertiary text-on-tertiary',
  };
  return map[color] || map.secondary;
}

function textClass(color: string) {
  const map: Record<string, string> = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    tertiary: 'text-tertiary',
  };
  return map[color] || map.secondary;
}

export default function EventsSection({
  weeklyEvents,
}: {
  weeklyEvents: WeeklyEvent[];
}) {
  const { t, locale } = useLanguage();
  const searchParams = useSearchParams();
  const [view, setView] = useState<'list' | 'calendar'>('list');

  useEffect(() => {
    if (searchParams?.get('view') === 'calendar') {
      setView('calendar');
    }
  }, [searchParams]);

  useEffect(() => {
    if (view === 'calendar' && window.location.hash === '#eventos-calendario') {
      setTimeout(() => {
        document.getElementById('eventos-calendario')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [view]);

  const calendarEvents = weeklyEvents.map((ev) => ({
    day: ev.day,
    title: ev.title,
    description: ev.description,
    time: ev.time,
    icon: ev.icon,
    color: ev.color,
    image: ev.image,
  }));

  return (
    <section id="eventos-calendario" className="bg-surface-container-low py-section-gap">
      <div className="container-max">
        <div className="flex flex-col md:flex-row justify-between items-end gap-stack-md mb-stack-lg">
          <div>
            <h2 className="font-headline-md text-on-surface">{t('eventosPage.heroTitle')}</h2>
            <p className="text-on-surface-variant max-w-xl">
              {t('eventosPage.heroSubtitle')}
            </p>
          </div>
          <div className="flex bg-surface-container rounded-lg p-1">
            <button
              className={`px-4 py-2 rounded-md font-label-caps transition-colors ${
                view === 'calendar'
                  ? 'bg-surface-bright text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => setView('calendar')}
            >
              {t('eventosPage.calendarBtn')}
            </button>
            <button
              className={`px-4 py-2 rounded-md font-label-caps transition-colors ${
                view === 'list'
                  ? 'bg-surface-bright text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => setView('list')}
            >
              {t('eventosPage.listBtn')}
            </button>
          </div>
        </div>

        {view === 'calendar' ? (
          <EventCalendar events={calendarEvents} locale={locale} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter items-stretch">
            {weeklyEvents.map((event) => (
              <div
                key={event.title}
                className={`group flex flex-col h-full overflow-hidden rounded-xl border border-outline-variant/10 bg-surface-container-high transition-all ${colorClass(event.color, 'border')} ${colorClass(event.color, 'shadow')}`}
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
                    <span className={`${chipClass(event.color)} px-3 py-1 rounded font-label-caps text-[10px] uppercase font-bold tracking-wider`}>
                      {event.day}
                    </span>
                  </div>
                </div>
                <div className="p-stack-md flex flex-col flex-grow">
                  <h3 className="font-headline-sm text-[20px] lg:text-headline-sm text-on-surface mb-2">{event.title}</h3>
                  <p className="text-on-surface-variant mb-6 text-body-md flex-grow">{event.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-outline-variant/10">
                    <span className={`${textClass(event.color)} font-bold font-label-caps`}>{event.time}</span>
                    <span className={`material-symbols-outlined ${textClass(event.color)}`}>{event.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
