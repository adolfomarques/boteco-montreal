import React from 'react';
import ReservationForm from '@/components/public/ReservationForm';
import { getLocale, getTranslator } from '@/lib/i18n/server';
import { RESTAURANT, RESTAURANT_HOURS_ARRAY } from '@/lib/data/restaurant';

export default async function ReservasPage() {
  const locale = await getLocale();
  const t = getTranslator(locale);

  const FEATURES = [
    {
      icon: 'music_note',
      title: t('reservasPage.feature1Title'),
      description: t('reservasPage.feature1Desc'),
    },
    {
      icon: 'local_bar',
      title: t('reservasPage.feature2Title'),
      description: t('reservasPage.feature2Desc'),
    },
    {
      icon: 'celebration',
      title: t('reservasPage.feature3Title'),
      description: t('reservasPage.feature3Desc'),
    },
  ];

  return (
    <div className="container-max pt-24 pb-section-gap">
      <div className="mb-stack-lg">
        <h1 className="font-display-mobile md:font-display-lg text-primary tracking-tighter">
          {t('reservasPage.formTitle')}
        </h1>
        <p className="font-body-lg text-on-surface-variant max-w-2xl mt-stack-sm">
          {t('reservation.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-stretch">
        <div className="lg:col-span-7 glass-panel p-stack-lg rounded-xl flex flex-col relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
          <div className="mb-stack-md">
            <h2 className="font-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">restaurant</span>
              {t('reservasPage.formTitle')}
            </h2>
            <p className="font-label-caps text-on-surface-variant opacity-70">{t('reservasPage.infoTitle')}</p>
          </div>
          <ReservationForm />
        </div>

        <div className="lg:col-span-5 flex flex-col gap-gutter">
          <div className="bg-surface-container-high p-stack-lg rounded-xl border border-outline-variant/10">
            <h3 className="font-headline-sm text-tertiary mb-stack-md">{t('reservasPage.formName')}</h3>
            <div className="space-y-stack-md">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary">location_on</span>
                <div>
                  <p className="font-body-lg">{RESTAURANT.address.streetReservas}</p>
                  <p className="font-body-md text-on-surface-variant">{t('reservasPage.address')}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary">call</span>
                <p className="font-body-lg">{t('reservasPage.phone')}</p>
              </div>
              <div className="flex items-start gap-4 pt-stack-sm border-t border-outline-variant/10">
                <span className="material-symbols-outlined text-secondary">schedule</span>
                <div>
                  <p className="font-label-caps text-on-surface-variant mb-1">{t('reservasPage.hoursLabel')}</p>
                  <div className="grid grid-cols-2 gap-x-gutter gap-y-1 font-body-md">
                    {RESTAURANT_HOURS_ARRAY.map(({ key }) => {
                      const day = RESTAURANT.hours[key as keyof typeof RESTAURANT.hours];
                      const label = day.label[locale as keyof typeof day.label] || day.label.en;
                      return 'status' in day && day.status === 'closed' ? (
                        <span key={key} className="text-on-surface-variant text-error font-bold">{label}</span>
                      ) : null;
                    })}
                    {RESTAURANT_HOURS_ARRAY.filter(({ key }) => {
                      const day = RESTAURANT.hours[key as keyof typeof RESTAURANT.hours];
                      return !('status' in day && day.status === 'closed');
                    }).map(({ key }) => {
                      const day = RESTAURANT.hours[key as keyof typeof RESTAURANT.hours] as typeof RESTAURANT.hours.tue;
                      const label = day.label[locale as keyof typeof day.label] || day.label.en;
                      const hours = day.hours[locale as keyof typeof day.hours] || day.hours.en;
                      return (
                        <React.Fragment key={key}>
                          <span className="text-on-surface-variant">{label}</span>
                          <span>{hours}</span>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-grow rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container-lowest min-h-[300px] relative group">
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent('Restaurant Bar Boteco inc, ' + RESTAURANT.address.full)}&output=embed`}
              className="w-full h-full absolute inset-0 border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={t('reservasPage.mapAlt')}
            />
            <div className="absolute bottom-4 left-4 z-20">
              <a
                href="https://maps.app.goo.gl/SJQagBwD9u21L9RQ6"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-surface-container-highest/90 backdrop-blur-sm text-on-surface px-4 py-2 rounded-full font-label-caps flex items-center gap-2 border border-white/10 hover:bg-secondary hover:text-on-secondary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">directions</span>
                {t('reservasPage.openMaps')}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-section-gap grid grid-cols-1 md:grid-cols-3 gap-gutter">
        {FEATURES.map((feature) => (
          <div key={feature.title} className="p-stack-md text-center">
            <span
              className="material-symbols-outlined text-4xl text-secondary mb-2"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {feature.icon}
            </span>
            <h4 className="font-headline-sm mb-1">{feature.title}</h4>
            <p className="font-body-md text-on-surface-variant">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
