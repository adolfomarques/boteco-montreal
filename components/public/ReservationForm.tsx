'use client';

import { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '../../lib/i18n/LanguageProvider';

function isSupabaseConfigured(): boolean {
  if (typeof window === 'undefined') return false;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return url.startsWith('https://') && !url.includes('your-project');
}

export default function ReservationForm() {
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setStatus('idle');
    setMessage('');

    const form = e.currentTarget;
    const data = {
      reservation_date: (form.elements.namedItem('date') as HTMLInputElement).value,
      reservation_time: (form.elements.namedItem('time') as HTMLSelectElement).value,
      guests: parseInt((form.elements.namedItem('guests') as HTMLInputElement).value, 10),
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value,
      special_requests: (form.elements.namedItem('requests') as HTMLTextAreaElement).value || null,
      status: 'pending',
    };

    if (!isSupabaseConfigured()) {
      await new Promise((r) => setTimeout(r, 800));
      setStatus('success');
      setMessage(t('reservation.success'));
      setSubmitting(false);
      form.reset();
      return;
    }

    try {
      const { error } = await supabase.from('reservations').insert(data);
      if (error) throw error;
      setStatus('success');
      setMessage(t('reservation.success'));
      form.reset();
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : t('reservation.error'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="space-y-stack-md relative z-10" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
        <div>
          <label className="block font-label-caps mb-2 text-on-surface">{t('reservasPage.formDate')}</label>
          <input
            type="date"
            name="date"
            required
            className="bg-surface-container-low border border-outline-variant/20 w-full p-4 rounded-lg text-on-surface font-body-md focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
          />
        </div>
        <div>
          <label className="block font-label-caps mb-2 text-on-surface">{t('reservasPage.formTime')}</label>
          <select
            name="time"
            required
            className="bg-surface-container-low border border-outline-variant/20 w-full p-4 rounded-lg text-on-surface font-body-md focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30 appearance-none"
          >
            <option value="">{t('reservasPage.formTime')}</option>
            <option value="17:00">17:00</option>
            <option value="18:30">18:30</option>
            <option value="20:00">20:00</option>
            <option value="21:30">21:30</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
        <div>
          <label className="block font-label-caps mb-2 text-on-surface">{t('reservasPage.formGuests')}</label>
          <input
            type="number"
            name="guests"
            min="1"
            max="12"
            placeholder="2"
            required
            className="bg-surface-container-low border border-outline-variant/20 w-full p-4 rounded-lg text-on-surface font-body-md focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
          />
        </div>
        <div>
          <label className="block font-label-caps mb-2 text-on-surface">{t('reservasPage.formPhone')}</label>
          <input
            type="tel"
            name="phone"
            placeholder={t('reservasPage.formPhonePlaceholder')}
            required
            className="bg-surface-container-low border border-outline-variant/20 w-full p-4 rounded-lg text-on-surface font-body-md focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
          />
        </div>
      </div>
      <div>
        <label className="block font-label-caps mb-2 text-on-surface">{t('reservasPage.formName')}</label>
        <textarea
          name="requests"
          placeholder={t('reservasPage.formNamePlaceholder')}
          rows={3}
          className="bg-surface-container-low border border-outline-variant/20 w-full p-4 rounded-lg text-on-surface font-body-md focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/30"
        />
      </div>

      {message && (
        <div className={`p-4 rounded-lg font-body-md ${status === 'success' ? 'bg-primary/20 text-primary' : 'bg-error/20 text-error'}`}>
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-secondary hover:bg-secondary-fixed text-on-secondary py-5 rounded-lg font-anybody font-bold text-[18px] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? t('reservation.submitting') : t('reservation.submit')}
      </button>
    </form>
  );
}
