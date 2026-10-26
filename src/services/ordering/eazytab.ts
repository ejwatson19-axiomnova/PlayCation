import { Alert, Linking } from 'react-native';

import { EAZYTAB_APP_URL, EAZYTAB_WEB_URL } from '@/src/config';

/** Context Playcation passes so EazyTab can attribute the order and pre-fill the tab. */
export type OrderContext = {
  eventId?: string;
  /** "team" opens a shared tab the team's families can join and split. */
  mode?: 'personal' | 'team';
  teamName?: string;
};

export const eazytabConnected = Boolean(EAZYTAB_WEB_URL || EAZYTAB_APP_URL);

function build(template: string, venueId: string, ctx: OrderContext): string {
  const base = template.replace('{venueId}', encodeURIComponent(venueId));
  // A link that ends in a #token (the EazyTab prototype on claude.ai) can only carry letters,
  // digits, dots and dashes after the #, so the attribution rides as one more dotted part.
  if (base.includes('#')) {
    const tag = ['playcation', ctx.eventId ?? ''].filter(Boolean).join('-').toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    return `${base}.${tag}`;
  }
  const params = new URLSearchParams({ source: 'playcation', mode: ctx.mode ?? 'personal' });
  if (ctx.eventId) params.set('eventId', ctx.eventId);
  if (ctx.teamName) params.set('team', ctx.teamName);
  return `${base}${base.includes('?') ? '&' : '?'}${params.toString()}`;
}

/**
 * Opens EazyTab for a venue. EazyTab is web only, so this is normally its web ordering page;
 * the app link is tried first only if one is configured.
 */
export async function openEazyTab(venueId: string, ctx: OrderContext = {}) {
  if (!eazytabConnected) {
    Alert.alert('Coming soon', 'Ordering with EazyTab will open here once EazyTab is connected.');
    return;
  }
  try {
    if (EAZYTAB_APP_URL) {
      const appUrl = build(EAZYTAB_APP_URL, venueId, ctx);
      if (await Linking.canOpenURL(appUrl)) return await Linking.openURL(appUrl);
    }
    if (EAZYTAB_WEB_URL) return await Linking.openURL(build(EAZYTAB_WEB_URL, venueId, ctx));
  } catch {
    // fall through to the message below
  }
  Alert.alert("Couldn't open EazyTab", 'Try again in a moment.');
}
