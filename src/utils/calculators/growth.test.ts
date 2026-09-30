import {describe, expect, it} from 'vitest';
import {compoundGrowth, MAX_PERIODS} from './growth';

describe('compoundGrowth', () => {
  it('£10,000 at 5% for 10 periods is £16,288.95', () => {
    const result = compoundGrowth({startingBalance: 10_000, ratePct: 5, periods: 10});
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.value.finalBalance).toBeCloseTo(16_288.95, 2);
    expect(result.value.balances).toHaveLength(11);
    expect(result.value.balances[0]).toBe(10_000);
    expect(result.value.multiple).toBeCloseTo(1.628895, 5);
    // Simple growth for comparison: 10,000 * (1 + 0.05 * 10) = 15,000
    expect(result.value.simpleBalances[10]).toBeCloseTo(15_000);
    expect(result.value.periodsToDouble).toBeCloseTo(14.2067, 3);
  });

  it('adds contributions at the end of each period', () => {
    const result = compoundGrowth({startingBalance: 1000, ratePct: 10, periods: 2, contribution: 100});
    // year 1: 1000*1.1+100 = 1200; year 2: 1200*1.1+100 = 1420
    expect(result.status === 'ok' && result.value.finalBalance).toBeCloseTo(1420);
    expect(result.status === 'ok' && result.value.totalContributed).toBe(1200);
    expect(result.status === 'ok' && result.value.totalGain).toBeCloseTo(220);
  });

  it('handles negative returns', () => {
    const result = compoundGrowth({startingBalance: 10_000, ratePct: -10, periods: 2});
    expect(result.status === 'ok' && result.value.finalBalance).toBeCloseTo(8100);
    expect(result.status === 'ok' && result.value.periodsToDouble).toBeNull();
  });

  it('validates', () => {
    expect(compoundGrowth({startingBalance: 10_000, ratePct: null, periods: 10}).status).toBe('incomplete');
    expect(compoundGrowth({startingBalance: 0, ratePct: 5, periods: 10})).toMatchObject({status: 'invalid'});
    expect(compoundGrowth({startingBalance: 1, ratePct: -100, periods: 10})).toMatchObject({status: 'invalid'});
    expect(compoundGrowth({startingBalance: 1, ratePct: 5, periods: 2.5})).toMatchObject({status: 'invalid'});
    expect(compoundGrowth({startingBalance: 1, ratePct: 5, periods: MAX_PERIODS + 1})).toMatchObject({status: 'invalid'});
  });

  it('refuses results that overflow', () => {
    const result = compoundGrowth({startingBalance: 1e300, ratePct: 1000, periods: 600});
    expect(result).toMatchObject({status: 'invalid'});
  });
});
