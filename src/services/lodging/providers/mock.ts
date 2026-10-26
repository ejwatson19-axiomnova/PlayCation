import { STAYS } from '@/src/data/mock';

import type { LodgingProvider } from '../types';

// Sample listings used until the backend is connected.
export const mockProvider: LodgingProvider = {
  id: 'mock',
  kind: 'mock',
  async searchStays(search) {
    return STAYS.filter((s) => !search.types?.length || search.types.includes(s.type))
      .filter((s) => !search.maxDriveMinutes || s.driveMin <= search.maxDriveMinutes)
      .map((s) => ({ ...s, source: 'mock' }));
  },
};
