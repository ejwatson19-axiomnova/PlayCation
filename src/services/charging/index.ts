import { API_URL, NREL_KEY, OPENCHARGEMAP_KEY } from '@/src/config';
import { milesBetween } from '@/src/lib/geo';

import { backendChargingProvider } from './providers/backend';
import { nrelProvider } from './providers/nrel';
import { openChargeMapProvider } from './providers/openChargeMap';
import { SNAPSHOT_ATTRIBUTION, snapshotChargingProvider } from './providers/snapshot';
import { ChargingError, type Charger, type ChargerSearch, type ChargingProvider } from './types';

export type { Charger, ChargerSearch } from './types';
export { ChargingError } from './types';

/**
 * Source order:
 * 1. Playcation's backend (merges sources, keeps keys private) when EXPO_PUBLIC_API_URL is set.
 * 2. Open Charge Map and/or NREL directly, when their keys are set (both: merged).
 * 3. The built-in snapshot of real stations around the demo venue.
 */
const live: ChargingProvider[] = API_URL
  ? [backendChargingProvider]
  : [OPENCHARGEMAP_KEY ? openChargeMapProvider(OPENCHARGEMAP_KEY) : null, NREL_KEY ? nrelProvider(NREL_KEY) : null].filter(
      (p): p is ChargingProvider => !!p,
    );

export const chargingUsesSnapshot = live.length === 0;
/** Credit line the app shows (Open Charge Map data is CC BY 4.0). */
export const chargingAttribution = chargingUsesSnapshot || OPENCHARGEMAP_KEY ? SNAPSHOT_ATTRIBUTION : 'Charging station data: NREL / U.S. DOE';

/** The same station reported by two sources sits within ~150 ft; keep the first. */
function dedupe(list: Charger[]): Charger[] {
  const kept: Charger[] = [];
  for (const c of list) if (!kept.some((k) => milesBetween(k.location, c.location) < 0.03)) kept.push(c);
  return kept;
}

/** Public chargers near a point, closest first; out-of-service stations last. */
export async function searchChargers(search: ChargerSearch): Promise<Charger[]> {
  let list: Charger[];
  if (chargingUsesSnapshot) {
    list = await snapshotChargingProvider.searchChargers(search);
  } else {
    const results = await Promise.allSettled(live.map((p) => p.searchChargers(search)));
    const ok = results.filter((r): r is PromiseFulfilledResult<Charger[]> => r.status === 'fulfilled');
    if (!ok.length) {
      const first = results[0] as PromiseRejectedResult;
      throw first.reason instanceof ChargingError ? first.reason : new ChargingError("Couldn't load charging stations. Try again.");
    }
    list = ok.flatMap((r) => r.value);
  }
  return dedupe(
    list
      .filter((c) => !search.fastOnly || c.fastPorts > 0)
      .sort((a, b) => Number(a.available === false) - Number(b.available === false) || a.miles - b.miles),
  );
}
