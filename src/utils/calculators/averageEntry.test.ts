import {describe, expect, it} from 'vitest';
import {averageEntry} from './averageEntry';

describe('averageEntry', () => {
  it('weights by quantity: 100 at 10 and 200 at 12 averages 11.33, not 11', () => {
    const result = averageEntry([{price: 10, quantity: 100}, {price: 12, quantity: 200}]);
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.value.totalQuantity).toBe(300);
    expect(result.value.totalCost).toBe(3400);
    expect(result.value.averagePrice).toBeCloseTo(11.3333, 4);
    expect(result.value.simpleAverage).toBe(11);
    expect(result.value.entries[1].sharePct).toBeCloseTo(66.667, 2);
    expect(result.value.lowestPrice).toBe(10);
    expect(result.value.highestPrice).toBe(12);
  });

  it('shows the open profit or loss, long and short', () => {
    const rows = [{price: 10, quantity: 100}, {price: 12, quantity: 200}];
    const long = averageEntry(rows, {currentPrice: 13});
    expect(long.status === 'ok' && long.value.open?.pnl).toBeCloseTo(500);
    expect(long.status === 'ok' && long.value.open?.pnlPct).toBeCloseTo(14.706, 2);
    const short = averageEntry(rows, {currentPrice: 13, direction: 'short'});
    expect(short.status === 'ok' && short.value.open?.pnl).toBeCloseTo(-500);
  });

  it('ignores empty rows, waits on half-filled ones, and rejects nonsense', () => {
    expect(averageEntry([{price: 10, quantity: 5}, {price: null, quantity: null}]).status).toBe('ok');
    expect(averageEntry([{price: null, quantity: null}]).status).toBe('incomplete');
    expect(averageEntry([{price: 10, quantity: null}]).status).toBe('incomplete');
    expect(averageEntry([{price: 10, quantity: Number.NaN}]).status).toBe('incomplete');
    expect(averageEntry([{price: 10, quantity: 0}])).toMatchObject({status: 'invalid'});
    expect(averageEntry([{price: -1, quantity: 5}])).toMatchObject({status: 'invalid'});
  });
});
