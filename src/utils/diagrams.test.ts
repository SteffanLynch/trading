import {describe, expect, it} from 'vitest';
import {firstHighAbove, firstLowBelow, walk} from './diagrams';

describe('walk', () => {
  const points = [100, 118, 108, 130];
  const {bars, turns} = walk(points, [5, 3, 5]);

  it('draws the requested number of candles and records where each swing ends', () => {
    expect(bars).toHaveLength(13);
    expect(turns).toEqual([4, 7, 12]);
  });

  it('puts swing highs and lows exactly on the wick tips', () => {
    expect(bars[4].h).toBe(118);
    expect(bars[7].l).toBe(108);
    expect(bars[12].h).toBe(130);
  });

  it('builds valid candles that connect end to start', () => {
    bars.forEach((bar, index) => {
      expect(bar.h).toBeGreaterThanOrEqual(Math.max(bar.o, bar.c));
      expect(bar.l).toBeLessThanOrEqual(Math.min(bar.o, bar.c));
      if (index > 0) expect(bar.o).toBeCloseTo(bars[index - 1].c, 9);
    });
  });

  it('never pokes past a swing it is meant to respect', () => {
    // during the first up-leg no candle exceeds the swing high of 118
    expect(Math.max(...bars.slice(0, 5).map((bar) => bar.h))).toBe(118);
  });

  it('is identical every time (server and browser must agree)', () => {
    expect(walk(points, [5, 3, 5])).toEqual({bars, turns});
    expect(walk(points, [5, 3, 5], 99).bars).not.toEqual(bars);
  });

  it('contains both up and down candles inside a trend', () => {
    const big = walk([100, 160], 20).bars;
    expect(big.some((bar) => bar.c > bar.o)).toBe(true);
    expect(big.some((bar) => bar.c < bar.o)).toBe(true);
  });
});

describe('breakout helpers', () => {
  const {bars} = walk([100, 120, 108, 130], [5, 4, 6]);
  it('finds where price first breaks a level', () => {
    const above = firstHighAbove(bars, 5, 120);
    expect(above).toBeGreaterThan(8);
    expect(bars[above].h).toBeGreaterThan(120);
    expect(firstHighAbove(bars, 0, 999)).toBe(-1);
    const below = firstLowBelow(bars, 0, 110);
    expect(bars[below].l).toBeLessThan(110);
    expect(firstLowBelow(bars, 0, 1)).toBe(-1);
  });
});
