// App configuration. Only EXPO_PUBLIC_* values reach the app, and they are
// visible to anyone with the app, so never put partner API keys here.

/** Playcation's own backend. Empty = use sample data. */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

/** How long to wait for the backend before showing an error. */
export const API_TIMEOUT_MS = 12000;
