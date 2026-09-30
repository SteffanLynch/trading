import {describe, expect, it} from 'vitest';
import {partialProfit, rMultipleAt} from './partialProfit';

describe('partialProfit', () => {
  it('50% at 1R, 25% at 2R and 25% at 4R is +2R', () => {
    const result = partialProfit({stages: [{closePct: 50, r: 1}, {closePct: 25, r: 2}, {closePct: 25, r: 4}], oneRMoney: 100});
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.value.totalR).toBeCloseTo(2);
    expect(result.value.totalMoney).toBeCloseTo(200);
    expect(result.value.allocatedPct).toBe(100);
    expect(result.value.remainingPct).toBe(0);
    expect(result.value.stages.map((stage) => stage.contribution)).toEqual([0.5, 0.5, 1]);
    expect(result.value.allAtFirstTargetR).toBe(1);
  });

  it('accounts for the part of the position that is left over', () => {
    const stages = [{closePct: 50, r: 1}];
    const breakEven = partialProfit({stages});
    expect(breakEven.status === 'ok' && breakEven.value.totalR).toBeCloseTo(0.5);
    const stopped = partialProfit({stages, remainderR: -1});
    expect(stopped.status === 'ok' && stopped.value.totalR).toBeCloseTo(0);
    expect(stopped.status === 'ok' && stopped.value.remainingPct).toBe(50);
  });

  it('validates the stages', () => {
    expect(partialProfit({stages: [{closePct: null, r: null}]}).status).toBe('incomplete');
    expect(partialProfit({stages: [{closePct: 50, r: null}]}).status).toBe('incomplete');
    expect(partialProfit({stages: [{closePct: 60, r: 1}, {closePct: 60, r: 2}]})).toMatchObject({status: 'invalid'});
    expect(partialProfit({stages: [{closePct: 0, r: 1}]})).toMatchObject({status: 'invalid'});
  });
});

describe('rMultipleAt', () => {
  it('converts prices to R for longs and shorts', () => {
    expect(rMultipleAt(100, 95, 110)).toBeCloseTo(2);
    expect(rMultipleAt(100, 95, 95)).toBeCloseTo(-1);
    expect(rMultipleAt(100, 105, 90)).toBeCloseTo(2);
    expect(rMultipleAt(100, 100, 110)).toBeNull();
  });
});
