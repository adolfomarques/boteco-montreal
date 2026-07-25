import React from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import { LanguageProvider } from '@/lib/i18n/LanguageProvider';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <Navbar />
      <main className="flex-grow pt-16 md:pt-[112px] flex flex-col">
        {children}
      </main>
      <Footer />
    </LanguageProvider>
  );
}
