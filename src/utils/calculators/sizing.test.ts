import {describe, expect, it} from 'vitest';
import {getInstrument} from './instruments';
import {planTrade, sizePosition, type SizingContext} from './sizing';

const eurusd = getInstrument('EURUSD');
const usdjpy = getInstrument('USDJPY');
const eurjpy = getInstrument('EURJPY');
const other = getInstrument('OTHER');

const usdContext: SizingContext = {instrument: eurusd, accountCurrency: 'USD', balance: 10_000, riskPct: 1};

function okValue<T>(result: {status: string; value?: T}): T {
  expect(result.status).toBe('ok');
  return (result as {value: T}).value;
}

describe('sizePosition', () => {
  it('sizes EUR/USD on a USD account: $100 risk over 50 pips is 0.2 lots', () => {
    const v = okValue(sizePosition(usdContext, {mode: 'prices', entry: 1.165, stop: 1.16}));
    expect(v.targetRisk).toBeCloseTo(100);
    expect(v.stopDistanceInUnits).toBeCloseTo(50);
    expect(v.unitsExact).toBeCloseTo(20_000);
    expect(v.lots).toBeCloseTo(0.2);
    expect(v.units).toBe(20_000);
    expect(v.actualRisk).toBeCloseTo(100);
    expect(v.valuePerPip).toBeCloseTo(2);
    expect(v.wasRounded).toBe(false);
  });

  it('gives the same answer in pips mode', () => {
    const v = okValue(sizePosition(usdContext, {mode: 'distance', distance: 50, referencePrice: 1.165}));
    expect(v.units).toBe(20_000);
  });

  it('is symmetrical for shorts (stop above entry)', () => {
    const v = okValue(sizePosition(usdContext, {mode: 'prices', entry: 1.16, stop: 1.165}));
    expect(v.units).toBe(20_000);
  });

  it('rounds down to the lot step so risk never exceeds the target', () => {
    // 53 pips: exact 0.18867 lots -> 0.18 lots
    const v = okValue(sizePosition(usdContext, {mode: 'distance', distance: 53, referencePrice: 1.165}));
    expect(v.lotsExact).toBeCloseTo(0.188679, 5);
    expect(v.lots).toBeCloseTo(0.18);
    expect(v.units).toBe(18_000);
    expect(v.wasRounded).toBe(true);
    expect(v.actualRisk).toBeCloseTo(95.4);
    expect(v.actualRisk).toBeLessThanOrEqual(v.targetRisk);
  });

  it('does not lose a lot to floating point (0.29 lots stays 0.29)', () => {
    // Choose inputs where exact lots is 0.29: risk 145 over 50 pips on a $14,500 account at 1%.
    const v = okValue(
      sizePosition({...usdContext, balance: 14_500}, {mode: 'distance', distance: 50, referencePrice: 1.165}),
    );
    expect(v.lots).toBeCloseTo(0.29);
  });

  it('flags a stop too wide for the minimum lot size', () => {
    const v = okValue(
      sizePosition({...usdContext, balance: 100, riskPct: 0.1}, {mode: 'distance', distance: 50, referencePrice: 1.165}),
    );
    expect(v.belowMinimum).toBe(true);
    expect(v.lots).toBe(0);
    expect(v.minimumStepRisk).toBeCloseTo(5); // 0.01 lot * $10/pip-per-lot * 50 pips
  });

  it('asks for an exchange rate on a cross (GBP account, EUR/USD)', () => {
    const context: SizingContext = {...usdContext, accountCurrency: 'GBP'};
    const result = sizePosition(context, {mode: 'prices', entry: 1.165, stop: 1.16});
    expect(result).toEqual({status: 'needs-rate', from: 'USD', to: 'GBP'});
  });

  it('converts through a supplied rate (1 USD = 0.75 GBP)', () => {
    const context: SizingContext = {...usdContext, accountCurrency: 'GBP', manualRate: 0.75};
    const v = okValue(sizePosition(context, {mode: 'prices', entry: 1.165, stop: 1.16}));
    // loss per unit = 0.005 USD * 0.75 = 0.00375 GBP; £100 / 0.00375 = 26,666.67 units -> 0.26 lots
    expect(v.unitsExact).toBeCloseTo(26_666.67, 1);
    expect(v.lots).toBeCloseTo(0.26);
    expect(v.actualRisk).toBeCloseTo(97.5);
  });

  it('uses the pair price as the rate when the base currency is the account currency (USD/JPY on USD)', () => {
    const context: SizingContext = {...usdContext, instrument: usdjpy};
    const v = okValue(sizePosition(context, {mode: 'prices', entry: 150, stop: 149.5}));
    // 0.5 JPY per unit = 0.5 / 150 USD; $100 / 0.003333 = 30,000 units
    expect(v.unitsExact).toBeCloseTo(30_000, 3);
    expect(v.lots).toBeCloseTo(0.3);
    expect(v.rateSource).toBe('inverse-price');
  });

  it('needs a price in pips mode when the base currency is the account currency', () => {
    const context: SizingContext = {...usdContext, instrument: usdjpy};
    expect(sizePosition(context, {mode: 'distance', distance: 50, referencePrice: null}).status).toBe('incomplete');
  });

  it('needs no rate when the quote currency is the account currency (EUR/JPY on a JPY account)', () => {
    const context: SizingContext = {instrument: eurjpy, accountCurrency: 'JPY', balance: 1_000_000, riskPct: 1};
    const v = okValue(sizePosition(context, {mode: 'prices', entry: 175, stop: 174.5}));
    expect(v.units).toBe(20_000); // 10,000 JPY / 0.5 JPY
  });

  it('sizes shares in whole units when the step is 1', () => {
    const context: SizingContext = {instrument: other, accountCurrency: 'USD', balance: 10_000, riskPct: 1, lotStep: 1};
    const v = okValue(sizePosition(context, {mode: 'prices', entry: 100, stop: 97}));
    // $100 / $3 = 33.33 shares -> 33
    expect(v.units).toBe(33);
    expect(v.lots).toBeNull();
    expect(v.actualRisk).toBeCloseTo(99);
  });

  it('applies a contract multiplier for futures-style contracts', () => {
    const context: SizingContext = {
      instrument: other,
      accountCurrency: 'USD',
      balance: 100_000,
      riskPct: 1,
      contractSize: 50,
      lotStep: 1,
    };
    const v = okValue(sizePosition(context, {mode: 'prices', entry: 5000, stop: 4990}));
    // $1,000 risk / (10 points * $50) = 2 contracts
    expect(v.units).toBe(2);
    expect(v.actualRisk).toBeCloseTo(1000);
  });

  it('respects a custom contract size for lots', () => {
    const v = okValue(
      sizePosition({...usdContext, contractSize: 1000}, {mode: 'prices', entry: 1.165, stop: 1.16}),
    );
    expect(v.lots).toBeCloseTo(20); // 20,000 units / 1,000 per lot
  });

  it('stays quiet while any field is empty', () => {
    expect(sizePosition({...usdContext, riskPct: null}, {mode: 'prices', entry: 1.165, stop: 1.16}).status).toBe('incomplete');
    expect(sizePosition({...usdContext, balance: Number.NaN}, {mode: 'prices', entry: 1.165, stop: 1.16}).status).toBe('incomplete');
    expect(sizePosition(usdContext, {mode: 'prices', entry: null, stop: 1.16}).status).toBe('incomplete');
    // An error-worthy balance does not surface while another field is still empty
    expect(sizePosition({...usdContext, balance: 0}, {mode: 'prices', entry: null, stop: 1.16}).status).toBe('incomplete');
  });

  it('rejects impossible inputs with a message', () => {
    expect(sizePosition({...usdContext, balance: 0}, {mode: 'prices', entry: 1.165, stop: 1.16})).toMatchObject({status: 'invalid'});
    expect(sizePosition({...usdContext, riskPct: 150}, {mode: 'prices', entry: 1.165, stop: 1.16})).toMatchObject({
      status: 'invalid',
      message: 'Risk cannot be more than 100% of your account.',
    });
    expect(sizePosition(usdContext, {mode: 'prices', entry: 1.165, stop: 1.165})).toMatchObject({
      status: 'invalid',
      message: 'Entry price and stop loss price cannot be identical.',
    });
    expect(sizePosition(usdContext, {mode: 'distance', distance: 0, referencePrice: 1})).toMatchObject({status: 'invalid'});
  });
});

describe('planTrade', () => {
  const base = {...usdContext, direction: 'long' as const, entry: 1.165, stop: 1.16, target: 1.175};

  it('plans a long trade end to end', () => {
    const result = planTrade(base);
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    const {sizing, target} = result.value;
    expect(sizing.units).toBe(20_000);
    expect(target).not.toBeNull();
    expect(target!.distanceInUnits).toBeCloseTo(100);
    expect(target!.profit).toBeCloseTo(200);
    expect(target!.gainPct).toBeCloseTo(2);
    expect(target!.ratio).toBeCloseTo(2);
    expect(target!.breakEvenWinRate).toBeCloseTo(33.333, 2);
    expect(sizing.actualRiskPct).toBeCloseTo(1);
  });

  it('plans a short trade', () => {
    const result = planTrade({...base, direction: 'short', entry: 1.165, stop: 1.17, target: 1.155});
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.value.sizing.units).toBe(20_000);
    expect(result.value.target!.profit).toBeCloseTo(200);
  });

  it('works without a target', () => {
    const result = planTrade({...base, target: null});
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.value.target).toBeNull();
    expect(result.value.targetIssue).toBeNull();
  });

  it('rejects a stop on the wrong side of entry', () => {
    expect(planTrade({...base, stop: 1.17})).toMatchObject({
      status: 'invalid',
      message: 'For a long trade your stop loss must be below your entry price.',
    });
    expect(planTrade({...base, direction: 'short'})).toMatchObject({
      status: 'invalid',
      message: 'For a short trade your stop loss must be above your entry price.',
    });
  });

  it('keeps the sizing but reports a target on the wrong side', () => {
    const result = planTrade({...base, target: 1.15});
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.value.target).toBeNull();
    expect(result.value.targetIssue).toBe('For a long trade your target must be above your entry price.');
    expect(result.value.sizing.units).toBe(20_000);
  });

  it('shows account impact at the rounded size', () => {
    const result = planTrade({...base, stop: 1.1597, target: 1.1747});
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    const {sizing, target} = result.value;
    // 53 pips risk, 97 pips reward; 0.18 lots -> $95.40 risk, $174.60 reward
    expect(sizing.actualRisk).toBeCloseTo(95.4);
    expect(target!.profit).toBeCloseTo(174.6);
  });
});
