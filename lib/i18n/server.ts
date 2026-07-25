import { cookies } from 'next/headers';
import type { Locale } from './translations';
import { translations } from './translations';

function resolveNested(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }
  return typeof current === 'string' ? current : path;
}

export function getTranslator(locale: Locale) {
  return (path: string): string => {
    const dict = translations[locale] as unknown as Record<string, unknown>;
    return resolveNested(dict, path);
  };
}

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const stored = cookieStore.get('boteco-locale')?.value as Locale | undefined;
  if (stored && stored in translations) return stored;
  return 'fr';
}
