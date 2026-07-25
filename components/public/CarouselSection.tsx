'use client';

import React, { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useLanguage } from '../../lib/i18n/LanguageProvider';

interface Slide {
  image: string;
  number: string;
  title: string;
  subtitle: string;
}

const CARD_W = 400;
const CARD_H = 520;
const PEEK = 60;
const GAP = 5;
const STEP = PEEK + GAP; // 65

export default function CarouselSection({ slides }: { slides: Slide[] }) {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);
  const dragStartX = useRef(0);
  const total = slides.length;

  const goTo = useCallback((i: number) => {
    setActive(((i % total) + total) % total);
  }, [total]);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const diff = e.clientX - dragStartX.current;
    if (Math.abs(diff) > 40) {
      goTo(active + (diff < 0 ? 1 : -1));
    }
  };

  return (
    <section
      className="py-section-gap overflow-hidden select-none"
      role="region"
      aria-label={t('carousel.regionLabel')}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') goTo(active - 1);
        if (e.key === 'ArrowRight') goTo(active + 1);
      }}
    >
      <div
        className="relative mx-auto"
        style={{ height: CARD_H, maxWidth: 900 }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        {slides.map((slide, i) => {
          const diff = ((i - active + total) % total + total) % total;

          let x: number;
          let clip: string;
          let textVisible: boolean;

          if (diff === 0) {
            x = 0;
            clip = 'inset(0px)';
            textVisible = true;
          } else {
            const side = diff <= total / 2 ? 1 : -1;
            const dist = side === 1 ? diff : total - diff;

            if (side === 1) {
              x = CARD_W + GAP + (dist - 1) * STEP;
              clip = `inset(0px ${CARD_W - PEEK}px 0px 0px)`;
            } else {
              x = -(CARD_W + GAP + (dist - 1) * STEP);
              clip = `inset(0px 0px 0px ${CARD_W - PEEK}px)`;
            }
            textVisible = false;
          }

          return (
            <div
              key={i}
              onClick={() => goTo(i)}
              className="absolute top-0 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-out"
              style={{
                left: '50%',
                width: CARD_W,
                height: CARD_H,
                transform: `translate(calc(-50% + ${x}px), 0px)`,
                clipPath: clip,
                zIndex: diff === 0 ? 50 : 10,
              }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-cover"
                  sizes="400px"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />

                <div
                  className="absolute bottom-0 left-0 right-0 p-8 z-20 transition-opacity duration-500"
                  style={{ opacity: textVisible ? 1 : 0 }}
                >
                  <p className="font-label-caps text-sm text-white/60 mb-2 tracking-wider">
                    / {slide.number}
                  </p>
                  <h3 className="font-headline-md text-white uppercase mb-1">
                    {slide.title}
                  </h3>
                  <p className="font-body-md text-white/70 italic max-w-xs">
                    {slide.subtitle}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-6 mt-8">
        <button
          onClick={() => goTo(active - 1)}
          className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors active:scale-95"
          aria-label={t('carousel.prevLabel')}
        >
          <span className="material-symbols-outlined">chevron_left</span>
        </button>

        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === active ? 'bg-secondary w-6' : 'bg-outline-variant hover:bg-outline'
              }`}
              aria-label={`${t('carousel.dotLabel')} ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => goTo(active + 1)}
          className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface hover:bg-surface-variant transition-colors active:scale-95"
          aria-label={t('carousel.nextLabel')}
        >
          <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </section>
  );
}
