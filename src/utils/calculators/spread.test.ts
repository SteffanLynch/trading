import {describe, expect, it} from 'vitest';
import {getForexInstrument} from './instruments';
import {spreadCost, type SpreadInputs} from './spread';

const base: SpreadInputs = {instrument: getForexInstrument('EURUSD'), accountCurrency: 'USD', bid: 1.1, spreadPips: 2, lots: 1};

describe('spreadCost', () => {
  it('a 2-pip spread on one standard lot costs about $20', () => {
    const result = spreadCost(base);
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.value.ask).toBeCloseTo(1.1002, 6);
    expect(result.value.spreadCost).toBeCloseTo(20);
    expect(result.value.perPip).toBeCloseTo(10);
    expect(result.value.breakEvenPips).toBeCloseTo(2);
  });

  it('narrowing to 0.5 pips costs $5', () => {
    const result = spreadCost({...base, spreadPips: 0.5});
    expect(result.status === 'ok' && result.value.spreadCost).toBeCloseTo(5);
  });

  it('adds commission and shows the share of a planned distance', () => {
    const result = spreadCost({...base, commission: 7, distancePips: 10});
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.value.totalCost).toBeCloseTo(27);
    expect(result.value.breakEvenPips).toBeCloseTo(2.7);
    expect(result.value.shareOfDistancePct).toBeCloseTo(20);
  });

  it('scales with size, asks for a rate on a cross, and validates', () => {
    const small = spreadCost({...base, lots: 0.1});
    expect(small.status === 'ok' && small.value.spreadCost).toBeCloseTo(2);
    expect(spreadCost({...base, accountCurrency: 'GBP'})).toEqual({status: 'needs-rate', from: 'USD', to: 'GBP'});
    expect(spreadCost({...base, spreadPips: -1})).toMatchObject({status: 'invalid'});
    expect(spreadCost({...base, lots: null}).status).toBe('incomplete');
  });
});
