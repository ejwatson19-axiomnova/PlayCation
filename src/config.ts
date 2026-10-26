// App configuration. Only EXPO_PUBLIC_* values reach the app, and they are
// visible to anyone with the app, so never put partner API keys here.

/** Playcation's own backend. Empty = use sample data. */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

/**
 * EazyTab ordering links (see docs/EAZYTAB.md). {venueId} is replaced with the venue's EazyTab ID.
 * Empty = buttons show a "coming soon" message instead of opening a link.
 */
export const EAZYTAB_WEB_URL = process.env.EXPO_PUBLIC_EAZYTAB_WEB_URL ?? ''; // e.g. https://order.example.com/v/{venueId}
export const EAZYTAB_APP_URL = process.env.EXPO_PUBLIC_EAZYTAB_APP_URL ?? ''; // e.g. eazytab://venue/{venueId}

/** How long to wait for the backend before showing an error. */
export const API_TIMEOUT_MS = 12000;
