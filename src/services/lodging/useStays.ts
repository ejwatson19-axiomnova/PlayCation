import { useCallback, useEffect, useState } from 'react';

import type { PlaceType, Stay } from '@/src/data/mock';

import { LodgingError, searchStays, type StaySearch } from './index';

type State = { stays: Stay[]; loading: boolean; error: string | null };

/** Loads stays near an event; re-runs when the search changes. */
export function useStays(search: StaySearch | null, type: 'Any' | PlaceType) {
  const [state, setState] = useState<State>({ stays: [], loading: true, error: null });
  const [attempt, setAttempt] = useState(0);
  const key = search ? JSON.stringify(search) : '';

  useEffect(() => {
    if (!search) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    searchStays(search)
      .then((stays) => !cancelled && setState({ stays, loading: false, error: null }))
      .catch((e: unknown) =>
        !cancelled && setState({ stays: [], loading: false, error: e instanceof LodgingError ? e.message : 'Something went wrong loading stays.' }),
      );
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const stays = type === 'Any' ? state.stays : state.stays.filter((s) => s.type === type);
  return { ...state, stays, retry };
}
