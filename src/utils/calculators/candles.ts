export interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
}

export type CandleDirection = 'bullish' | 'bearish' | 'doji';
export type CandleShape = 'doji' | 'hammer' | 'shooting-star' | 'marubozu' | 'spinning-top' | 'standard';

export interface CandleAnatomy {
  direction: CandleDirection;
  range: number;
  body: number;
  upperWick: number;
  lowerWick: number;
  /** Shares of the full high-low range (0-100). */
  bodyPct: number;
  upperPct: number;
  lowerPct: number;
  shape: CandleShape;
}

/** Keeps a candle physically possible: the high is never below the body and the low is never above it. */
export function normaliseCandle(candle: Candle): Candle {
  const top = Math.max(candle.open, candle.close);
  const bottom = Math.min(candle.open, candle.close);
  return {...candle, high: Math.max(candle.high, top), low: Math.min(candle.low, bottom)};
}

export function describeShape(body: number, upper: number, lower: number, range: number): CandleShape {
  if (range <= 0) return 'doji';
  const bodyShare = body / range;
  if (bodyShare <= 0.1) return 'doji';
  if (bodyShare >= 0.9) return 'marubozu';
  if (lower >= 2 * body && upper <= body * 0.6 + 1e-12 && bodyShare <= 0.4) return 'hammer';
  if (upper >= 2 * body && lower <= body * 0.6 + 1e-12 && bodyShare <= 0.4) return 'shooting-star';
  if (bodyShare <= 0.3 && upper > body * 0.6 && lower > body * 0.6) return 'spinning-top';
  return 'standard';
}

export function candleAnatomy(candle: Candle): CandleAnatomy {
  const {open, high, low, close} = normaliseCandle(candle);
  const range = high - low;
  const body = Math.abs(close - open);
  const upperWick = high - Math.max(open, close);
  const lowerWick = Math.min(open, close) - low;
  const share = (value: number) => (range > 0 ? (value / range) * 100 : 0);
  const shape = describeShape(body, upperWick, lowerWick, range);
  return {
    direction: shape === 'doji' && body / (range || 1) <= 0.1 ? 'doji' : close > open ? 'bullish' : close < open ? 'bearish' : 'doji',
    range,
    body,
    upperWick,
    lowerWick,
    bodyPct: share(body),
    upperPct: share(upperWick),
    lowerPct: share(lowerWick),
    shape,
  };
}

/** Plain-English reading of what the four prices say. */
export function readCandle(candle: Candle): string[] {
  const a = candleAnatomy(candle);
  const lines: string[] = [];

  if (a.direction === 'bullish') lines.push('Bullish candle: it closed above where it opened, so buyers won the period.');
  else if (a.direction === 'bearish') lines.push('Bearish candle: it closed below where it opened, so sellers won the period.');
  else lines.push('A doji: the open and close are almost equal, so neither side won. It shows indecision.');

  if (a.shape === 'marubozu') lines.push('The body fills almost the whole range with hardly any wicks: one side was in control from start to finish.');
  else if (a.bodyPct >= 60) lines.push('A large body means price travelled a long way from open to close and stayed there: conviction.');
  else if (a.bodyPct <= 25 && a.shape !== 'doji') lines.push('A small body means price ended close to where it started, despite any swings in between.');

  if (a.lowerPct >= 40) lines.push('A long lower wick: sellers pushed price down, but buyers rejected those lower prices and pushed it back up.');
  if (a.upperPct >= 40) lines.push('A long upper wick: buyers pushed price up, but sellers rejected those higher prices and pushed it back down.');
  if (a.lowerPct < 40 && a.upperPct < 40 && a.shape !== 'marubozu') lines.push('Both wicks are modest, so price stayed fairly close to the body throughout.');

  if (a.shape === 'hammer') lines.push('This shape is called a hammer (a pinbar): a small body near the top with a long lower wick. After a fall it can signal buyers stepping in. It is a clue, never a guarantee.');
  if (a.shape === 'shooting-star') lines.push('This shape is called a shooting star (a pinbar): a small body near the bottom with a long upper wick. After a rise it can signal sellers stepping in. It is a clue, never a guarantee.');
  if (a.shape === 'spinning-top') lines.push('A spinning top: a small body with wicks on both sides. Both sides pushed, and neither took control.');
  return lines;
}

export interface CandlePreset {
  id: string;
  label: string;
  candle: Candle;
  /** The candle before it, for two-candle patterns. */
  previous?: Candle;
  blurb: string;
}

export const CANDLE_PRESETS: CandlePreset[] = [
  {id: 'bullish', label: 'Bullish', candle: {open: 1.1, high: 1.11, low: 1.095, close: 1.107}, blurb: 'Closed above the open. Buyers won the period.'},
  {id: 'bearish', label: 'Bearish', candle: {open: 1.107, high: 1.11, low: 1.095, close: 1.098}, blurb: 'Closed below the open. Sellers won the period.'},
  {id: 'doji', label: 'Doji', candle: {open: 1.105, high: 1.111, low: 1.099, close: 1.1052}, blurb: 'Open and close are nearly equal: a standoff between buyers and sellers.'},
  {id: 'hammer', label: 'Hammer', candle: {open: 1.1035, high: 1.1058, low: 1.095, close: 1.1052}, blurb: 'A small body at the top with a long lower wick: price was pushed down, then rejected.'},
  {id: 'shooting-star', label: 'Shooting star', candle: {open: 1.1048, high: 1.115, low: 1.1026, close: 1.103}, blurb: 'A small body at the bottom with a long upper wick: price was pushed up, then rejected.'},
  {id: 'marubozu', label: 'Marubozu', candle: {open: 1.1, high: 1.1102, low: 1.0998, close: 1.1098}, blurb: 'A full body with almost no wicks: one side in control all period.'},
  {
    id: 'bullish-engulfing',
    label: 'Bullish engulfing',
    previous: {open: 1.105, high: 1.1055, low: 1.1, close: 1.101},
    candle: {open: 1.0998, high: 1.109, low: 1.0994, close: 1.1082},
    blurb: 'A bullish candle whose body swallows the previous bearish body: buyers overwhelmed the sellers.',
  },
  {
    id: 'bearish-engulfing',
    label: 'Bearish engulfing',
    previous: {open: 1.1, high: 1.105, low: 1.0995, close: 1.1046},
    candle: {open: 1.1056, high: 1.1062, low: 1.0958, close: 1.0968},
    blurb: 'A bearish candle whose body swallows the previous bullish body: sellers overwhelmed the buyers.',
  },
  {
    id: 'inside-bar',
    label: 'Inside bar',
    previous: {open: 1.1, high: 1.11, low: 1.095, close: 1.108},
    candle: {open: 1.105, high: 1.107, low: 1.101, close: 1.103},
    blurb: 'The whole candle fits inside the previous one: a pause before the next move.',
  },
];
