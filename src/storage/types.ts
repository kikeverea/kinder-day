/**
 * The only persistence contract the rest of the app depends on.
 *
 * Implementations may be synchronous (SQLite kv-store) or asynchronous (a remote
 * backend, AsyncStorage…). Sync implementations let the store hydrate before the
 * first render; async ones hydrate a tick later — check `useAppStore.persist.hasHydrated()`.
 */
export interface KeyValueStorage {
  getItem(key: string): string | null | Promise<string | null>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}
