import {useEffect} from 'react';
import {track} from '../../../analytics';

interface TrackOptions {
  /** Stable name, e.g. "position_size". */
  name: string;
  /** Only report once the visitor has changed an input and the result is valid. */
  enabled: boolean;
  /** Every input and every computed output, as flat snake_case properties. */
  payload: Record<string, unknown>;
  embedded: boolean;
}

/**
 * Debounced `calculator_calculated` event. Fires once, a second after the visitor stops typing, with all inputs and
 * the computed outputs (PostHog only: Google Analytics gets just the calculator's name). Does nothing unless the
 * visitor has allowed analytics. Plain numbers, flags and short labels are kept; anything else is dropped.
 */
export function useTrackCalculation({name, enabled, payload, embedded}: TrackOptions): void {
  const key = JSON.stringify(payload);

  useEffect(() => {
    if (!enabled) return undefined;
    const timer = window.setTimeout(() => {
      track('calculator_calculated', {calculator_name: name, placement: embedded ? 'embedded' : 'page', ...payload});
    }, 1000);
    return () => window.clearTimeout(timer);
    // `key` captures every value in `payload`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, name, embedded, key]);
}
