import {describe, it, expect} from 'vitest';
import {calculatePositionSize} from './positionSize';

describe('calculatePositionSize', () => {
  it('calculates position size accurately for standard inputs', () => {
    const result = calculatePositionSize({
      accountBalance: 10000,
      riskPercentage: 1,
      entryPrice: 1.1,
      stopLossPrice: 1.095,
    });

    expect(result.isValid).toBe(true);
    expect(result.amountAtRisk).toBe(100.0);
    expect(result.riskPerUnit).toBe(0.005);
    expect(result.positionSizeUnits).toBe(20000.0);
  });

  it('handles null empty fields gracefully without calculating', () => {
    const result = calculatePositionSize({
      accountBalance: 10000,
      riskPercentage: null,
      entryPrice: 1.1,
      stopLossPrice: 1.095,
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBeUndefined();
  });

  it('does not report a validation error while any field is still empty', () => {
    // Balance is zero (would normally error), but another field is empty mid-edit.
    const result = calculatePositionSize({
      accountBalance: 0,
      riskPercentage: 1,
      entryPrice: null,
      stopLossPrice: 1.095,
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBeUndefined();
  });

  it('returns invalid status when entry equals stop loss', () => {
    const result = calculatePositionSize({
      accountBalance: 5000,
      riskPercentage: 2,
      entryPrice: 100,
      stopLossPrice: 100,
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBe('Entry price and stop loss price cannot be identical.');
  });

  it('rejects a zero or negative balance or risk percentage', () => {
    const base = {entryPrice: 100, stopLossPrice: 95};
    const message = 'Account balance and risk percentage must be greater than zero.';

    const zeroBalance = calculatePositionSize({...base, accountBalance: 0, riskPercentage: 1});
    const negativeRisk = calculatePositionSize({...base, accountBalance: 1000, riskPercentage: -1});

    expect(zeroBalance.isValid).toBe(false);
    expect(zeroBalance.errorMessage).toBe(message);
    expect(negativeRisk.isValid).toBe(false);
    expect(negativeRisk.errorMessage).toBe(message);
  });

  it('sizes short trades (stop above entry) the same as longs', () => {
    const result = calculatePositionSize({
      accountBalance: 10000,
      riskPercentage: 1,
      entryPrice: 1.095,
      stopLossPrice: 1.1,
    });

    expect(result.isValid).toBe(true);
    expect(result.positionSizeUnits).toBe(20000.0);
  });

  it('treats non-finite numbers as incomplete rather than valid', () => {
    const result = calculatePositionSize({
      accountBalance: Number.NaN,
      riskPercentage: 1,
      entryPrice: 100,
      stopLossPrice: 95,
    });

    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toBeUndefined();
  });
});
