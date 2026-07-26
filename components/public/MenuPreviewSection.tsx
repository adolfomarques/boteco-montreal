'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../lib/i18n/LanguageProvider';

interface Dish {
  name: string;
  price: string;
  description: string;
  image: string;
}

const FALLBACK_DISHES: Dish[] = [
  {
    name: 'Pão de Queijo',
    price: '$9',
    description: 'Pão de queijo tradicional de Minas Gerais. Sem glúten, feito com polvilho e queijo curado.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAysiWmMx2796it7Vt5l3Qpr4s5dKwU61OE0Na2OfRXrmywEeomGYP-2qrcNdFMCS5HuwOTXxfPuPqgNUpokpcnYy7B9D2BQkLp_tgmsvnjEhnITDFg6_ul3iVC2T8bpydeWAsqE0sjc73n5ujL6BRT8igiBcomP0Qjq_ULposwgeWTlLs9bqRfYypfNhFFVgFA3wSx1ErvDNmJGC-hNpaTnyVAkMXyvHFwBU1CwZ9wVy6eB9Baj82XJJHMei8CITwFUEABYh__LA4',
  },
  {
    name: 'Calabresa',
    price: '$16',
    description: 'Linguiça artesanal grelhada na chapa, servida com vinagrete, farofa e pão.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiDcyNE3_bJtrylbnYw1aSnWvFN0Lu8cXdnKBMds0spYSZqjoyxD1HWvfs0-rjXdelpNkfVr6lKtDfUGaCprpSqU-HHCaLa6oM994V6Vl1f-zoVt6KchbMiLC_BA-Hnm-6bpDKlkwN-1GLDXFRHTgfTsUyybXIsXmV6Hl3Fru5n8lSCGc228wiO-RNqpf87kYmkQUJWx6Z2NFQNL5oGuO_Tou3mxLtBoQLeyc4Rdq4lXG0f3DlBjXrlP66M1GO9Kam12E6vwaXoSM',
  },
  {
    name: 'Coxinha',
    price: '$8',
    description: 'Croquete de frango desfiado à brasileira. Um clássico crocante por fora e cremoso por dentro.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATAEUtM_8kIbvQxwKZ0_KWWmjdi8TVXMVqmOnyNzDoxPWKYTOaeE0B_iB6Vcc0Tf9A7uas6OEo8eYTajJmeAJCdEqBDGJx3SWQPTm88QxjnygipKtMuplAs4z8cnNA0wswxphv0S8fPGs1_z4v9IsnjpNySRakPjNl72M_ZhqudaaEUqqAEkrv2f_gW0B441imIC0xtC-c5fB3N23WlaIazNUI7ZGoWlDVAKBWtdFacVB1rHcRR_aVZBdyuFdOhfq8kFm1LFfL3Us',
  },
];

function getPrice(price: number | undefined): string {
  if (price === undefined) return '';
  return `$${price}`;
}

export default function MenuPreviewSection() {
  const { t } = useLanguage();
  const [dishes, setDishes] = useState<Dish[]>(FALLBACK_DISHES);

  useEffect(() => {
    async function load() {
      try {
        const landRes = await fetch('/api/local/landing');
        if (landRes.ok) {
          const landData = await landRes.json();
          if (landData?.items?.length > 0) {
            const mapped = landData.items.map((item: any) => ({
              name: item.name_fr || item.name_en || item.name_pt || '',
              price: item.price ? `$${item.price}` : '',
              description: item.description_fr || item.description_en || item.description_pt || '',
              image: item.image_url || FALLBACK_DISHES[0].image,
            }));
            setDishes(mapped);
            return;
          }
        }
      } catch {}
      try {
        const res = await fetch('/api/local/menu');
        if (!res.ok) return;
        const data = await res.json();
        if (data?.entrees?.featured?.length > 0) {
          const featured = data.entrees.featured.slice(0, 3);
          const mapped = featured.map((item: any) => ({
            name: item.name_fr || item.name_en || item.name_pt || '',
            price: getPrice(item.price),
            description: item.description_fr || item.description_en || item.description_pt || '',
            image: item.image_url || item.image || FALLBACK_DISHES[0].image,
          }));
          if (mapped.length > 0) setDishes(mapped);
        }
      } catch {}
    }
    load();
  }, []);

  return (
    <section className="py-section-gap bg-surface-container-lowest border-y border-outline-variant/10" id="menu">
      <div className="container-max">
        <div className="text-center mb-16">
          <h2 className="font-display-mobile md:font-headline-md">{t('menuPreview.sectionTitle')}</h2>
          <p className="text-on-surface-variant font-body-lg mt-4 max-w-xl mx-auto">{t('menuPreview.sectionLabel')}</p>
          <div className="w-16 h-1 bg-secondary mx-auto mt-6 rounded-full opacity-50" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {dishes.map((dish) => (
            <div
              key={dish.name}
              className="glass-card rounded-2xl overflow-hidden group border border-outline-variant/10 hover:border-secondary/40 transition-all duration-500"
            >
              <div className="h-72 overflow-hidden relative">
                <Image
                  src={dish.image}
                  alt={dish.name}
                  loading="lazy"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-headline-sm text-on-surface">{dish.name}</h3>
                  <span className="text-secondary font-bold">{dish.price}</span>
                </div>
                <p className="text-on-surface-variant text-body-md mb-6">{dish.description}</p>
                <Link href="/menu" className="block w-full py-3 border border-outline-variant font-label-caps font-bold rounded-xl text-center hover:bg-secondary hover:text-on-secondary hover:border-secondary transition-all">
                  {t('menuPreview.details')}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-transparent border-2 border-secondary text-secondary px-10 py-4 rounded-xl font-anybody font-bold text-[18px] hover:bg-secondary hover:text-on-secondary transition-all active:scale-95"
          >
            {t('menuPreview.explore')}
          </Link>
        </div>
      </div>
    </section>
  );
}
