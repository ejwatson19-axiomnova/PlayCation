import type { LatLng } from '@/src/data/mock';

/** One public EV charging location, normalized across data sources. */
export type Charger = {
  id: string;
  source: 'openchargemap' | 'nrel' | 'sample' | string;
  name: string;
  address?: string;
  network?: string;
  location: LatLng;
  /** Miles from the search point (venue or the family's GPS position). */
  miles: number;
  /** DC fast charging ports (roughly 50 kW and up). */
  fastPorts: number;
  /** Level 2 ports. */
  level2Ports: number;
  /** Plug types, e.g. "J1772", "CCS", "NACS (Tesla)", "CHAdeMO". */
  connectors: string[];
  maxPowerKw?: number;
  cost?: string;
  /** False when the source reports the station as out of service. */
  available?: boolean;
};

export type ChargerSearch = {
  near: LatLng;
  radiusMiles?: number;
  /** Only stations with DC fast charging. */
  fastOnly?: boolean;
  limit?: number;
};

export interface ChargingProvider {
  id: string;
  searchChargers(search: ChargerSearch): Promise<Charger[]>;
}

export class ChargingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChargingError';
  }
}
