'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../../lib/i18n/LanguageProvider';

const VIDEOS = ['/hero-bg.mp4', '/vide2_bg.mp4', '/vide4_bg.mp4'];

const HERO_IMAGES = {
  avatar1: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBP9e_o11oV5rsA-V4Gug3KePD1JPJYA01v5X6TUYzP6gxRvw62Mq031hzGc1EpB-pjzHQRqCoOlcjySo4XrJ1s7Ugg_8yvQ4hvrvVQBzyx7GH0yM0lunZibMt-HMBeKytgJD9hsT3d5pWsp8JAtKze82Qnxxjv35JG1FxSARAyxB-e3OY0R2zpWDJyjpPRcI-7TcSDDbIo_Onf-GXEIpl3yPy1DLB8NN8CCmWsfhAwmjpMIXc7P9J4iI21B4z4ryCyVqq70k_9klY',
  avatar2: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAysiWmMx2796it7Vt5l3Qpr4s5dKwU61OE0Na2OfRXrmywEeomGYP-2qrcNdFMCS5HuwOTXxfPuPqgNUpokpcnYy7B9D2BQkLp_tgmsvnjEhnITDFg6_ul3iVC2T8bpydeWAsqE0sjc73n5ujL6BRT8igiBcomP0Qjq_ULposwgeWTlLs9bqRfYypfNhFFVgFA3wSx1ErvDNmJGC-hNpaTnyVAkMXyvHFwBU1CwZ9wVy6eB9Baj82XJJHMei8CITwFUEABYh__LA4',
  avatar3: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA2CNsfIWQcJ0P-xJY-xe8hdonAXHTVmy6xBrbBCWIUjSIKbbFtWvqPLLud0T57W0cRafEsn3727lVcNhUgNC8NJ9UJ4PBthCFPOYRaLcLM3BCO8wUQACNvv36XdYtlkE9e-1Wa9O5NuKTe5pfvSAC0gpm7XLzyjUgiUIvnpiq0swWhoeNP3d1gLQzcqysQxzybLlJlpiOsC9QMYbT6IhdJTUa1iBNIsefVSzueMcIkiUVKQ5nrPAj8eDY1gfFWUf1voEZ-yUdSpxc',
};

export default function HeroSection() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const startId = setTimeout(() => {
      setCurrentIndex(Math.floor(Math.random() * VIDEOS.length));
    }, 0);
    return () => {
      clearTimeout(startId);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleEnded = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % VIDEOS.length);
    }, 5000);
  }, []);

  return (
    <section className="relative h-auto md:h-[70vh] min-h-[480px] md:max-h-[640px] flex flex-col justify-center overflow-hidden">
      <div className="absolute inset-0 z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-background/88 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/88 to-transparent" />
        <video
          key={currentIndex}
          autoPlay
          muted
          playsInline
          onEnded={handleEnded}
          className="w-full h-full object-cover"
        >
          <source src={VIDEOS[currentIndex]} type="video/mp4" />
        </video>
      </div>

      <div className="relative z-20 container-max w-full mt-4 md:mt-0">
        <div className="flex flex-col lg:flex-row items-center lg:items-start flex-wrap gap-stack-md md:gap-gutter">
          <div className="max-w-3xl flex-1">
            <span className="inline-block bg-secondary/20 text-secondary border border-secondary/30 px-3 py-1 rounded-full font-label-caps mb-stack-md backdrop-blur-sm">
              {t('hero.badge')}
            </span>
            <h1 className="font-display-mobile md:font-display-lg text-on-surface mb-stack-lg leading-[1.05]">
              {t('hero.titlePre')}
              <span className="text-secondary" style={{
                background: 'linear-gradient(to right, #16a34a 49%, transparent 49%, transparent 51%, #eab308 51%)',
                backgroundPosition: '0 calc(100% - 2px)',
                backgroundSize: '100% 4px',
                backgroundRepeat: 'no-repeat',
              }}>
                {t('hero.titleBrazil')}
              </span>
              {t('hero.titlePost')} <br />
              <span className="text-secondary italic">{t('hero.titleHighlight')}</span>
            </h1>
            <p className="font-body-lg text-on-surface-variant max-w-xl">
              {t('hero.subtitle')}
            </p>
          </div>
          <div className="flex-shrink-0 lg:mt-0 relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 lg:w-[400px] lg:h-[400px] rounded-full bg-gradient-to-b from-secondary/30 via-tertiary/20 to-primary/10 blur-3xl" />
              <div className="absolute w-44 h-44 lg:w-[300px] lg:h-[300px] rounded-full bg-gradient-to-tr from-cyan-400/20 via-purple-500/20 to-transparent blur-2xl translate-y-4" />
              <div className="absolute w-32 h-32 lg:w-[200px] lg:h-[200px] rounded-full bg-gradient-to-bl from-secondary/30 via-transparent to-tertiary/25 blur-xl -translate-y-2" />
            </div>
            <div className="w-48 h-48 lg:w-96 lg:h-96 rounded-full overflow-hidden border-4 border-secondary/20 shadow-2xl shadow-secondary/10 relative z-10 flex items-center justify-center bg-gradient-to-br from-secondary/5 to-tertiary/5">
              <img
                src="/boteco-logo2-clean.webp"
                alt="Boteco Montreal"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-stack-md lg:basis-full">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 bg-secondary text-on-secondary px-8 py-4 rounded-xl font-headline-sm text-[18px] font-bold hover:brightness-110 transition-all duration-200 active:scale-95 shadow-lg shadow-secondary/20"
            >
              {t('hero.ctaMenu')}
              <span className="material-symbols-outlined">restaurant_menu</span>
            </Link>
            <Link
              href="/eventos"
              className="inline-flex items-center justify-center gap-2 border border-outline text-on-surface px-8 py-4 rounded-xl font-headline-sm text-[18px] font-bold hover:bg-white/5 transition-all duration-200 active:scale-95"
            >
              {t('hero.ctaEvents')}
              <span className="material-symbols-outlined">event</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 right-gutter hidden lg:flex items-center gap-stack-md glass-card p-stack-md rounded-xl">
        <div className="flex -space-x-3">
          {[HERO_IMAGES.avatar1, HERO_IMAGES.avatar2, HERO_IMAGES.avatar3].map((src, i) => (
            <div key={i} className="w-10 h-10 rounded-full border-2 border-surface overflow-hidden">
              <Image src={src} alt={t('hero.altAvatar')} width={40} height={40} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div>
          <p className="font-label-caps text-[10px] text-secondary">{t('hero.hashtag')}</p>
          <p className="font-body-md font-bold text-on-surface">{t('hero.socialProof')}</p>
        </div>
      </div>
    </section>
  );
}
