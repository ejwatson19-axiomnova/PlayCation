import { API_URL, OPENCHARGEMAP_KEY } from '@/src/config';

import { backendChargingProvider } from './providers/backend';
import { openChargeMapProvider } from './providers/openChargeMap';
import { sampleChargingProvider } from './providers/sample';
import type { Charger, ChargerSearch, ChargingProvider } from './types';

export type { Charger, ChargerSearch } from './types';
export { ChargingError } from './types';

// Backend first (merges sources, keeps keys private), then Open Charge Map directly, then sample data.
const provider: ChargingProvider = API_URL
  ? backendChargingProvider
  : OPENCHARGEMAP_KEY
    ? openChargeMapProvider(OPENCHARGEMAP_KEY)
    : sampleChargingProvider;

export const chargingUsesSampleData = provider === sampleChargingProvider;

/** Public chargers near a point, closest first; out-of-service stations last. */
export async function searchChargers(search: ChargerSearch): Promise<Charger[]> {
  const list = await provider.searchChargers(search);
  return list
    .filter((c) => !search.fastOnly || c.fastPorts > 0)
    .sort((a, b) => Number(a.available === false) - Number(b.available === false) || a.miles - b.miles);
}
