import {useEffect} from 'react';

type PostHogLike = {capture: (event: string, properties?: Record<string, unknown>) => void};

/** Rounds away floating-point noise (50.00000000000115 -> 50) so analytics stay readable. */
function tidy(value: unknown): unknown {
  return typeof value === 'number' && Number.isFinite(value) ? Number(value.toFixed(6)) : value;
}

/** Sends an event to PostHog if it has been installed on the page. Silent no-op otherwise. */
export function trackEvent(event: string, properties: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const posthog = (window as unknown as {posthog?: PostHogLike}).posthog;
  posthog?.capture(event, properties);
}

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
 * Debounced `calculator_calculated` event. Fires once, a second after the visitor stops typing,
 * with all inputs and the computed outputs.
 */
export function useTrackCalculation({name, enabled, payload, embedded}: TrackOptions): void {
  const key = JSON.stringify(payload);

  useEffect(() => {
    if (!enabled) return undefined;
    const timer = window.setTimeout(() => {
      trackEvent('calculator_calculated', {
        calculator_name: name,
        placement: embedded ? 'embedded' : 'page',
        ...Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, tidy(value)])),
      });
    }, 1000);
    return () => window.clearTimeout(timer);
    // `key` captures every value in `payload`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, name, embedded, key]);
}
