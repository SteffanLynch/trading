import {incomplete, invalid, isNum, ok, type Calc} from './result';

export const RETRACEMENT_RATIOS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
export const EXTENSION_RATIOS = [1.272, 1.618, 2, 2.618];

export type SwingDirection = 'up' | 'down';

export interface FibLevel {
  ratio: number;
  price: number;
}

export interface FibonacciValue {
  range: number;
  /** Levels inside the swing: where price could pull back to. */
  retracements: FibLevel[];
  /** Levels beyond the swing: where price could extend to. */
  extensions: FibLevel[];
}

/**
 * Fibonacci levels for a swing.
 *  - "up": price rose from `low` to `high`; retracements measure back down from the high.
 *  - "down": price fell from `high` to `low`; retracements measure back up from the low.
 * Extensions project the swing's length beyond its end.
 */
export function fibonacciLevels(high: number | null, low: number | null, direction: SwingDirection): Calc<FibonacciValue> {
  if (!isNum(high) || !isNum(low)) return incomplete();
  if (high === low) return invalid('The swing high and swing low cannot be the same price.');
  if (high < low) return invalid('The swing high must be above the swing low.');

  const range = high - low;
  const up = direction === 'up';
  return ok({
    range,
    retracements: RETRACEMENT_RATIOS.map((ratio) => ({ratio, price: up ? high - range * ratio : low + range * ratio})),
    extensions: EXTENSION_RATIOS.map((ratio) => ({ratio, price: up ? low + range * ratio : high - range * ratio})),
  });
}
