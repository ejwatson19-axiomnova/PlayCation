import { useCallback, useEffect, useState } from 'react';

import type { LatLng } from '@/src/data/mock';
import { getCurrentLocation, LocationDenied } from '@/src/lib/geo';

import { ChargingError, searchChargers, type Charger } from './index';

export type ChargeOrigin = 'venue' | 'me';

type State = { chargers: Charger[]; loading: boolean; error: string | null; denied: boolean; near: LatLng | null };

/**
 * Loads chargers near the venue, or near the phone's GPS position.
 * Runs only while `enabled`, so the GPS prompt appears when the family opens the Charge tab.
 */
export function useChargers(venue: LatLng | undefined, origin: ChargeOrigin, fastOnly: boolean, enabled: boolean) {
  const [state, setState] = useState<State>({ chargers: [], loading: false, error: null, denied: false, near: null });
  const [attempt, setAttempt] = useState(0);
  const venueKey = venue ? `${venue.lat},${venue.lng}` : '';

  useEffect(() => {
    if (!enabled || !venue) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null, denied: false }));
    (async () => {
      try {
        const near = origin === 'me' ? await getCurrentLocation() : venue;
        const chargers = await searchChargers({ near, radiusMiles: origin === 'me' ? 15 : 10, fastOnly, limit: 30 });
        if (!cancelled) setState({ chargers, loading: false, error: null, denied: false, near });
      } catch (e) {
        if (cancelled) return;
        if (e instanceof LocationDenied) setState({ chargers: [], loading: false, error: e.message, denied: true, near: null });
        else setState({ chargers: [], loading: false, denied: false, near: null, error: e instanceof ChargingError ? e.message : "Couldn't find your location. Try again." });
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venueKey, origin, fastOnly, enabled, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, retry };
}
