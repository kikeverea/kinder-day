import type { KeyValueStorage } from './types';

/** Volatile storage for tests and previews. */
export function createMemoryStorage(initial: Record<string, string> = {}): KeyValueStorage & {
  dump(): Record<string, string>;
} {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
    dump: () => Object.fromEntries(data),
  };
}
