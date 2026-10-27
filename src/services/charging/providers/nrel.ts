import { ChargingError, type Charger, type ChargingProvider } from '../types';

/**
 * U.S. Department of Energy Alternative Fuel Stations (NREL). United States only.
 * Free key from developer.nrel.gov (shared api.data.gov key).
 * GET https://developer.nrel.gov/api/alt-fuel-stations/v1/nearest.json
 *     ?api_key=…&latitude=…&longitude=…&radius=…&fuel_type=ELEC&limit=…
 */
type NrelStation = {
  id: number;
  station_name: string;
  street_address?: string | null;
  city?: string | null;
  state?: string | null;
  latitude: number;
  longitude: number;
  distance?: number | null; // miles
  ev_network?: string | null;
  ev_level2_evse_num?: number | string | null;
  ev_dc_fast_num?: number | string | null;
  ev_connector_types?: string[] | null;
  ev_pricing?: string | null;
  status_code?: string | null; // E = open, P = planned, T = temporarily unavailable
  access_code?: string | null; // public | private
};

const PLUG_NAMES: Record<string, string> = {
  J1772: 'J1772',
  J1772COMBO: 'CCS',
  CHADEMO: 'CHAdeMO',
  TESLA: 'NACS (Tesla)',
  J3400: 'NACS (Tesla)',
  NEMA515: 'NEMA 5-15',
  NEMA520: 'NEMA 5-20',
  NEMA1450: 'NEMA 14-50',
};
const NON_NETWORKED = /^non-networked$/i;
const num = (v: number | string | null | undefined) => (v == null || v === '' ? 0 : Number(v) || 0);

/** Converts one NREL station to a Charger. Exported for tests. */
export function fromNrel(s: NrelStation): Charger {
  return {
    id: `nrel:${s.id}`,
    source: 'nrel',
    name: s.station_name,
    address: [s.street_address, s.city].filter(Boolean).join(', ') || undefined,
    network: s.ev_network && !NON_NETWORKED.test(s.ev_network) ? s.ev_network : undefined,
    location: { lat: s.latitude, lng: s.longitude },
    miles: s.distance ?? 0,
    fastPorts: num(s.ev_dc_fast_num),
    level2Ports: num(s.ev_level2_evse_num),
    connectors: [...new Set((s.ev_connector_types ?? []).map((c) => PLUG_NAMES[c] ?? c))],
    cost: s.ev_pricing || undefined,
    available: s.status_code ? s.status_code === 'E' : undefined,
  };
}

export function nrelProvider(apiKey: string): ChargingProvider {
  return {
    id: 'nrel',
    async searchChargers({ near, radiusMiles = 10, limit = 30, fastOnly }) {
      const params = new URLSearchParams({
        api_key: apiKey,
        latitude: String(near.lat),
        longitude: String(near.lng),
        radius: String(radiusMiles),
        fuel_type: 'ELEC',
        access: 'public',
        status: 'E',
        limit: String(limit),
      });
      if (fastOnly) params.set('ev_charging_level', 'dc_fast');
      let res: Response;
      try {
        res = await fetch(`https://developer.nrel.gov/api/alt-fuel-stations/v1/nearest.json?${params.toString()}`);
      } catch {
        throw new ChargingError("Couldn't load charging stations. Check your connection and try again.");
      }
      if (!res.ok) throw new ChargingError(`Charging stations aren't available right now (${res.status}).`);
      const data = (await res.json()) as { fuel_stations?: NrelStation[] };
      return (data.fuel_stations ?? []).map(fromNrel);
    },
  };
}
