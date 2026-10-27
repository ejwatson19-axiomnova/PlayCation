import snapshot from '@/src/data/chargers-demo-venue.json';
import { milesBetween } from '@/src/lib/geo';

import { ChargingError, type Charger, type ChargingProvider } from '../types';

/**
 * Real public EV chargers within 15 miles of the demo venue (Front Range Sports Complex, Aurora, CO),
 * taken from Open Charge Map's open data export (github.com/openchargemap/ocm-export, April 2026).
 * Only records licensed CC BY 4.0 (Open Charge Map contributors) or public-domain-style
 * (NREL / U.S. DOE) are included. Regenerate with scripts/build-charger-snapshot.py.
 * Used until a live source (backend, Open Charge Map key or NREL key) is connected.
 */
type Row = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  fast: number;
  l2: number;
  plugs: string[];
  addr?: string;
  net?: string;
  kw?: number;
  cost?: string;
  down?: boolean;
  src: number;
};

const data = snapshot as unknown as { meta: { center: { lat: number; lng: number }; radiusMiles: number; attribution: string }; stations: Row[] };

export const SNAPSHOT_ATTRIBUTION = data.meta.attribution;

export const snapshotChargingProvider: ChargingProvider = {
  id: 'snapshot',
  async searchChargers({ near, radiusMiles = 10, fastOnly, limit = 30 }) {
    // Outside the area the snapshot covers there is no real data to show.
    if (milesBetween(near, data.meta.center) > data.meta.radiusMiles) {
      throw new ChargingError('Chargers near you will show here once live charging data is connected. For now, try “Near the fields.”');
    }
    return data.stations
      .map(
        (s): Charger => ({
          id: s.id,
          source: s.src === 2 ? 'nrel' : 'openchargemap',
          name: s.name,
          address: s.addr,
          network: s.net,
          location: { lat: s.lat, lng: s.lng },
          miles: milesBetween(near, { lat: s.lat, lng: s.lng }),
          fastPorts: s.fast,
          level2Ports: s.l2,
          connectors: s.plugs,
          maxPowerKw: s.kw,
          cost: s.cost,
          available: s.down ? false : undefined,
        }),
      )
      .filter((c) => c.miles <= radiusMiles && (!fastOnly || c.fastPorts > 0))
      .sort((a, b) => a.miles - b.miles)
      .slice(0, limit);
  },
};
