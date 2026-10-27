// App configuration. Only EXPO_PUBLIC_* values reach the app, and they are
// visible to anyone with the app, so never put partner API keys here.

/** Playcation's own backend. Empty = use sample data. */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

/** EazyTab's clickable demo (a private claude.ai page; share it with testers). */
const EAZYTAB_DEMO_URL = 'https://claude.ai/artifact/1rxKTgNgUpL4ASjkzjQw6v#fan.{venueId}';

/**
 * EazyTab ordering link (see docs/EAZYTAB.md). {venueId} is replaced with the venue's EazyTab path,
 * e.g. youth-tournaments.front-range-sports-complex. Defaults to the EazyTab demo; set
 * EXPO_PUBLIC_EAZYTAB_WEB_URL to the production site (eazytab.app) when it launches.
 */
export const EAZYTAB_WEB_URL = process.env.EXPO_PUBLIC_EAZYTAB_WEB_URL || EAZYTAB_DEMO_URL;

/**
 * Open Charge Map key for EV charging stations, used only when there's no backend.
 * Get one free at openchargemap.org. Empty (and no backend) = sample stations.
 */
export const OPENCHARGEMAP_KEY = process.env.EXPO_PUBLIC_OPENCHARGEMAP_KEY ?? '';

/** NREL (U.S. Department of Energy) station data key, used only when there's no backend. Free at developer.nrel.gov. */
export const NREL_KEY = process.env.EXPO_PUBLIC_NREL_KEY ?? '';

/** How long to wait for the backend before showing an error. */
export const API_TIMEOUT_MS = 12000;
