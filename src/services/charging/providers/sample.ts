import { milesBetween } from '@/src/lib/geo';

import type { Charger, ChargingProvider } from '../types';

// Sample stations placed around whatever point is searched, so both
// "near the fields" and "near me" show something before live data is connected.
const SAMPLES: Omit<Charger, 'id' | 'source' | 'location' | 'miles'>[] = [
  { name: '[Shopping center] chargers', network: '[Network]', fastPorts: 4, level2Ports: 0, connectors: ['CCS', 'NACS (Tesla)'], maxPowerKw: 150, cost: '[Price per kWh]' },
  { name: '[Hotel] guest chargers', network: '[Network]', fastPorts: 0, level2Ports: 6, connectors: ['J1772'], maxPowerKw: 7, cost: 'Free for guests' },
  { name: '[Grocery store] chargers', network: '[Network]', fastPorts: 2, level2Ports: 2, connectors: ['CCS', 'CHAdeMO', 'J1772'], maxPowerKw: 62, cost: '[Price per kWh]' },
  { name: '[Highway plaza] fast charging', network: '[Network]', fastPorts: 8, level2Ports: 0, connectors: ['NACS (Tesla)'], maxPowerKw: 250, cost: '[Price per kWh]' },
  { name: '[City library] lot', network: '[Network]', fastPorts: 0, level2Ports: 2, connectors: ['J1772'], maxPowerKw: 7, cost: 'Free' },
];
const OFFSETS = [
  [0.008, 0.011],
  [-0.012, 0.004],
  [0.019, -0.016],
  [-0.031, -0.027],
  [0.041, 0.035],
];

export const sampleChargingProvider: ChargingProvider = {
  id: 'sample',
  async searchChargers({ near, fastOnly, radiusMiles = 10 }) {
    return SAMPLES.map((s, i) => {
      const location = { lat: near.lat + OFFSETS[i][0], lng: near.lng + OFFSETS[i][1] };
      return { ...s, id: `sample:${i}`, source: 'sample', location, miles: milesBetween(near, location) };
    }).filter((c) => c.miles <= radiusMiles && (!fastOnly || c.fastPorts > 0));
  },
};
