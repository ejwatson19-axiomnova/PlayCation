import { Alert, Linking } from 'react-native';

import { EAZYTAB_WEB_URL } from '@/src/config';

/** Context Playcation passes so EazyTab can attribute the order. */
export type OrderContext = {
  eventId?: string;
};

export const eazytabConnected = Boolean(EAZYTAB_WEB_URL);

/** Keeps the event ID safe inside EazyTab's dotted link format. */
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '');

/**
 * Builds the EazyTab ordering link for a venue (or a stand inside it).
 * EazyTab is web-only, so this always opens the browser.
 *
 * - Hash links (the EazyTab demo on claude.ai): `…#fan.{venueId}` + `.playcation-<eventId>`
 * - Production links (eazytab.app): `…/{venueId}` + `?source=playcation&eventId=<eventId>`
 */
export function eazytabLink(venueId: string, ctx: OrderContext = {}): string {
  const base = EAZYTAB_WEB_URL.replace('{venueId}', venueId);
  const event = ctx.eventId ? slug(ctx.eventId) : '';
  if (base.includes('#')) return `${base}.playcation${event ? '-' + event : ''}`;
  const params = new URLSearchParams({ source: 'playcation' });
  if (event) params.set('eventId', event);
  return `${base}${base.includes('?') ? '&' : '?'}${params.toString()}`;
}

export async function openEazyTab(venueId: string, ctx: OrderContext = {}) {
  if (!eazytabConnected) {
    Alert.alert('Coming soon', 'Ordering with EazyTab will open here once EazyTab is connected.');
    return;
  }
  try {
    await Linking.openURL(eazytabLink(venueId, ctx));
  } catch {
    Alert.alert("Couldn't open EazyTab", 'Try again in a moment.');
  }
}
