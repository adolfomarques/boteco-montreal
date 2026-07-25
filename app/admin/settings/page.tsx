'use client';

import React, { useState, useEffect } from 'react';
import AdminTopBar from '@/components/admin/AdminTopBar';
import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { isSupabaseConfigured } from '@/components/admin/AuthProvider';
import { RESTAURANT } from '@/lib/data/restaurant';

const STORAGE_KEY = 'boteco_admin_settings';

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

interface DayHours {
  label: { pt: string; fr: string; en: string };
  status?: 'closed';
  hours?: { pt: string; fr: string; en: string };
}

interface RestaurantSettings {
  name: string;
  tagline: string;
  description: { pt: string; fr: string; en: string };
  address: { full: string; street: string; city: string; province: string; postal: string };
  phone: string;
  email: string;
  hours: Record<DayKey, DayHours>;
  social: { instagram: string; facebook: string; instagramHandle: string };
}

function loadLocal(): RestaurantSettings {
  if (typeof window === 'undefined') return RESTAURANT as unknown as RestaurantSettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : RESTAURANT as unknown as RestaurantSettings;
  } catch { return RESTAURANT as unknown as RestaurantSettings; }
}

function saveLocal(data: RestaurantSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

async function syncToApi(data: RestaurantSettings) {
  try {
    await fetch('/api/local/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {}
}

const DAY_ORDER: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const DAY_LABELS = { mon: 'Segunda', tue: 'Terça', wed: 'Quarta', thu: 'Quinta', fri: 'Sexta', sat: 'Sábado', sun: 'Domingo' };

type TabKey = 'general' | 'address' | 'hours' | 'social';

export default function AdminSettingsPage() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<RestaurantSettings>(loadLocal());
  const [activeTab, setActiveTab] = useState<TabKey>('general');
  const [saved, setSaved] = useState(false);

  function updateField(path: string, value: any) {
    setSettings((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj: any = copy;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return copy;
    });
    setSaved(false);
  }

  function toggleDayStatus(day: DayKey) {
    setSettings((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      if (copy.hours[day].status === 'closed') {
        delete copy.hours[day].status;
        copy.hours[day].hours = { pt: '15h - 23h', fr: '15h - 23h', en: '3PM - 11PM' };
      } else {
        copy.hours[day].status = 'closed';
      }
      return copy;
    });
    setSaved(false);
  }

  function handleSave() {
    saveLocal(settings);
    syncToApi(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'general', label: 'Gerais', icon: 'settings' },
    { key: 'address', label: 'Endereço & Contato', icon: 'location_on' },
    { key: 'hours', label: 'Horários', icon: 'schedule' },
    { key: 'social', label: 'Redes Sociais', icon: 'alternate_email' },
  ];

  return (
    <>
      <AdminTopBar title="Settings" />
      <div className="p-gutter max-w-container-max w-full mx-auto space-y-4 pb-24">
        {!isSupabaseConfigured() && (
          <div className="bg-secondary/10 text-secondary p-4 rounded-lg font-body-md text-sm flex items-center gap-3">
            <span className="material-symbols-outlined text-sm">cloud_off</span>
            Modo local — dados salvos no navegador. Conecte o Supabase para persistência remota.
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-label-caps text-sm transition-all ${
                activeTab === tab.key
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="glass-card p-4 rounded-xl">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <h3 className="font-bold text-on-surface">Informações Gerais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-label-caps text-on-surface-variant">Nome do restaurante</label>
                  <input className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:ring-2 focus:ring-secondary outline-none"
                    value={settings.name} onChange={(e) => updateField('name', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-label-caps text-on-surface-variant">Tagline</label>
                  <input className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:ring-2 focus:ring-secondary outline-none"
                    value={settings.tagline} onChange={(e) => updateField('tagline', e.target.value)} />
                </div>
              </div>
              {(['pt', 'fr', 'en'] as const).map((lang) => (
                <div key={lang} className="space-y-1.5">
                  <label className="text-[10px] font-label-caps text-on-surface-variant uppercase">Descrição ({lang})</label>
                  <textarea className="w-full h-24 bg-surface-container-low border border-outline-variant rounded-lg p-3 text-sm text-on-surface resize-none focus:ring-2 focus:ring-secondary outline-none"
                    value={settings.description[lang]} onChange={(e) => updateField(`description.${lang}`, e.target.value)} />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'address' && (
            <div className="space-y-6">
              <h3 className="font-headline-sm text-on-surface">Endereço & Contato</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-label-caps text-on-surface-variant">Endereço completo</label>
                  <input className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:ring-2 focus:ring-secondary outline-none"
                    value={settings.address.full} onChange={(e) => updateField('address.full', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-label-caps text-on-surface-variant">Rua</label>
                  <input className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:ring-2 focus:ring-secondary outline-none"
                    value={settings.address.street} onChange={(e) => updateField('address.street', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-label-caps text-on-surface-variant">Cidade</label>
                  <input className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:ring-2 focus:ring-secondary outline-none"
                    value={settings.address.city} onChange={(e) => updateField('address.city', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-label-caps text-on-surface-variant">Província</label>
                  <input className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:ring-2 focus:ring-secondary outline-none"
                    value={settings.address.province} onChange={(e) => updateField('address.province', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-label-caps text-on-surface-variant">CEP</label>
                  <input className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:ring-2 focus:ring-secondary outline-none"
                    value={settings.address.postal} onChange={(e) => updateField('address.postal', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-label-caps text-on-surface-variant">Telefone</label>
                  <input className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:ring-2 focus:ring-secondary outline-none"
                    value={settings.phone} onChange={(e) => updateField('phone', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-label-caps text-on-surface-variant">Email</label>
                  <input className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:ring-2 focus:ring-secondary outline-none"
                    value={settings.email} onChange={(e) => updateField('email', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hours' && (
            <div className="space-y-6">
              <h3 className="font-headline-sm text-on-surface">Horários de Funcionamento</h3>
              <div className="space-y-3">
                {DAY_ORDER.map((day) => {
                  const d = settings.hours[day];
                  const isClosed = d.status === 'closed';
                  return (
                    <div key={day} className="flex flex-wrap items-center gap-4 p-4 bg-surface-container-low rounded-xl">
                      <div className="w-24 font-bold text-on-surface">{DAY_LABELS[day]}</div>
                      <button
                        onClick={() => toggleDayStatus(day)}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold ${
                          isClosed ? 'bg-error/20 text-error' : 'bg-primary/20 text-primary'
                        }`}
                      >
                        {isClosed ? 'Fechado' : 'Aberto'}
                      </button>
                      {!isClosed && d.hours && (
                        <div className="flex gap-2 flex-wrap">
                          {(['pt', 'fr', 'en'] as const).map((lang) => (
                            <div key={lang} className="flex items-center gap-1">
                              <span className="text-[10px] font-label-caps text-on-surface-variant uppercase">{lang}</span>
                              <input
                                className="w-28 bg-surface-container border border-outline-variant rounded-xl p-2 text-sm text-on-surface focus:ring-2 focus:ring-secondary outline-none"
                                value={d.hours![lang]}
                                onChange={(e) => updateField(`hours.${day}.hours.${lang}`, e.target.value)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-6">
              <h3 className="font-headline-sm text-on-surface">Redes Sociais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-label-caps text-on-surface-variant">Instagram (URL completa)</label>
                  <input className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:ring-2 focus:ring-secondary outline-none"
                    value={settings.social.instagram} onChange={(e) => updateField('social.instagram', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-label-caps text-on-surface-variant">Instagram (@handle)</label>
                  <input className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:ring-2 focus:ring-secondary outline-none"
                    value={settings.social.instagramHandle} onChange={(e) => updateField('social.instagramHandle', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-label-caps text-on-surface-variant">Facebook (URL completa)</label>
                  <input className="w-full bg-surface-container-low border border-outline-variant rounded-xl p-3 text-sm text-on-surface focus:ring-2 focus:ring-secondary outline-none"
                    value={settings.social.facebook} onChange={(e) => updateField('social.facebook', e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="px-8 py-3 bg-secondary text-on-secondary rounded-xl font-bold shadow-lg shadow-secondary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined">save</span>
            Salvar alterações
          </button>
          {saved && (
            <span className="text-primary font-bold text-sm">Salvo!</span>
          )}
        </div>
      </div>
    </>
  );
}
