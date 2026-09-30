import {describe, expect, it} from 'vitest';
import {advanceOrder, orderGuide, positionPips, validateOrder, type OrderSpec, type OrderState} from './orders';

const pending: OrderState = {status: 'pending'};
const run = (spec: OrderSpec, path: number[], jumps: boolean[] = []) => {
  let state: OrderState = pending;
  for (let i = 1; i < path.length; i += 1) state = advanceOrder(spec, state, path[i - 1], path[i], jumps[i - 1] ?? false);
  return state;
};

describe('validateOrder', () => {
  const current = 1.105;
  it('puts each order on the correct side of the price', () => {
    expect(validateOrder({kind: 'limit', side: 'buy', price: 1.1}, current).valid).toBe(true);
    expect(validateOrder({kind: 'limit', side: 'buy', price: 1.11}, current).valid).toBe(false);
    expect(validateOrder({kind: 'limit', side: 'sell', price: 1.11}, current).valid).toBe(true);
    expect(validateOrder({kind: 'limit', side: 'sell', price: 1.1}, current).valid).toBe(false);
    expect(validateOrder({kind: 'stop', side: 'buy', price: 1.11}, current).valid).toBe(true);
    expect(validateOrder({kind: 'stop', side: 'buy', price: 1.1}, current).valid).toBe(false);
    expect(validateOrder({kind: 'stop', side: 'sell', price: 1.1}, current).valid).toBe(true);
    expect(validateOrder({kind: 'stop', side: 'sell', price: 1.11}, current).valid).toBe(false);
  });

  it('suggests the right order when one is on the wrong side', () => {
    expect(validateOrder({kind: 'limit', side: 'buy', price: 1.11}, current).message).toContain('buy stop');
    expect(validateOrder({kind: 'stop', side: 'sell', price: 1.11}, current).message).toContain('sell limit');
  });

  it('checks both prices of a stop-limit', () => {
    expect(validateOrder({kind: 'stop-limit', side: 'buy', price: 1.11, limitPrice: 1.108}, current).valid).toBe(true);
    expect(validateOrder({kind: 'stop-limit', side: 'buy', price: 1.11, limitPrice: 1.112}, current).valid).toBe(false);
    expect(validateOrder({kind: 'stop-limit', side: 'sell', price: 1.1, limitPrice: 1.102}, current).valid).toBe(true);
    expect(validateOrder({kind: 'stop-limit', side: 'sell', price: 1.1, limitPrice: 1.098}, current).valid).toBe(false);
    expect(validateOrder({kind: 'stop-limit', side: 'buy', price: 1.11, limitPrice: null}, current).valid).toBe(false);
    expect(validateOrder({kind: 'market', side: 'buy', price: null}, current).valid).toBe(true);
    expect(validateOrder({kind: 'limit', side: 'buy', price: null}, current).valid).toBe(false);
  });
});

describe('advanceOrder', () => {
  it('a buy limit waits, then fills when price falls to it', () => {
    const spec: OrderSpec = {kind: 'limit', side: 'buy', price: 1.1};
    expect(run(spec, [1.105, 1.103, 1.101])).toEqual({status: 'pending'});
    expect(run(spec, [1.105, 1.103, 1.101, 1.1])).toEqual({status: 'filled', price: 1.1, slippage: 0});
  });

  it('a limit order fills at its price or better when price gaps through it', () => {
    const buy = run({kind: 'limit', side: 'buy', price: 1.1}, [1.105, 1.098], [true]);
    expect(buy).toEqual({status: 'filled', price: 1.098, slippage: 0});
    const sell = run({kind: 'limit', side: 'sell', price: 1.11}, [1.105, 1.114], [true]);
    expect(sell).toEqual({status: 'filled', price: 1.114, slippage: 0});
  });

  it('a stop order fills at its price in a drift and at a worse price in a fast move', () => {
    const buyStop: OrderSpec = {kind: 'stop', side: 'buy', price: 1.11};
    expect(run(buyStop, [1.105, 1.1095, 1.1105])).toEqual({status: 'filled', price: 1.11, slippage: 0});
    const slipped = run(buyStop, [1.105, 1.113], [true]);
    expect(slipped.status).toBe('filled');
    expect(slipped.status === 'filled' && slipped.price).toBeCloseTo(1.113);
    expect(slipped.status === 'filled' && slipped.slippage).toBeCloseTo(0.003);
    const sellStop = run({kind: 'stop', side: 'sell', price: 1.1}, [1.105, 1.0985], [true]);
    expect(sellStop.status === 'filled' && sellStop.slippage).toBeCloseTo(0.0015);
  });

  it('a buy stop-limit triggers on the way up, then fills only if price comes back to the limit', () => {
    const spec: OrderSpec = {kind: 'stop-limit', side: 'buy', price: 1.11, limitPrice: 1.108};
    expect(run(spec, [1.105, 1.109])).toEqual({status: 'pending'});
    expect(run(spec, [1.105, 1.111])).toEqual({status: 'triggered'});
    expect(run(spec, [1.105, 1.111, 1.115])).toEqual({status: 'triggered'});
    expect(run(spec, [1.105, 1.111, 1.115, 1.109, 1.107])).toEqual({status: 'filled', price: 1.108, slippage: 0});
  });

  it('a sell stop-limit mirrors it', () => {
    const spec: OrderSpec = {kind: 'stop-limit', side: 'sell', price: 1.1, limitPrice: 1.102};
    expect(run(spec, [1.105, 1.099])).toEqual({status: 'triggered'});
    expect(run(spec, [1.105, 1.099, 1.095, 1.101, 1.103])).toEqual({status: 'filled', price: 1.102, slippage: 0});
  });

  it('never changes a market order or a filled order', () => {
    const market: OrderSpec = {kind: 'market', side: 'buy', price: null};
    expect(advanceOrder(market, pending, 1.1, 1.2)).toEqual(pending);
    const filled: OrderState = {status: 'filled', price: 1.1, slippage: 0};
    expect(advanceOrder({kind: 'limit', side: 'buy', price: 1.09}, filled, 1.1, 1.08)).toBe(filled);
  });
});

describe('helpers', () => {
  it('measures open profit in pips', () => {
    expect(positionPips('buy', 1.1, 1.103, 0.0001)).toBeCloseTo(30);
    expect(positionPips('sell', 1.1, 1.103, 0.0001)).toBeCloseTo(-30);
  });

  it('describes every order type', () => {
    for (const kind of ['limit', 'stop', 'stop-limit'] as const) for (const side of ['buy', 'sell'] as const) expect(orderGuide(kind, side).summary.length).toBeGreaterThan(10);
    expect(orderGuide('market', 'buy').title).toBe('Market buy');
  });
});
