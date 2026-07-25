'use client';

import React, { useState, useMemo } from 'react';

interface CalendarEvent {
  day: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  color: string;
  image: string;
}

const DAY_MAP: Record<string, number> = {
  SUNDAY: 0, DOMINGO: 0,
  MONDAY: 1, SEGUNDA: 1,
  TUESDAY: 2, TERCA: 2, TERÇA: 2,
  WEDNESDAY: 3, QUARTA: 3,
  THURSDAY: 4, QUINTA: 4,
  FRIDAY: 5, SEXTA: 5,
  SATURDAY: 6, SABADO: 6, SÁBADO: 6,
};

function getDayIndex(dayLabel: string): number | null {
  const upper = dayLabel.toUpperCase();
  for (const [key, val] of Object.entries(DAY_MAP)) {
    if (upper.includes(key)) return val;
  }
  return null;
}

function getEventsForDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  const dayOfWeek = date.getDay();
  return events.filter((ev) => {
    const idx = getDayIndex(ev.day);
    return idx === dayOfWeek;
  });
}

const MONTHS_LOCALE: Record<string, string[]> = {
  pt: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ],
  fr: [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
};

const DAY_HEADERS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const COLOR_MAP: Record<string, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  tertiary: 'bg-tertiary',
};

export default function EventCalendar({ events, locale = 'pt' }: { events: CalendarEvent[]; locale?: string }) {
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const weeks = useMemo(() => {
    const cells: (number | null)[][] = [];
    let week: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) week.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      week.push(d);
      if (week.length === 7) {
        cells.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      cells.push(week);
    }
    return cells;
  }, [daysInMonth, firstDayOfWeek]);

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return getEventsForDate(events, selectedDate);
  }, [events, selectedDate]);

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  }

  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  }

  function isToday(d: number) {
    return d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  }

  function isSelected(d: number) {
    return selectedDate?.getDate() === d && selectedDate?.getMonth() === month && selectedDate?.getFullYear() === year;
  }

  const months = MONTHS_LOCALE[locale] || MONTHS_LOCALE.pt;
  let selectedDateStr = '';
  if (selectedDate) {
    if (locale === 'en') {
      selectedDateStr = `${months[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
    } else if (locale === 'fr') {
      selectedDateStr = `${selectedDate.getDate()} ${months[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`;
    } else {
      selectedDateStr = `${selectedDate.getDate()} de ${months[selectedDate.getMonth()]} de ${selectedDate.getFullYear()}`;
    }
  }

  const dayNames = locale === 'en'
    ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    : locale === 'fr'
    ? ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    : DAY_HEADERS;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors"
          aria-label={locale === 'en' ? 'Previous month' : locale === 'fr' ? 'Mois précédent' : 'Mês anterior'}
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>
        <h3 className="font-headline-sm text-on-surface">
          {months[month]} {year}
        </h3>
        <button
          onClick={nextMonth}
          className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors"
          aria-label={locale === 'en' ? 'Next month' : locale === 'fr' ? 'Mois suivant' : 'Próximo mês'}
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map((d) => (
            <div key={d} className="text-center font-label-caps text-[10px] text-on-surface-variant py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((d, di) => {
                if (d === null) return <div key={`e-${di}`} />;
                const dateObj = new Date(year, month, d);
                const dayEvents = getEventsForDate(events, dateObj);
                return (
                  <button
                    key={d}
                    onClick={() => setSelectedDate(dateObj)}
                    className={`relative flex flex-col items-center justify-center rounded-xl min-h-[48px] transition-all ${
                      isSelected(d)
                        ? 'bg-secondary text-on-secondary'
                        : isToday(d)
                        ? 'bg-secondary/20 text-secondary font-bold'
                        : 'hover:bg-surface-container-high text-on-surface'
                    }`}
                  >
                    <span className="font-body-md text-sm leading-none">{d}</span>
                    {dayEvents.length > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {dayEvents.slice(0, 3).map((ev, i) => (
                          <span
                            key={i}
                            className={`w-1 h-1 rounded-full ${COLOR_MAP[ev.color] || 'bg-secondary'}`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selectedEvents.length > 0 && (
        <div className="border-t border-outline-variant/10 p-6 space-y-4">
          <p className="font-label-caps text-[11px] text-on-surface-variant">
            {selectedDateStr}
          </p>
          {selectedEvents.map((ev) => (
            <div key={ev.title} className="flex items-start gap-4 p-4 rounded-xl bg-surface-container-high">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${COLOR_MAP[ev.color] || 'bg-secondary'} bg-opacity-20`}>
                <span className="material-symbols-outlined text-on-secondary">{ev.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-headline-sm text-[16px] text-on-surface mb-1">{ev.title}</h4>
                <p className="text-on-surface-variant text-sm line-clamp-2">{ev.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="font-label-caps text-[10px] text-secondary">{ev.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedDate && selectedEvents.length === 0 && (
        <div className="border-t border-outline-variant/10 p-6 text-center">
          <p className="font-label-caps text-[11px] text-on-surface-variant mb-2">{selectedDateStr}</p>
          <p className="text-on-surface-variant text-sm">
            {locale === 'en'
              ? 'No events scheduled for this day'
              : locale === 'fr'
              ? 'Aucun événement prévu pour ce jour'
              : 'Nenhum evento neste dia'}
          </p>
        </div>
      )}
    </div>
  );
}
