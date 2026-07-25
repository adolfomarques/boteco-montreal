function baseUrl(): string {
  if (typeof window !== 'undefined') return '';
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}

export async function fetchLocalJSON<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${baseUrl()}${path}`, {
      next: { revalidate: 0 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
