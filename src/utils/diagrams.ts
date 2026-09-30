export interface Bar {
  o: number;
  h: number;
  l: number;
  c: number;
}

/** A small seeded random generator so every diagram is identical on the server and in the browser. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Walk {
  bars: Bar[];
  /** Index of the candle that finishes each leg, i.e. where each swing point sits. */
  turns: number[];
}

/**
 * Builds a believable run of candles that travels through the given swing prices.
 * `counts` is how many candles each leg uses. Legs moving up end on a candle whose high is exactly the swing
 * price; legs moving down end on a candle whose low is exactly the swing price, so annotations sit on the wick tips.
 */
export function walk(points: number[], counts: number | number[], seed = 7, wobble = 0.95): Walk {
  const random = mulberry32(seed);
  const bars: Bar[] = [];
  const turns: number[] = [];
  let previousClose = points[0];

  for (let leg = 0; leg < points.length - 1; leg += 1) {
    const from = points[leg];
    const to = points[leg + 1];
    const n = Array.isArray(counts) ? counts[leg] : counts;
    const step = Math.abs(to - from) / n;
    const up = to > from;

    for (let k = 1; k <= n; k += 1) {
      const last = k === n;
      const target = from + ((to - from) * k) / n;
      const noise = last ? 0 : (random() - 0.5) * 2 * step * wobble;
      const close = last ? to + (up ? -0.22 : 0.22) * step : target + noise;
      const open = previousClose;
      const bodyTop = Math.max(open, close);
      const bodyBottom = Math.min(open, close);
      let high = bodyTop + random() * step * 0.45 + step * 0.05;
      let low = bodyBottom - random() * step * 0.45 - step * 0.05;
      if (last) {
        if (up) high = to;
        else low = to;
      }
      bars.push({o: open, h: high, l: low, c: close});
      previousClose = close;
    }
    turns.push(bars.length - 1);
  }
  return {bars, turns};
}

/** Index of the first candle at or after `from` whose high is above `price`, or -1. */
export function firstHighAbove(bars: Bar[], from: number, price: number): number {
  for (let i = from; i < bars.length; i += 1) if (bars[i].h > price) return i;
  return -1;
}

/** Index of the first candle at or after `from` whose low is below `price`, or -1. */
export function firstLowBelow(bars: Bar[], from: number, price: number): number {
  for (let i = from; i < bars.length; i += 1) if (bars[i].l < price) return i;
  return -1;
}
