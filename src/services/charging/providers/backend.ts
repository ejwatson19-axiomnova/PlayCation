import { API_TIMEOUT_MS, API_URL } from '@/src/config';

import { ChargingError, type Charger, type ChargingProvider } from '../types';

/**
 * Playcation's backend, which can merge Open Charge Map with the U.S. NREL
 * Alternative Fuel Stations data (keys stay on the server).
 *   POST {API_URL}/v1/charging/near   body: ChargerSearch   →   { chargers: Charger[] }
 */
export const backendChargingProvider: ChargingProvider = {
  id: 'backend',
  async searchChargers(search) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
    try {
      const res = await fetch(`${API_URL}/v1/charging/near`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(search),
        signal: controller.signal,
      });
      if (!res.ok) throw new ChargingError(`Charging stations aren't available right now (${res.status}).`);
      const data = (await res.json()) as { chargers?: Charger[] };
      return data.chargers ?? [];
    } catch (e) {
      if (e instanceof ChargingError) throw e;
      throw new ChargingError("Couldn't load charging stations. Check your connection and try again.");
    } finally {
      clearTimeout(timer);
    }
  },
};
