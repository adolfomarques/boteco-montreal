import React from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { CATEGORIES, ENTREES, PLATS, DRINKS_DESSERTS } from '@/lib/data/menu';
import { getLocale, getTranslator } from '@/lib/i18n/server';
import type { Locale } from '@/lib/i18n/translations';
import MenuCategoryTabs from '@/components/public/MenuCategoryTabs';

const FALLBACK_ITEM_IMG = 'https://placehold.co/600x400/1d2021/e1e3e4?text=Boteco+Montreal';

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return url.startsWith('https://') && !url.includes('your-project');
}

interface MenuItemDisplay {
  name: string;
  price: string;
  description: string;
  image?: string;
  badge?: string;
  portion?: string;
  tagline?: string;
  featured?: boolean;
  type?: string;
}

function mapMenuItem(item: Record<string, unknown>, locale: Locale): MenuItemDisplay {
  let name = item.name_en;
  let description = item.description_en;
  let badge = item.badge_en;
  let tagline = item.tagline_en;
  let portion = item.portion;
  let type = item.type;

  if (locale === 'fr') {
    name = item.name_fr || item.name_en || item.name_pt;
    description = item.description_fr || item.description_en || item.description_pt;
    badge = item.badge_fr || item.badge_en || item.badge_pt;
    tagline = item.tagline_fr || item.tagline_en || item.tagline_pt;
    portion = item.portion_fr || item.portion_en || item.portion_pt || item.portion;
    type = item.type_fr || item.type_en || item.type_pt || item.type;
  } else if (locale === 'pt') {
    name = item.name_pt || item.name_en || item.name_fr;
    description = item.description_pt || item.description_en || item.description_fr;
    badge = item.badge_pt || item.badge_en || item.badge_fr;
    tagline = item.tagline_pt || item.tagline_en || item.tagline_fr;
    portion = item.portion_pt || item.portion_en || item.portion_fr || item.portion;
    type = item.type_pt || item.type_en || item.type_fr || item.type;
  } else {
    name = item.name_en || item.name_fr || item.name_pt;
    description = item.description_en || item.description_fr || item.description_pt;
    badge = item.badge_en || item.badge_fr || item.badge_pt;
    tagline = item.tagline_en || item.tagline_fr || item.tagline_pt;
    portion = item.portion_en || item.portion_fr || item.portion_pt || item.portion;
    type = item.type_en || item.type_fr || item.type_pt || item.type;
  }

  let priceStr = '';
  if (item.price !== undefined) {
    if (typeof item.price === 'number') {
      priceStr = `${item.price}$`;
    } else {
      priceStr = String(item.price);
    }
  }

  return {
    name: name as string,
    price: priceStr,
    description: description as string,
    image: (item.image_url || item.image) as string | undefined ?? undefined,
    badge: (badge as string) ?? undefined,
    portion: (portion as string) ?? undefined,
    tagline: (tagline as string) ?? undefined,
    featured: item.featured as boolean | undefined,
    type: (type as string) ?? undefined,
  };
}

async function fetchMenuItems(locale: Locale): Promise<{
  entrees: { featured: MenuItemDisplay[]; list: MenuItemDisplay[] };
  plats: { featured: MenuItemDisplay; secondary: MenuItemDisplay[] };
  drinks_desserts: MenuItemDisplay[];
}> {
  if (!isSupabaseConfigured()) {
    try {
      const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const res = await fetch(`${base}/api/local/menu`, { next: { revalidate: 0 } });
      if (res.ok) {
        const data = (await res.json()) as {
          entrees?: { featured?: Record<string, unknown>[]; list?: Record<string, unknown>[] };
          plats?: { featured?: Record<string, unknown>; secondary?: Record<string, unknown>[] };
          drinks_desserts?: Record<string, unknown>[];
        };
        if ((data.entrees?.featured?.length ?? 0) > 0) {
          return {
            entrees: {
              featured: (data.entrees?.featured || []).map((e) => mapMenuItem(e, locale)),
              list: (data.entrees?.list || []).map((e) => mapMenuItem(e, locale)),
            },
            plats: {
              featured: data.plats?.featured ? mapMenuItem(data.plats.featured, locale) : mapMenuItem(PLATS.featured, locale),
              secondary: (data.plats?.secondary || []).map((p) => mapMenuItem(p, locale)),
            },
            drinks_desserts: (data.drinks_desserts || []).map((d) => mapMenuItem(d, locale)),
          };
        }
      }
    } catch {}
    return {
      entrees: {
        featured: ENTREES.featured.map(e => mapMenuItem(e, locale)),
        list: ENTREES.list.map(e => mapMenuItem(e, locale)),
      },
      plats: {
        featured: mapMenuItem(PLATS.featured, locale),
        secondary: PLATS.secondary.map(p => mapMenuItem(p, locale)),
      },
      drinks_desserts: DRINKS_DESSERTS.map(d => mapMenuItem(d, locale)),
    };
  }

  try {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*, menu_categories!inner(slug)')
      .eq('active', true)
      .order('sort_order');

    if (error || !data) throw error;

    const rows = data as unknown as (Record<string, unknown> & { menu_categories?: { slug: string } })[];
    const entrees = rows.filter(r => (r.menu_categories as { slug: string })?.slug === 'entrees');
    const plats = rows.filter(r => (r.menu_categories as { slug: string })?.slug === 'plats');
    const drinks = rows.filter(r => ['desserts', 'bebidas'].includes((r.menu_categories as { slug: string })?.slug ?? ''));

    const featuredPlat = plats.find(p => p.featured as boolean);

    return {
      entrees: {
        featured: entrees.filter(e => e.featured as boolean).map(e => mapMenuItem(e, locale)),
        list: entrees.filter(e => !(e.featured as boolean)).map(e => mapMenuItem(e, locale)),
      },
      plats: {
        featured: featuredPlat ? mapMenuItem(featuredPlat, locale) : mapMenuItem(PLATS.featured, locale),
        secondary: plats.filter(p => !(p.featured as boolean)).map(p => mapMenuItem(p, locale)),
      },
      drinks_desserts: drinks.map(d => mapMenuItem(d, locale)),
    };
  } catch {
    return {
      entrees: {
        featured: ENTREES.featured.map(e => mapMenuItem(e, locale)),
        list: ENTREES.list.map(e => mapMenuItem(e, locale)),
      },
      plats: {
        featured: mapMenuItem(PLATS.featured, locale),
        secondary: PLATS.secondary.map(p => mapMenuItem(p, locale)),
      },
      drinks_desserts: DRINKS_DESSERTS.map(d => mapMenuItem(d, locale)),
    };
  }
}

export default async function MenuPage() {
  const locale = await getLocale();
  const t = getTranslator(locale);
  const menuData = await fetchMenuItems(locale);
  const { entrees, plats, drinks_desserts } = menuData;

  const localizedCategories = CATEGORIES.map((cat) => ({
    ...cat,
    label: cat.id === 'entrees' ? t('menuPage.catEntrees')
      : cat.id === 'plats' ? t('menuPage.catPlats')
      : cat.id === 'desserts' ? t('menuPage.catDesserts')
      : cat.id === 'bebidas' ? t('menuPage.catBebidas')
      : cat.label,
    default: cat.default ?? false,
  }));

  return (
    <>
      <header className="relative h-[60vh] flex items-end pb-section-gap overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10" />
          <Image
            className="object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBqCHmIQsqjKtMy1sTJCqG89BsHNLBtL-lFj0tW4CoEHPDN8DQ8-SFn3r1DlOTLAvpcfje4Y4NUcBWpV6K6E24ZwnaNlcKi9o_M5Nb3_iLIYkvDO3mdWYANj5ushfGAXQ8gFSaWw_PwZAdWPYk3k3XhrbuaAkx_UFQZ5IQQVHEN0l3xF7JrH0-IH8GZE-ReB8E720ccxMWUH-wghwLqkX3WaWSNINNEx6OcELNfMJry4S-CqfSgCCLMUqlOa3GxXlfXhKoFwGROt0"
            alt={t('menuPage.heroImageAlt')}
            fill
            sizes="100vw"
          />
        </div>
        <div className="relative z-20 container-max w-full">
          <span className="inline-block px-3 py-1 bg-tertiary-container text-tertiary rounded-sm mb-stack-md font-label-caps">
            {t('menuPage.heroBadge')}
          </span>
          <h1 className="font-display-mobile md:font-display-lg max-w-2xl">{t('menuPage.heroTitle')}</h1>
        </div>
      </header>

      <MenuCategoryTabs categories={localizedCategories} />

      <div className="container-max py-section-gap">
        <section className="mb-section-gap scroll-mt-24" id="entrees">
          <div className="flex justify-between items-end mb-stack-lg bg-secondary/5 pl-stack-md py-4 rounded-r-xl">
            <div>
              <span className="font-label-caps text-secondary">{t('menuPage.sectionClassics')}</span>
              <h2 className="font-headline-md">{t('menuPage.sectionClassicsTitle')}</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {entrees.featured.map((item) => (
              <div key={item.name} className="group glass-card rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:border-secondary/40">
                <div className="aspect-[3/4] overflow-hidden relative">
                  <Image
                    className="object-cover"
                    src={item.image || FALLBACK_ITEM_IMG}
                    alt={item.name}
                    loading="lazy"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-stack-md flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-headline-sm">{item.name}</h3>
                    <span className="text-secondary font-bold font-body-lg">{item.price}</span>
                  </div>
                  <p className="text-on-surface-variant text-body-md flex-grow">{item.description}</p>
                  {'badge' in item && item.badge && (
                    <div className="mt-stack-md flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-sm">stars</span>
                      <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">{item.badge}</span>
                    </div>
                  )}
                  {'portion' in item && item.portion && (
                    <div className="mt-stack-md">
                      <span className="bg-surface-container-highest px-3 py-1 rounded-full font-label-caps text-[10px] text-on-surface">{item.portion}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-stack-md">
              {entrees.list.map((item) => (
                <div key={item.name} className="glass-card p-stack-md rounded-xl hover:bg-secondary/5 transition-all">
                  <div className="flex justify-between mb-1">
                    <h4 className="font-bold text-on-surface">{item.name}</h4>
                    <span className="text-secondary">{item.price}</span>
                  </div>
                  <p className="text-on-surface-variant text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-section-gap scroll-mt-24" id="plats">
          <div className="flex items-center gap-stack-md mb-stack-lg bg-tertiary/5 pl-stack-md py-4 rounded-r-xl">
            <div>
              <span className="font-label-caps text-tertiary">{t('menuPage.sectionSoul')}</span>
              <h2 className="font-headline-md">{t('menuPage.sectionSoulTitle')}</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            <div className="lg:col-span-8 group relative rounded-2xl overflow-hidden h-[500px]">
                <Image
                  className="object-cover"
                  src={plats.featured.image || FALLBACK_ITEM_IMG}
                  alt={plats.featured.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-stack-lg w-full">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-stack-md">
                  <div className="max-w-xl">
                    <h3 className="font-display-mobile md:font-headline-md mb-2">{plats.featured.name}</h3>
                    <p className="text-on-surface-variant text-body-lg">{plats.featured.description}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-display-mobile md:font-display-lg text-secondary">{plats.featured.price}</span>
                    <button className="bg-secondary text-on-secondary px-8 py-3 rounded-xl font-label-caps text-label-caps font-bold mt-stack-md hover:bg-secondary-fixed transition-colors">
                      {t('menuPage.commander')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-gutter">
              {plats.secondary.map((item) => (
                <div key={item.name} className="glass-card p-stack-md rounded-xl flex-grow flex flex-col bg-tertiary/5">
                  <div className="flex justify-between items-start mb-stack-sm">
                    <h3 className="font-headline-sm">{item.name}</h3>
                    <span className="text-tertiary font-bold">{item.price}</span>
                  </div>
                  {'tagline' in item && item.tagline && (
                    <p className="text-on-surface-variant text-sm flex-grow italic mb-4">{item.tagline}</p>
                  )}
                  <p className="text-on-surface-variant text-sm">{item.description}</p>
                  {'badge' in item && item.badge && (
                    <div className="flex gap-2 mt-4">
                      <span className="material-symbols-outlined text-tertiary text-[16px]">local_fire_department</span>
                      <span className="font-label-caps text-[10px]">{item.badge}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div id="desserts" className="scroll-mt-24" />
        <section className="mb-section-gap scroll-mt-24" id="bebidas">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {drinks_desserts.map((item) => {
              if (item.featured) {
                return (
                  <div key={item.name} className="md:col-span-2 group relative rounded-2xl overflow-hidden h-[300px]">
                <Image
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  src={item.image || FALLBACK_ITEM_IMG}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 p-stack-md flex flex-col justify-center">
                      <span className="font-label-caps text-[10px] text-secondary tracking-widest mb-2">{item.type}</span>
                      <h3 className="font-headline-md mb-1">{item.name}</h3>
                      <p className="text-on-surface-variant max-w-[240px] text-sm">{item.description}</p>
                      <div className="mt-4">
                        <span className="text-secondary text-2xl font-bold">{item.price}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <div key={item.name} className="lg:col-span-1 glass-card p-stack-md rounded-xl border border-outline-variant/10">
                  <div className="inline-block px-2 py-0.5 bg-secondary-container/30 text-secondary rounded-sm mb-4 font-label-caps text-[10px]">{item.type}</div>
                  <h3 className="font-headline-sm mb-2">{item.name}</h3>
                  <p className="text-on-surface-variant text-sm mb-4">{item.description}</p>
                  <span className="text-secondary font-bold">{item.price}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
