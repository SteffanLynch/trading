import {describe, expect, it} from 'vitest';
import {strategyStats} from './strategyStats';

describe('strategyStats', () => {
  it('45 winners at 200 and 55 losers at 100 is +35 per trade', () => {
    const result = strategyStats({winners: 45, losers: 55, averageWin: 200, averageLoss: 100});
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    const v = result.value;
    expect(v.trades).toBe(100);
    expect(v.winRate).toBeCloseTo(45);
    expect(v.lossRate).toBeCloseTo(55);
    expect(v.payoffRatio).toBeCloseTo(2);
    expect(v.expectancy).toBeCloseTo(35);
    expect(v.expectancyR).toBeCloseTo(0.35);
    expect(v.grossProfit).toBe(9000);
    expect(v.grossLoss).toBe(5500);
    expect(v.netProfit).toBe(3500);
    expect(v.profitFactor).toBeCloseTo(1.636, 3);
    expect(v.breakEvenWinRate).toBeCloseTo(33.333, 2);
    expect(v.marginOverBreakEven).toBeCloseTo(11.667, 2);
    expect(v.edge).toBe('positive');
  });

  it('a 40% win rate can still be profitable when winners are big enough', () => {
    const result = strategyStats({winners: 40, losers: 60, averageWin: 300, averageLoss: 100});
    expect(result.status === 'ok' && result.value.expectancy).toBeCloseTo(60);
    expect(result.status === 'ok' && result.value.edge).toBe('positive');
  });

  it('counts break-even trades in the sample', () => {
    const result = strategyStats({winners: 40, losers: 50, breakEven: 10, averageWin: 2, averageLoss: 1});
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.value.trades).toBe(100);
    expect(result.value.winRate).toBeCloseTo(40);
    expect(result.value.expectancy).toBeCloseTo(0.3);
  });

  it('handles no losses, and detects losing systems', () => {
    const none = strategyStats({winners: 5, losers: 0, averageWin: 100, averageLoss: 0});
    expect(none.status === 'ok' && none.value.profitFactor).toBeNull();
    const losing = strategyStats({winners: 30, losers: 70, averageWin: 100, averageLoss: 100});
    expect(losing.status === 'ok' && losing.value.edge).toBe('negative');
  });

  it('validates', () => {
    expect(strategyStats({winners: null, losers: 5, averageWin: 1, averageLoss: 1}).status).toBe('incomplete');
    expect(strategyStats({winners: 1.5, losers: 5, averageWin: 1, averageLoss: 1})).toMatchObject({status: 'invalid'});
    expect(strategyStats({winners: 0, losers: 0, averageWin: 1, averageLoss: 1})).toMatchObject({status: 'invalid'});
    expect(strategyStats({winners: 5, losers: 5, averageWin: -1, averageLoss: 1})).toMatchObject({status: 'invalid'});
  });
});
