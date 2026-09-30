import {describe, expect, it} from 'vitest';
import {getForexInstrument} from './instruments';
import {calculatePipValue, moneyToPips, pipDistance, pipsToMoney} from './pips';

describe('calculatePipValue', () => {
  it('EUR/USD on a USD account: 100,000 units is $10 per pip', () => {
    const result = calculatePipValue({instrument: getForexInstrument('EURUSD'), accountCurrency: 'USD', units: 100_000});
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.value.perPip).toBeCloseTo(10);
    expect(result.value.perStandardLot).toBeCloseTo(10);
    expect(result.value.perMiniLot).toBeCloseTo(1);
    expect(result.value.perMicroLot).toBeCloseTo(0.1);
    expect(result.value.per10Pips).toBeCloseTo(100);
  });

  it('scales with position size', () => {
    const result = calculatePipValue({instrument: getForexInstrument('EURUSD'), accountCurrency: 'USD', units: 25_000});
    expect(result.status === 'ok' && result.value.perPip).toBeCloseTo(2.5);
  });

  it('USD/JPY on a USD account divides by the price', () => {
    const result = calculatePipValue({instrument: getForexInstrument('USDJPY'), accountCurrency: 'USD', units: 100_000, price: 150});
    // 100,000 * 0.01 JPY = 1,000 JPY per pip = 1,000 / 150 USD
    expect(result.status === 'ok' && result.value.perPip).toBeCloseTo(6.6667, 3);
  });

  it('USD/JPY on a JPY account is simply 1,000 yen', () => {
    const result = calculatePipValue({instrument: getForexInstrument('USDJPY'), accountCurrency: 'JPY', units: 100_000});
    expect(result.status === 'ok' && result.value.perPip).toBeCloseTo(1000);
  });

  it('needs a rate for a cross, then converts with it', () => {
    const instrument = getForexInstrument('EURUSD');
    expect(calculatePipValue({instrument, accountCurrency: 'GBP', units: 100_000})).toEqual({status: 'needs-rate', from: 'USD', to: 'GBP'});
    const converted = calculatePipValue({instrument, accountCurrency: 'GBP', units: 100_000, manualRate: 0.75});
    expect(converted.status === 'ok' && converted.value.perPip).toBeCloseTo(7.5);
  });

  it('validates size', () => {
    const instrument = getForexInstrument('EURUSD');
    expect(calculatePipValue({instrument, accountCurrency: 'USD', units: null}).status).toBe('incomplete');
    expect(calculatePipValue({instrument, accountCurrency: 'USD', units: 0})).toMatchObject({status: 'invalid'});
  });
});

describe('pips and money', () => {
  it('converts both ways', () => {
    expect(pipsToMoney(25, 8)).toBe(200);
    expect(moneyToPips(200, 8)).toBe(25);
  });

  it('measures distance in pips (27.5 pips between 1.16547 and 1.16822)', () => {
    expect(pipDistance(1.16547, 1.16822, 0.0001)).toBeCloseTo(27.5, 6);
    expect(pipDistance(150.5, 150.0, 0.01)).toBeCloseTo(50);
  });
});
