import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.local-data');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function filePath(key: string): string {
  return path.join(DATA_DIR, `${key}.json`);
}

export function readStore<T>(key: string, fallback: T): T {
  try {
    ensureDir();
    const fp = filePath(key);
    if (!fs.existsSync(fp)) return fallback;
    const raw = fs.readFileSync(fp, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStore<T>(key: string, data: T): void {
  try {
    ensureDir();
    fs.writeFileSync(filePath(key), JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error(`Failed to write local store [${key}]:`, e);
  }
}
