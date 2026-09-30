import {describe, expect, it} from 'vitest';
import {getInstrument} from './instruments';
import {calculatePnL, type PnLInputs} from './pnl';

const base: PnLInputs = {
  instrument: getInstrument('EURUSD'),
  accountCurrency: 'USD',
  direction: 'long',
  entry: 1.165,
  exit: 1.175,
  units: 100_000,
};

function value(inputs: PnLInputs) {
  const result = calculatePnL(inputs);
  expect(result.status).toBe('ok');
  return (result as {value: NonNullable<ReturnType<typeof calculatePnL> extends infer R ? R extends {value: infer V} ? V : never : never>}).value;
}

describe('calculatePnL', () => {
  it('long winner: 100 pips on one lot is $1,000', () => {
    const v = value(base);
    expect(v.gross).toBeCloseTo(1000);
    expect(v.net).toBeCloseTo(1000);
    expect(v.outcome).toBe('profit');
    expect(v.moveInUnits).toBeCloseTo(100);
  });

  it('short winner and long loser', () => {
    expect(value({...base, direction: 'short', entry: 1.175, exit: 1.165}).gross).toBeCloseTo(1000);
    expect(value({...base, exit: 1.16}).gross).toBeCloseTo(-500);
    expect(value({...base, exit: 1.16}).outcome).toBe('loss');
  });

  it('subtracts costs and reports a return on the account', () => {
    const v = value({...base, costs: 12.5, balance: 10_000});
    expect(v.net).toBeCloseTo(987.5);
    expect(v.returnPct).toBeCloseTo(9.875);
  });

  it('a costs-only result can turn a tiny win into a loss', () => {
    const v = value({...base, exit: 1.1651, costs: 10});
    expect(v.gross).toBeCloseTo(10);
    expect(v.net).toBeCloseTo(0);
    expect(v.outcome).toBe('flat');
  });

  it('works for shares with a multiplier', () => {
    const v = value({
      instrument: getInstrument('OTHER'),
      accountCurrency: 'USD',
      direction: 'long',
      entry: 100,
      exit: 112.6,
      units: 10,
      contractSize: 1,
    });
    expect(v.gross).toBeCloseTo(126);
    expect(v.movePct).toBeCloseTo(12.6);
  });

  it('converts through the exit price for a base-currency account (USD/JPY on USD)', () => {
    const v = value({...base, instrument: getInstrument('USDJPY'), entry: 150, exit: 151, units: 100_000});
    // +1 JPY * 100,000 = 100,000 JPY, at 151 JPY/USD = $662.25
    expect(v.gross).toBeCloseTo(662.25, 2);
  });

  it('asks for a rate on a cross and stays quiet on empty fields', () => {
    expect(calculatePnL({...base, accountCurrency: 'GBP'})).toEqual({status: 'needs-rate', from: 'USD', to: 'GBP'});
    expect(calculatePnL({...base, exit: null}).status).toBe('incomplete');
    expect(calculatePnL({...base, units: 0})).toMatchObject({status: 'invalid'});
  });
});
