import type { Metadata } from "next";
import { Anybody, Hanken_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

const anybody = Anybody({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-anybody",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanken",
});

const META: Record<string, { title: string; description: string; skip: string }> = {
  fr: {
    title: "Boteco Montreal | Sabores do Brasil",
    description: "Trazendo a alma dos botecos do Rio e São Paulo para o coração de Montreal. Culinária autêntica, ritmos brasileiros e hospitalidade que aquece o inverno de Quebec.",
    skip: "Aller au contenu principal",
  },
  pt: {
    title: "Boteco Montreal | Sabores do Brasil",
    description: "Trazendo a alma dos botecos do Rio e São Paulo para o coração de Montreal. Culinária autêntica, ritmos brasileiros e hospitalidade que aquece o inverno de Quebec.",
    skip: "Ir para o conteúdo principal",
  },
  en: {
    title: "Boteco Montreal | Sabores do Brasil",
    description: "Bringing the soul of Brazil's botecos from Rio and São Paulo to the heart of Montreal. Authentic cuisine, Brazilian rhythms, and hospitality that warms Quebec's winter.",
    skip: "Skip to main content",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('boteco-locale')?.value ?? 'fr') as keyof typeof META;
  const meta = META[locale] || META.fr;
  return {
    title: meta.title,
    description: meta.description,
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('boteco-locale')?.value ?? 'fr';
  const meta = META[locale as keyof typeof META] || META.fr;

  return (
    <html lang={locale} className={`dark ${anybody.variable} ${hanken.variable}`} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" />
      </head>
      <body className="bg-background text-on-surface antialiased overflow-x-hidden min-h-screen flex flex-col" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-secondary focus:text-on-secondary focus:rounded-lg focus:font-label-caps focus:outline-none"
        >
          {meta.skip}
        </a>
        <div id="main-content" className="flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
