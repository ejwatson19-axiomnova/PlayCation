import { API_URL } from '@/src/config';
import type { Stay } from '@/src/data/mock';

import { backendProvider } from './providers/backend';
import { mockProvider } from './providers/mock';
import type { LodgingProvider, StaySearch } from './types';

export type { StaySearch } from './types';
export { LodgingError } from './types';
export { PROVIDERS } from './registry';

/** Sample data until EXPO_PUBLIC_API_URL points at the backend. */
export const usingSampleData = !API_URL;

const provider: LodgingProvider = usingSampleData ? mockProvider : backendProvider;

// Listings seen this session, so a listing screen can open without refetching.
const cache = new Map<string, Stay>();

/** Search stays near an event, closest first, with duplicates across partners removed. */
export async function searchStays(search: StaySearch): Promise<Stay[]> {
  const stays = (await provider.searchStays(search)).sort((a, b) => a.driveMin - b.driveMin);
  const seen = new Set<string>();
  const unique = stays.filter((s) => {
    // The same property can arrive from two partners; keep the first (closest) one.
    const key = `${s.name.toLowerCase()}|${s.miles}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  unique.forEach((s) => cache.set(s.id, s));
  return unique;
}

export function getCachedStay(id: string): Stay | undefined {
  return cache.get(id);
}
