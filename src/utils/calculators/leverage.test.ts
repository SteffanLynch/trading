import {describe, expect, it} from 'vitest';
import {leverageComparison, leverageSandbox} from './leverage';

describe('leverageSandbox', () => {
  it('£1,000 at 10x falling 1% loses £100, which is 10% of the account', () => {
    const result = leverageSandbox({balance: 1000, leverage: 10, movePct: -1});
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.value.exposure).toBe(10_000);
    expect(result.value.pnl).toBeCloseTo(-100);
    expect(result.value.newBalance).toBeCloseTo(900);
    expect(result.value.accountImpactPct).toBeCloseTo(-10);
    expect(result.value.wipeOutMovePct).toBeCloseTo(10);
    expect(result.value.wipedOut).toBe(false);
  });

  it('2x turns the same move into a 2% loss', () => {
    const result = leverageSandbox({balance: 1000, leverage: 2, movePct: -1});
    expect(result.status === 'ok' && result.value.pnl).toBeCloseTo(-20);
    expect(result.status === 'ok' && result.value.accountImpactPct).toBeCloseTo(-2);
  });

  it('magnifies gains too, and flips for shorts', () => {
    const up = leverageSandbox({balance: 1000, leverage: 10, movePct: 1});
    expect(up.status === 'ok' && up.value.newBalance).toBeCloseTo(1100);
    const short = leverageSandbox({balance: 1000, leverage: 10, movePct: 1, direction: 'short'});
    expect(short.status === 'ok' && short.value.pnl).toBeCloseTo(-100);
  });

  it('wipes out the account when the loss reaches the balance', () => {
    const result = leverageSandbox({balance: 1000, leverage: 30, movePct: -5});
    expect(result.status === 'ok' && result.value.newBalance).toBe(0);
    expect(result.status === 'ok' && result.value.accountImpactPct).toBeCloseTo(-100);
    expect(result.status === 'ok' && result.value.wipedOut).toBe(true);
  });

  it('validates', () => {
    expect(leverageSandbox({balance: null, leverage: 10, movePct: 1}).status).toBe('incomplete');
    expect(leverageSandbox({balance: 0, leverage: 10, movePct: 1})).toMatchObject({status: 'invalid'});
    expect(leverageSandbox({balance: 100, leverage: 0.5, movePct: 1})).toMatchObject({status: 'invalid'});
  });
});

describe('leverageComparison', () => {
  it('shows the same move at every leverage', () => {
    const rows = leverageComparison(1000, -2);
    expect(rows.map((row) => row.leverage)).toEqual([1, 2, 5, 10, 20, 30]);
    expect(rows[0].accountImpactPct).toBeCloseTo(-2);
    expect(rows[3].accountImpactPct).toBeCloseTo(-20);
    expect(rows[4].accountImpactPct).toBeCloseTo(-40);
    expect(rows[5].accountImpactPct).toBeCloseTo(-60);
    expect(rows.every((row) => !row.wipedOut)).toBe(true);
    // A 5% fall wipes out a 20x account exactly
    expect(leverageComparison(1000, -5)[4].wipedOut).toBe(true);
  });
});
