import {describe, expect, it} from 'vitest';
import {drawdownRecovery, recoveryCurve, recoveryRequired} from './drawdown';

describe('recoveryRequired', () => {
  it('matches the well-known table', () => {
    expect(recoveryRequired(10)).toBeCloseTo(11.111, 2);
    expect(recoveryRequired(20)).toBeCloseTo(25);
    expect(recoveryRequired(30)).toBeCloseTo(42.857, 2);
    expect(recoveryRequired(50)).toBeCloseTo(100);
    expect(recoveryRequired(90)).toBeCloseTo(900);
  });
});

describe('drawdownRecovery', () => {
  it('returns the recovery gain and, with a balance, the money involved', () => {
    const result = drawdownRecovery(20, 10_000);
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.value.recoveryPct).toBeCloseTo(25);
    expect(result.value.balanceAfter).toBeCloseTo(8000);
    expect(result.value.moneyToRecover).toBeCloseTo(2000);
    expect(result.value.recoveryMultiple).toBeCloseTo(1.25);
  });

  it('works without a balance', () => {
    const result = drawdownRecovery(50);
    expect(result.status === 'ok' && result.value.balanceAfter).toBeNull();
  });

  it('validates', () => {
    expect(drawdownRecovery(null).status).toBe('incomplete');
    expect(drawdownRecovery(0)).toMatchObject({status: 'invalid'});
    expect(drawdownRecovery(100)).toMatchObject({status: 'invalid'});
    expect(drawdownRecovery(-5)).toMatchObject({status: 'invalid'});
  });
});

describe('recoveryCurve', () => {
  it('starts at zero and climbs steeply', () => {
    const points = recoveryCurve(90, 10);
    expect(points[0]).toEqual([0, 0]);
    expect(points).toHaveLength(10);
    expect(points[9][1]).toBeCloseTo(900);
  });
});
