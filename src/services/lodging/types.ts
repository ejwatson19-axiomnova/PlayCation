import type { PlaceType, Stay } from '@/src/data/mock';

/** What the app asks for: stays near one event's venue for one set of dates. */
export type StaySearch = {
  eventId: string;
  venueName: string;
  city: string;
  /** Venue coordinates, once sports-organization feeds supply them. */
  venue?: { lat: number; lng: number };
  checkIn?: string; // YYYY-MM-DD
  checkOut?: string; // YYYY-MM-DD
  guests?: { adults: number; children: number };
  types?: PlaceType[];
  maxDriveMinutes?: number;
};

export type ProviderKind =
  | 'hotel-network' // one connection, many hotels (e.g. Expedia Rapid)
  | 'rental-distributor' // one connection, many property managers (e.g. Rentals United)
  | 'pms' // a property-management system used directly by managers (e.g. Guesty)
  | 'direct' // hosts who list through Playcation's own "List your place" form
  | 'mock';

/**
 * Every lodging source implements this. Real adapters run on Playcation's
 * backend, never in the app, because partner API keys must stay secret.
 */
export interface LodgingProvider {
  id: string;
  kind: ProviderKind;
  searchStays(search: StaySearch): Promise<Stay[]>;
}

export class LodgingError extends Error {
  constructor(
    message: string,
    public readonly retryable = true,
  ) {
    super(message);
    this.name = 'LodgingError';
  }
}
