import {describe, expect, it} from 'vitest';
import {CANDLE_PRESETS, candleAnatomy, normaliseCandle, readCandle} from './candles';

describe('candleAnatomy', () => {
  it('breaks four prices into body and wicks', () => {
    const a = candleAnatomy({open: 1.1, high: 1.11, low: 1.095, close: 1.107});
    expect(a.direction).toBe('bullish');
    expect(a.range).toBeCloseTo(0.015);
    expect(a.body).toBeCloseTo(0.007);
    expect(a.upperWick).toBeCloseTo(0.003);
    expect(a.lowerWick).toBeCloseTo(0.005);
    expect(a.bodyPct + a.upperPct + a.lowerPct).toBeCloseTo(100);
  });

  it('flips to bearish when the close drops below the open', () => {
    expect(candleAnatomy({open: 1.1, high: 1.11, low: 1.095, close: 1.098}).direction).toBe('bearish');
  });

  it('keeps candles possible: the high and low stretch to cover the body', () => {
    expect(normaliseCandle({open: 1.1, high: 1.09, low: 1.105, close: 1.107})).toEqual({open: 1.1, high: 1.107, low: 1.1, close: 1.107});
  });

  it('recognises each preset shape', () => {
    const shape = (id: string) => candleAnatomy(CANDLE_PRESETS.find((preset) => preset.id === id)!.candle).shape;
    expect(shape('doji')).toBe('doji');
    expect(shape('hammer')).toBe('hammer');
    expect(shape('shooting-star')).toBe('shooting-star');
    expect(shape('marubozu')).toBe('marubozu');
  });

  it('every preset is already a physically possible candle', () => {
    for (const preset of CANDLE_PRESETS) {
      expect(normaliseCandle(preset.candle)).toEqual(preset.candle);
      if (preset.previous) expect(normaliseCandle(preset.previous)).toEqual(preset.previous);
    }
  });

  it('engulfing presets really engulf the previous body', () => {
    for (const id of ['bullish-engulfing', 'bearish-engulfing']) {
      const preset = CANDLE_PRESETS.find((entry) => entry.id === id)!;
      const prev = preset.previous!;
      const bodyTop = (c: {open: number; close: number}) => Math.max(c.open, c.close);
      const bodyBottom = (c: {open: number; close: number}) => Math.min(c.open, c.close);
      expect(bodyTop(preset.candle)).toBeGreaterThan(bodyTop(prev));
      expect(bodyBottom(preset.candle)).toBeLessThan(bodyBottom(prev));
    }
  });

  it('explains what it sees', () => {
    const lines = readCandle({open: 1.1, high: 1.11, low: 1.095, close: 1.107});
    expect(lines[0]).toContain('Bullish');
    expect(readCandle(CANDLE_PRESETS.find((p) => p.id === 'hammer')!.candle).join(' ')).toContain('hammer');
  });
});
