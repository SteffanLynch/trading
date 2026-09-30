import {describe, expect, it} from 'vitest';
import {getInstrument} from './instruments';
import {visualiseTrade, type TradeDiagramInputs} from './tradeDiagram';

const base: TradeDiagramInputs = {
  instrument: getInstrument('EURUSD'),
  accountCurrency: 'USD',
  direction: 'long',
  entry: 1.1,
  stop: 1.095,
  target: 1.11,
  units: 20_000,
};

describe('visualiseTrade', () => {
  it('a 50-pip stop and 100-pip target on 0.2 lots is $100 risk for $200 reward (1:2)', () => {
    const result = visualiseTrade(base);
    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.value.riskPips).toBeCloseTo(50);
    expect(result.value.rewardPips).toBeCloseTo(100);
    expect(result.value.risk).toBeCloseTo(100);
    expect(result.value.reward).toBeCloseTo(200);
    expect(result.value.ratio).toBeCloseTo(2);
    expect(result.value.breakEvenWinRate).toBeCloseTo(33.333, 2);
  });

  it('works for shorts and rejects lines on the wrong side', () => {
    const short = visualiseTrade({...base, direction: 'short', stop: 1.105, target: 1.09});
    expect(short.status === 'ok' && short.value.ratio).toBeCloseTo(2);
    expect(visualiseTrade({...base, stop: 1.105})).toMatchObject({status: 'invalid'});
    expect(visualiseTrade({...base, target: 1.09})).toMatchObject({status: 'invalid'});
  });

  it('converts through a supplied rate and stays quiet while empty', () => {
    expect(visualiseTrade({...base, accountCurrency: 'GBP'})).toEqual({status: 'needs-rate', from: 'USD', to: 'GBP'});
    const gbp = visualiseTrade({...base, accountCurrency: 'GBP', manualRate: 0.75});
    expect(gbp.status === 'ok' && gbp.value.risk).toBeCloseTo(75);
    expect(visualiseTrade({...base, entry: null}).status).toBe('incomplete');
  });
});
