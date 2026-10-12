/**
 * Storage entry point — swap the implementation here and nowhere else.
 * Nothing outside `src/storage/` may import `expo-sqlite` (or any other backend) directly.
 */
import { sqliteStorage } from './sqlite-storage';
import type { KeyValueStorage } from './types';

export type { KeyValueStorage } from './types';
export { createMemoryStorage } from './memory-storage';

export const appStorage: KeyValueStorage = sqliteStorage;
