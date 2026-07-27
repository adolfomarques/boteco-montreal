'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '../../lib/i18n/LanguageProvider';
import { RESTAURANT } from '../../lib/data/restaurant';

interface SocialGalleryProps {
  widgetId?: string;
}

type GalleryItem = {
  type: 'image';
  src: string;
} | {
  type: 'video';
  src: string;
};

const FALLBACK_ITEMS: GalleryItem[] = [
  { type: 'video', src: '/carrosel/carrosel_video.mp4' },
  { type: 'image', src: '/carrosel/slide1.jpg' },
  { type: 'image', src: '/carrosel/slide2.jpg' },
  { type: 'image', src: '/carrosel/slide4.jpg' },
  { type: 'image', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBP9e_o11oV5rsA-V4Gug3KePD1JPJYA01v5X6TUYzP6gxRvw62Mq031hzGc1EpB-pjzHQRqCoOlcjySo4XrJ1s7Ugg_8yvQ4hvrvVQBzyx7GH0yM0lunZibMt-HMBeKytgJD9hsT3d5pWsp8JAtKze82Qnxxjv35JG1FxSARAyxB-e3OY0R2zpWDJyjpPRcI-7TcSDDbIo_Onf-GXEIpl3yPy1DLB8NN8CCmWsfhAwmjpMIXc7P9J4iI21B4z4ryCyVqq70k_9klY' },
  { type: 'image', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2CNsfIWQcJ0P-xJY-xe8hdonAXHTVmy6xBrbBCWIUjSIKbbFtWvqPLLud0T57W0cRafEsn3727lVcNhUgNC8NJ9UJ4PBthCFPOYRaLcLM3BCO8wUQACNvv36XdYtlkE9e-1Wa9O5NuKTe5pfvSAC0gpm7XLzyjUgiUIvnpiq0swWhoeNP3d1gLQzcqysQxzybLlJlpiOsC9QMYbT6IhdJTUa1iBNIsefVSzueMcIkiUVKQ5nrPAj8eDY1gfFWUf1voEZ-yUdSpxc' },
  { type: 'image', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDaQ78isaR3WCZ4SU4miW1z4oWprZNeDvTDa9ctnPEgUNBxhBbEwRWjxZt6NhZ3tflRkqaFifiBQmIJTfVt7RNQEX2t4ScB2k28JB-AZ81YX_Y-1gwRmeo3rk43ZeNQrSi_GHbkr6Y-x9p1ASYNBZ7Hu9yvK4LnOslWhRwkzmm2QE1bA2sgNO-cNBu3pJDWBJKmPnsy4yGG2FeE-rJeXkxC74Ea-PuJy-BoW2cE2U4n-sACAdVgikoXWwj-dNpnCqpZoM1tCdJIxY8' },
  { type: 'image', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgTrR_eUWE539H4JR3NKmCSmYc9M7HJ4zFzoGOmqU6AeY5lRHLSu056TEr25yPY4yVxBowp6EhPYSx6yj26OXZNIMMvex6DLNpDDh9wpIXh7wxivECIXZ_YVrR1XzrWlFg30qqwJBNLZBFUoLVl2_U5JdfH4jAZnlNINDmendvSiuawphzI_SI3hEfa8-T19kRpy-51PE0UFArqrRH36uNB_Mv6O1ZVnm5D6x1g9yK7am1bWMcxZyzXOHyZg7fP1Re0KmeZjsSeBs' },
  { type: 'image', src: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0LWBmAzLZdbEohlVvD8-jVqlEIL70jQjkOjov0FhZeEBAfl2DlfzL5okQ7_qZMOVxM7cj3gFgGczWvJo5QX-elqnNGRuM7fjiGpXbibbyZYslkSYWvdzHou7hquhcpRcucYLR0X4rjjHM7tVgXwFnvJ3KrhDipK5FGSDkSnS_IZr2-zHkx6kZ4dszO4iQsspVqc7hHauii6EK6H4VeUYnZHMhRZhI6VEufrBAa-Bg09EQIHoF0uZ3FDJ2UC5rkZUP2SWqLZhkloI' },
];

const DESKTOP = { CARD_W: 504, CARD_H: 576, PEEK: 72 };
const MOBILE = { CARD_W: 312, CARD_H: 360, PEEK: 48 };
const GAP = 5;

export default function SocialGallery({ widgetId }: SocialGalleryProps) {
  const [dims, setDims] = useState(DESKTOP);
  const { t } = useLanguage();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(FALLBACK_ITEMS);
  const [active, setActive] = useState(0);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const dragStartX = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = galleryItems.length;

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const id = setTimeout(() => setDims(mq.matches ? MOBILE : DESKTOP), 0);
    const handler = (e: MediaQueryListEvent) => setDims(e.matches ? MOBILE : DESKTOP);
    mq.addEventListener('change', handler);
    return () => { clearTimeout(id); mq.removeEventListener('change', handler); };
  }, []);

  useEffect(() => {
    fetch('/api/local/gallery')
      .then((r) => r.ok ? r.json() : [])
      .then((data: { type: string; src: string; active: boolean }[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const activeItems = data.filter((i) => i.active !== false);
          if (activeItems.length > 0) {
            setGalleryItems(activeItems.map((i) => ({ type: i.type as 'image' | 'video', src: i.src })));
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!widgetId) return;
    if (document.querySelector('script[src*="lightwidget"]')) {
      const id = setTimeout(() => setScriptLoaded(true), 0);
      return () => clearTimeout(id);
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.lightwidget.com/widgets/lightwidget.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, [widgetId]);

  const goTo = useCallback((i: number) => {
    setActive(((i % total) + total) % total);
  }, [total]);

  useEffect(() => {
    const currentItem = galleryItems[active];
    if (currentItem.type === 'video') return;

    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, 5000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active, total, galleryItems]);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const diff = e.clientX - dragStartX.current;
    if (Math.abs(diff) > 40) {
      goTo(active + (diff < 0 ? 1 : -1));
    }
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, 5000);
  };

  return (
    <section
      className="overflow-hidden bg-background select-none pb-10 md:pb-section-gap"
      role="region"
      aria-label={t('gallery.regionLabel')}
      tabIndex={widgetId ? -1 : 0}
      onKeyDown={(e) => {
        if (widgetId) return;
        if (e.key === 'ArrowLeft') goTo(active - 1);
        if (e.key === 'ArrowRight') goTo(active + 1);
      }}
      onPointerDown={widgetId ? undefined : handlePointerDown}
      onPointerUp={widgetId ? undefined : handlePointerUp}
    >
      <div className="container-max mb-8 md:mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="font-headline-md">{t('gallery.sectionTitle')}</h2>
        </div>
        <a
          href={RESTAURANT.social.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-on-surface-variant font-headline-sm text-[20px] hover:text-secondary transition-colors"
        >
          {RESTAURANT.social.instagramHandle}
        </a>
      </div>

      {widgetId ? (
        <div className="container-max">
          <div className="rounded-2xl overflow-hidden shadow-xl bg-surface-container-high">
            {scriptLoaded && (
              <iframe
                src={`https://cdn.lightwidget.com/widgets/${widgetId}.html`}
                scrolling="no"
                className="lightwidget-widget"
                style={{ width: '100%', border: 0, overflow: 'hidden' }}
                title="Instagram Feed"
              />
            )}
            {!scriptLoaded && (
              <div className="flex items-center justify-center py-20 text-on-surface-variant">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mr-3" />
                {t('gallery.loading')}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative w-full" style={{ height: dims.CARD_H }}>
          {galleryItems.map((item, i) => {
            const diff = ((i - active + total) % total + total) % total;

            let x: number;
            let clip: string;

            if (diff === 0) {
              x = 0;
              clip = 'inset(0px)';
            } else {
              const side = diff <= total / 2 ? 1 : -1;
              const dist = side === 1 ? diff : total - diff;

              if (side === 1) {
                x = dims.CARD_W + GAP + (dist - 1) * (dims.PEEK + GAP);
                clip = `inset(0px ${dims.CARD_W - dims.PEEK}px 0px 0px)`;
              } else {
                x = -(dims.CARD_W + GAP + (dist - 1) * (dims.PEEK + GAP));
                clip = `inset(0px 0px 0px ${dims.CARD_W - dims.PEEK}px)`;
              }
            }

            return (
              <div
                key={i}
                onClick={() => goTo(i)}
                className="absolute top-0 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-out"
                style={{
                  left: '50%',
                  width: dims.CARD_W,
                  height: dims.CARD_H,
                  transform: `translate(calc(-50% + ${x}px), 0px)`,
                  clipPath: clip,
                  zIndex: diff === 0 ? 50 : 10,
                }}
              >
                {item.type === 'video' ? (
                  <>
                    <video
                      src={item.src}
                      autoPlay={diff === 0}
                      muted
                      loop={diff !== 0}
                      playsInline
                      onEnded={() => setActive((prev) => (prev === i ? (prev + 1) % total : prev))}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {diff !== 0 && (
                      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white"><polygon points="8 5 19 12 8 19 8 5"/></svg>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Image
                      src={item.src}
                      alt={`${t('gallery.imageAlt')} ${i + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="360px"
                    />
                    <div className="absolute inset-0 bg-black/20 z-10" />
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!widgetId && (
        <div className="flex items-center justify-center gap-6 mt-8">
          <button
            onClick={() => goTo(active - 1)}
            className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors active:scale-95"
            aria-label={t('gallery.prevLabel')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          <div className="flex gap-2">
            {galleryItems.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === active ? 'bg-secondary w-6' : 'bg-outline-variant hover:bg-outline'
                }`}
                aria-label={`${t('gallery.dotLabel')} ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => goTo(active + 1)}
            className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors active:scale-95"
            aria-label={t('gallery.nextLabel')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      )}
    </section>
  );
}
