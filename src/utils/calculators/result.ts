import type {CurrencyCode} from './instruments';

/**
 * Every engine function returns a `Calc`. The UI switches on `status`:
 *  - incomplete: a field is empty / not a number yet. Show nothing (no error while typing).
 *  - invalid:    all fields present but the combination makes no sense. Show `message`.
 *  - needs-rate: an exchange rate is required to convert the quote currency to the account currency.
 *  - ok:         `value` holds the results.
 */
export type Calc<T> =
  | {status: 'incomplete'}
  | {status: 'invalid'; message: string}
  | {status: 'needs-rate'; from: CurrencyCode; to: CurrencyCode}
  | {status: 'ok'; value: T};

export const incomplete = (): {status: 'incomplete'} => ({status: 'incomplete'});
export const invalid = (message: string): {status: 'invalid'; message: string} => ({status: 'invalid', message});
export const ok = <T>(value: T): {status: 'ok'; value: T} => ({status: 'ok', value});

/** True for real, finite numbers. `null`, `undefined` and `NaN` (an unparseable field) are all "not yet". */
export const isNum = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** Rounds down to a multiple of `step`, tolerating float noise (0.29 / 0.01 = 28.999…). */
export function floorToStep(value: number, step: number): number {
  if (!(step > 0)) return value;
  const steps = Math.floor(value / step + 1e-9);
  const decimals = Math.max(0, Math.ceil(-Math.log10(step)) + 2);
  return Number((steps * step).toFixed(Math.min(decimals, 12)));
}
