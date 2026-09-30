import {incomplete, invalid, isNum, ok, type Calc} from './result';

export type PivotMethod = 'classic' | 'woodie' | 'fibonacci' | 'camarilla';

export interface PivotLevel {
  name: string;
  price: number;
  kind: 'resistance' | 'pivot' | 'support';
}

export interface PivotValue {
  method: PivotMethod;
  pivot: number;
  /** Highest to lowest. */
  levels: PivotLevel[];
}

export const PIVOT_METHODS: {value: PivotMethod; label: string; note: string}[] = [
  {value: 'classic', label: 'Classic', note: 'The traditional method: the average of the high, low and close, with levels built from the previous range.'},
  {value: 'woodie', label: 'Woodie', note: 'Gives the close extra weight, so the pivot sits closer to where the period ended.'},
  {value: 'fibonacci', label: 'Fibonacci', note: 'Spaces the levels from the pivot using Fibonacci ratios of the previous range.'},
  {value: 'camarilla', label: 'Camarilla', note: 'Builds tighter levels around the close, often used for shorter-term reference points.'},
];

/** Pivot point reference levels from the previous period's high, low and close. */
export function pivotLevels(high: number | null, low: number | null, close: number | null, method: PivotMethod): Calc<PivotValue> {
  if (!isNum(high) || !isNum(low) || !isNum(close)) return incomplete();
  if (high < low) return invalid('The high must be at or above the low.');
  if (close > high || close < low) return invalid('The close must sit between the low and the high.');

  const range = high - low;
  const r = (name: string, price: number): PivotLevel => ({name, price, kind: 'resistance'});
  const s = (name: string, price: number): PivotLevel => ({name, price, kind: 'support'});
  let pivot: number;
  let levels: PivotLevel[];

  switch (method) {
    case 'woodie': {
      pivot = (high + low + 2 * close) / 4;
      levels = [r('R2', pivot + range), r('R1', 2 * pivot - low), {name: 'P', price: pivot, kind: 'pivot'}, s('S1', 2 * pivot - high), s('S2', pivot - range)];
      break;
    }
    case 'fibonacci': {
      pivot = (high + low + close) / 3;
      levels = [r('R3', pivot + range), r('R2', pivot + 0.618 * range), r('R1', pivot + 0.382 * range), {name: 'P', price: pivot, kind: 'pivot'}, s('S1', pivot - 0.382 * range), s('S2', pivot - 0.618 * range), s('S3', pivot - range)];
      break;
    }
    case 'camarilla': {
      pivot = (high + low + close) / 3;
      levels = [
        r('R4', close + (range * 1.1) / 2),
        r('R3', close + (range * 1.1) / 4),
        r('R2', close + (range * 1.1) / 6),
        r('R1', close + (range * 1.1) / 12),
        {name: 'P', price: pivot, kind: 'pivot'},
        s('S1', close - (range * 1.1) / 12),
        s('S2', close - (range * 1.1) / 6),
        s('S3', close - (range * 1.1) / 4),
        s('S4', close - (range * 1.1) / 2),
      ];
      break;
    }
    default: {
      pivot = (high + low + close) / 3;
      levels = [
        r('R3', high + 2 * (pivot - low)),
        r('R2', pivot + range),
        r('R1', 2 * pivot - low),
        {name: 'P', price: pivot, kind: 'pivot'},
        s('S1', 2 * pivot - high),
        s('S2', pivot - range),
        s('S3', low - 2 * (high - pivot)),
      ];
    }
  }
  return ok({method, pivot, levels});
}
