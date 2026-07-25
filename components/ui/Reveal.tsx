'use client';

import { useRef, useEffect, useState } from 'react';

type AnimationVariant = 'fade-up' | 'fade-in' | 'scale-in' | 'slide-left' | 'slide-right';

interface RevealProps {
  children: React.ReactNode;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

const variants: Record<AnimationVariant, string> = {
  'fade-up': 'translate-y-12 opacity-0',
  'fade-in': 'opacity-0',
  'scale-in': 'scale-95 opacity-0',
  'slide-left': '-translate-x-24 opacity-0',
  'slide-right': 'translate-x-24 opacity-0',
};

const variantsVisible: Record<AnimationVariant, string> = {
  'fade-up': 'translate-y-0 opacity-100',
  'fade-in': 'opacity-100',
  'scale-in': 'scale-100 opacity-100',
  'slide-left': 'translate-x-0 opacity-100',
  'slide-right': 'translate-x-0 opacity-100',
};

export default function Reveal({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 700,
  className = '',
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.unobserve(el);
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${className} ${visible ? variantsVisible[variant] : variants[variant]}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
