import type { ProviderKind } from './types';

/**
 * The lodging partners Playcation plans to connect, and what each needs.
 * This list drives the backend adapters and docs/INTEGRATIONS.md. Nothing
 * here is live yet: each partner requires an application and approval first.
 * Partner names come from public partner lists; confirm terms with each partner.
 */
export type ProviderInfo = {
  id: string;
  name: string;
  kind: ProviderKind;
  covers: string;
  /** Environment variable names the backend adapter will read. Never put values in the app. */
  credentials: string[];
  docs?: string;
  status: 'planned' | 'applied' | 'approved' | 'live';
};

export const PROVIDERS: ProviderInfo[] = [
  {
    id: 'expedia-rapid',
    name: 'Expedia Group Rapid API',
    kind: 'hotel-network',
    covers: 'Hotels, plus vacation rentals Expedia Group distributes',
    credentials: ['EXPEDIA_RAPID_API_KEY', 'EXPEDIA_RAPID_SHARED_SECRET'],
    docs: 'https://developers.expediagroup.com/rapid/lodging/vacation-rentals',
    status: 'planned',
  },
  {
    id: 'booking-com',
    name: 'Booking.com partner program',
    kind: 'hotel-network',
    covers: 'Hotels and apartments',
    credentials: ['BOOKING_COM_AFFILIATE_ID', 'BOOKING_COM_API_KEY'],
    status: 'planned',
  },
  {
    id: 'rentals-united',
    name: 'Rentals United',
    kind: 'rental-distributor',
    covers: 'Homes, condos and apartments from many property managers',
    credentials: ['RENTALS_UNITED_USERNAME', 'RENTALS_UNITED_PASSWORD'],
    status: 'planned',
  },
  {
    id: 'nextpax',
    name: 'NextPax',
    kind: 'rental-distributor',
    covers: 'Vacation rentals from connected property managers',
    credentials: ['NEXTPAX_API_KEY'],
    docs: 'https://nextpax.com/accommodations/vacation-rental',
    status: 'planned',
  },
  {
    id: 'bookingpal',
    name: 'BookingPal',
    kind: 'rental-distributor',
    covers: 'Vacation rentals from connected property managers',
    credentials: ['BOOKINGPAL_API_KEY'],
    status: 'planned',
  },
  {
    id: 'guesty',
    name: 'Guesty',
    kind: 'pms',
    covers: 'Professional short-term rental managers',
    credentials: ['GUESTY_CLIENT_ID', 'GUESTY_CLIENT_SECRET'],
    status: 'planned',
  },
  {
    id: 'hostaway',
    name: 'Hostaway',
    kind: 'pms',
    covers: 'Professional short-term rental managers',
    credentials: ['HOSTAWAY_ACCOUNT_ID', 'HOSTAWAY_API_KEY'],
    status: 'planned',
  },
  {
    id: 'ownerrez',
    name: 'OwnerRez',
    kind: 'pms',
    covers: 'Independent owners and small managers',
    credentials: ['OWNERREZ_CLIENT_ID', 'OWNERREZ_CLIENT_SECRET'],
    status: 'planned',
  },
  {
    id: 'direct',
    name: 'Playcation hosts',
    kind: 'direct',
    covers: 'Owners who list through the app',
    credentials: [],
    status: 'planned',
  },
];
