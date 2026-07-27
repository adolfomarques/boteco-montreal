'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../lib/i18n/LanguageProvider';
import { RESTAURANT } from '../../lib/data/restaurant';

const BG_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuC73XCxr_9-fvhz9szbRnGOk_94W5GqeLKjyOwSWhDJgWcbwSHeeWPYSnvR2ENTWkKPBNb6ssrPRGBZt85ftfECaRD6SKMUblWYxuE3Sil3cODrmSIDJZcLfmvQXv8F-7-b69yXbkRxkqz-IQVlk5VFllilZMkc1msllcwL3pX8yZuBsEdIlWA3IWPqQDNb8rxM9Pi4NEz9-RtnIOr7VeGcd4mU9aJgLorhtBedXuYjkh-k7Lf39SdNR9rKCASFrQYGycKejEkAB50';

const MAP_URL = `https://www.google.com/maps?q=${encodeURIComponent('Restaurant Bar Boteco inc, ' + RESTAURANT.address.full)}&output=embed`;

function useBenefits(t: (path: string) => string) {
  return [t('reservation.benefit1'), t('reservation.benefit2'), t('reservation.benefit3')];
}

export default function ReservationSection() {
  const { t } = useLanguage();
  const router = useRouter();
  const BENEFITS = useBenefits(t);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    router.push('/reservas');
  }, [router]);

  return (
    <section className="relative overflow-hidden pb-section-gap" id="reservas">
      <div className="absolute inset-0 z-0">
        <div
          className="w-full h-full bg-cover bg-center opacity-20 grayscale"
          style={{ backgroundImage: `url('${BG_IMAGE}')` }}
        />
        <div className="absolute inset-0 bg-background/95" />
      </div>

      <div className="relative z-10 container-max">
        <div className="bg-surface-container-high/40 backdrop-blur-xl p-8 md:p-16 rounded-[40px] border border-outline-variant/10 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="max-w-md">
              <h2 className="font-display-mobile md:font-headline-md mb-6">{t('reservation.sectionTitle')}</h2>
              <p className="font-body-lg text-on-surface-variant mb-10">
                {t('reservation.subtitle')}
              </p>
              <ul className="space-y-6 mb-10">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-4 text-on-surface">
                    <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-full">
                      check_circle
                    </span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-6">
              <form onSubmit={handleSubmit} className="glass-card p-8 md:p-10 rounded-3xl flex flex-col gap-6 shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="res-date" className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
                      {t('reservation.dateLabel')}
                    </label>
                    <input
                      id="res-date"
                      name="date"
                      type="date"
                      className="bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none p-3 text-sm w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="res-time" className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
                      {t('reservation.timeLabel')}
                    </label>
                    <select id="res-time" name="time" className="bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none p-3 text-sm w-full appearance-none">
                      <option>18:00</option>
                      <option>19:00</option>
                      <option>20:00</option>
                      <option>21:00</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="res-guests" className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
                    {t('reservation.guestsLabel')}
                  </label>
                  <input
                    id="res-guests"
                    name="guests"
                    type="number"
                    placeholder="2"
                    className="bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface focus:ring-2 focus:ring-secondary/50 focus:border-secondary outline-none p-3 text-sm w-full"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-secondary text-on-secondary py-5 rounded-2xl font-anybody font-bold text-[18px] mt-4 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-secondary/20"
                >
                  {t('reservation.submit')}
                </button>
              </form>
            </div>
          </div>

          <div className="mt-8 rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              src={MAP_URL}
              className="w-full"
              style={{ height: 320 }}
              loading="lazy"
              title="Boteco Montreal - Google Maps"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
