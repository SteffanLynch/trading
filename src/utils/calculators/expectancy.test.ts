import {describe, expect, it} from 'vitest';
import {calculateExpectancy} from './expectancy';

describe('calculateExpectancy', () => {
  it('45% winners of 2R against 1R losers is +0.35R per trade', () => {
    const result = calculateExpectancy({winRatePct: 45, averageWin: 2, averageLoss: 1, trades: 100});
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.value.expectancy).toBeCloseTo(0.35);
    expect(result.value.edge).toBe('positive');
    expect(result.value.lossRatePct).toBeCloseTo(55);
    expect(result.value.payoffRatio).toBeCloseTo(2);
    expect(result.value.breakEvenWinRate).toBeCloseTo(33.333, 2);
    expect(result.value.profitFactor).toBeCloseTo(1.636, 3);
    expect(result.value.projected).toBeCloseTo(35);
  });

  it('reproduces the worked example from the library: 40% at $300 / $100 is +$60', () => {
    const result = calculateExpectancy({winRatePct: 40, averageWin: 300, averageLoss: 100});
    expect(result.status === 'ok' && result.value.expectancy).toBeCloseTo(60);
    expect(result.status === 'ok' && result.value.projected).toBeNull();
  });

  it('detects negative and flat edges', () => {
    const negative = calculateExpectancy({winRatePct: 30, averageWin: 1, averageLoss: 1});
    expect(negative.status === 'ok' && negative.value.edge).toBe('negative');
    const flat = calculateExpectancy({winRatePct: 50, averageWin: 1, averageLoss: 1});
    expect(flat.status === 'ok' && flat.value.edge).toBe('flat');
  });

  it('has no profit factor when there are no losses', () => {
    const result = calculateExpectancy({winRatePct: 100, averageWin: 1, averageLoss: 1});
    expect(result.status === 'ok' && result.value.profitFactor).toBeNull();
  });

  it('validates', () => {
    expect(calculateExpectancy({winRatePct: null, averageWin: 2, averageLoss: 1}).status).toBe('incomplete');
    expect(calculateExpectancy({winRatePct: 120, averageWin: 2, averageLoss: 1})).toMatchObject({status: 'invalid'});
    expect(calculateExpectancy({winRatePct: 50, averageWin: 2, averageLoss: 0})).toMatchObject({status: 'invalid'});
    expect(calculateExpectancy({winRatePct: 50, averageWin: 2, averageLoss: -1})).toMatchObject({status: 'invalid'});
  });
});
