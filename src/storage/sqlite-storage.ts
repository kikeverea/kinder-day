import { SQLiteStorage } from 'expo-sqlite/kv-store';

import type { KeyValueStorage } from './types';

const db = new SQLiteStorage('kinder-day.db');

/** On-device key-value storage backed by SQLite. Uses the sync API so state is available on first render. */
export const sqliteStorage: KeyValueStorage = {
  getItem: (key) => db.getItemSync(key),
  setItem: (key, value) => db.setItemSync(key, value),
  removeItem: (key) => {
    db.removeItemSync(key);
  },
};
