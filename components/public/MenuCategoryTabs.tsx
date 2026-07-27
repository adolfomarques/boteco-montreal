'use client';

import React, { useState, useEffect } from 'react';

interface Category {
  id: string;
  label: string;
  default?: boolean;
}

export default function MenuCategoryTabs({ categories }: { categories: Category[] }) {
  const [hash, setHash] = useState('');

  useEffect(() => {
    const update = () => setHash(window.location.hash);
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  const handleClick = (id: string) => {
    setTimeout(() => setHash(window.location.hash), 50);
  };

  return (
    <section className="sticky top-16 md:top-20 z-40 bg-surface-dim/80 backdrop-blur-md border-b border-outline-variant/10">
      <div className="container-max overflow-x-auto">
        <div className="flex items-center h-16 gap-gutter whitespace-nowrap">
          {categories.map((cat) => {
            const isActive = hash === `#${cat.id}` || (!hash && !!cat.default);
            return (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                onClick={() => handleClick(cat.id)}
                className={`font-label-caps transition-colors py-3 ${
                  isActive
                    ? 'text-secondary font-bold border-b-2 border-secondary'
                    : 'text-on-surface-variant hover:text-secondary font-medium'
                }`}
              >
                {cat.label}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
