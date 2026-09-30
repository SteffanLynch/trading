import {describe, expect, it} from 'vitest';
import {calculateMargin} from './margin';

describe('calculateMargin', () => {
  it('£100,000 at 20:1 needs £5,000 of margin', () => {
    const result = calculateMargin({positionValue: 100_000, leverage: 20});
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.value.marginRequired).toBeCloseTo(5000);
    expect(result.value.marginPct).toBeCloseTo(5);
    expect(result.value.effectiveLeverage).toBeNull();
  });

  it('works out effective leverage, free margin and the maximum position from equity', () => {
    const result = calculateMargin({positionValue: 50_000, leverage: 30, equity: 10_000});
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.value.effectiveLeverage).toBeCloseTo(5);
    expect(result.value.marginRequired).toBeCloseTo(1666.67, 1);
    expect(result.value.freeMargin).toBeCloseTo(8333.33, 1);
    expect(result.value.maxPositionValue).toBeCloseTo(300_000);
    expect(result.value.exceedsEquity).toBe(false);
  });

  it('flags a position that needs more margin than the account holds', () => {
    const result = calculateMargin({positionValue: 100_000, leverage: 10, equity: 5000});
    expect(result.status === 'ok' && result.value.exceedsEquity).toBe(true);
  });

  it('shows how market moves hit the account', () => {
    const result = calculateMargin({positionValue: 100_000, leverage: 10, equity: 10_000});
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    const oneP = result.value.impacts.find((impact) => impact.movePct === 1)!;
    expect(oneP.loss).toBeCloseTo(1000);
    expect(oneP.pctOfMargin).toBeCloseTo(10); // 1% move x 10x leverage
    expect(oneP.pctOfEquity).toBeCloseTo(10);
  });

  it('validates', () => {
    expect(calculateMargin({positionValue: null, leverage: 20}).status).toBe('incomplete');
    expect(calculateMargin({positionValue: 1000, leverage: 0.5})).toMatchObject({status: 'invalid'});
    expect(calculateMargin({positionValue: 0, leverage: 20})).toMatchObject({status: 'invalid'});
    expect(calculateMargin({positionValue: 1000, leverage: 20, equity: -1})).toMatchObject({status: 'invalid'});
  });
});
