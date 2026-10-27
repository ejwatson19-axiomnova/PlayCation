import { API_TIMEOUT_MS, API_URL } from '@/src/config';
import type { PlaceType, Stay } from '@/src/data/mock';

import { LodgingError, type LodgingProvider } from '../types';

/**
 * Talks to Playcation's backend, which fans out to every enabled partner
 * (Expedia Rapid, Rentals United, Guesty...) and returns one normalized list.
 *
 * Expected backend contract:
 *   POST {API_URL}/v1/lodging/search   body: StaySearch
 *   200 { stays: BackendStay[], partial?: string[] }   // partial = providers that failed
 */
type BackendStay = {
  id: string;
  source: string;
  type: PlaceType;
  name: string;
  summary?: string;
  sleeps?: number;
  driveMinutes: number;
  distanceMiles?: number;
  nightlyPrice?: { amount: number; currency: string };
  perks?: string[];
  location?: { lat: number; lng: number };
};

function toStay(b: BackendStay): Stay {
  return {
    id: `${b.source}:${b.id}`,
    source: b.source,
    type: b.type,
    name: b.name,
    summary: b.summary ?? '',
    sleeps: b.sleeps ?? 0,
    driveMin: Math.round(b.driveMinutes),
    miles: Math.round((b.distanceMiles ?? 0) * 10) / 10,
    pricePerNight: b.nightlyPrice
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: b.nightlyPrice.currency, maximumFractionDigits: 0 }).format(b.nightlyPrice.amount)
      : 'See price',
    perks: b.perks ?? [],
    location: b.location,
  };
}

export const backendProvider: LodgingProvider = {
  id: 'backend',
  kind: 'hotel-network',
  async searchStays(search) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    try {
      const res = await fetch(`${API_URL}/v1/lodging/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(search),
        signal: controller.signal,
      });
      if (!res.ok) throw new LodgingError(`Lodging search failed (${res.status})`, res.status >= 500);
      const data = (await res.json()) as { stays?: BackendStay[] };
      return (data.stays ?? []).map(toStay);
    } catch (e) {
      if (e instanceof LodgingError) throw e;
      throw new LodgingError("Couldn't reach Playcation. Check your connection and try again.");
    } finally {
      clearTimeout(timer);
    }
  },
};
