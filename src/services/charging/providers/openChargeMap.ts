import { milesBetween } from '@/src/lib/geo';

import { ChargingError, type Charger, type ChargingProvider } from '../types';

/**
 * Open Charge Map (worldwide, community-maintained). https://openchargemap.org
 * Free for non-commercial and limited commercial use; larger commercial use needs a plan.
 * GET https://api.openchargemap.io/v3/poi?key=…&latitude=…&longitude=…&distance=…&distanceunit=Miles&maxresults=…
 */
type OcmConnection = {
  ConnectionType?: { Title?: string | null } | null;
  LevelID?: number | null; // 1 = Level 1, 2 = Level 2, 3 = DC fast
  PowerKW?: number | null;
  Quantity?: number | null;
  StatusType?: { IsOperational?: boolean | null } | null;
};
type OcmPoi = {
  ID: number;
  AddressInfo?: { Title?: string; AddressLine1?: string | null; Town?: string | null; Latitude: number; Longitude: number; Distance?: number | null } | null;
  OperatorInfo?: { Title?: string | null } | null;
  Connections?: OcmConnection[] | null;
  NumberOfPoints?: number | null;
  UsageCost?: string | null;
  StatusType?: { IsOperational?: boolean | null } | null;
};

const isFast = (c: OcmConnection) => c.LevelID === 3 || (c.PowerKW ?? 0) >= 50;

/** Converts one Open Charge Map record to a Charger. Exported for tests. */
export function fromOcm(p: OcmPoi, near: { lat: number; lng: number }): Charger | null {
  const a = p.AddressInfo;
  if (!a || typeof a.Latitude !== 'number' || typeof a.Longitude !== 'number') return null;
  const conns = p.Connections ?? [];
  const count = (c: OcmConnection) => Math.max(1, c.Quantity ?? 1);
  let fast = conns.filter(isFast).reduce((n, c) => n + count(c), 0);
  let l2 = conns.filter((c) => !isFast(c) && c.LevelID !== 1).reduce((n, c) => n + count(c), 0);
  if (!fast && !l2 && p.NumberOfPoints) l2 = p.NumberOfPoints; // ports listed without details
  const powers = conns.map((c) => c.PowerKW ?? 0).filter((kw) => kw > 0);
  const location = { lat: a.Latitude, lng: a.Longitude };
  const network = p.OperatorInfo?.Title ?? undefined;
  return {
    id: `ocm:${p.ID}`,
    source: 'openchargemap',
    name: a.Title || 'EV charging',
    address: [a.AddressLine1, a.Town].filter(Boolean).join(', ') || undefined,
    network: network && !/unknown/i.test(network) ? network : undefined,
    location,
    miles: typeof a.Distance === 'number' ? a.Distance : milesBetween(near, location),
    fastPorts: fast,
    level2Ports: l2,
    connectors: [...new Set(conns.map((c) => c.ConnectionType?.Title).filter((t): t is string => !!t))],
    maxPowerKw: powers.length ? Math.max(...powers) : undefined,
    cost: p.UsageCost || undefined,
    available: p.StatusType?.IsOperational ?? undefined,
  };
}

export function openChargeMapProvider(apiKey: string): ChargingProvider {
  return {
    id: 'openchargemap',
    async searchChargers({ near, radiusMiles = 10, limit = 30 }) {
      const params = new URLSearchParams({
        key: apiKey,
        output: 'json',
        compact: 'true',
        verbose: 'false',
        latitude: String(near.lat),
        longitude: String(near.lng),
        distance: String(radiusMiles),
        distanceunit: 'Miles',
        maxresults: String(limit),
      });
      let res: Response;
      try {
        res = await fetch(`https://api.openchargemap.io/v3/poi?${params.toString()}`);
      } catch {
        throw new ChargingError("Couldn't load charging stations. Check your connection and try again.");
      }
      if (!res.ok) throw new ChargingError(`Charging stations aren't available right now (${res.status}).`);
      const data = (await res.json()) as OcmPoi[];
      return data.map((p) => fromOcm(p, near)).filter((c): c is Charger => !!c);
    },
  };
}
