import { appStorage } from '@/storage';

import { createAppStore } from './create-app-store';

export type { AppState } from './create-app-store';

export const useAppStore = createAppStore(appStorage);
