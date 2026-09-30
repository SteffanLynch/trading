import {describe, expect, it} from 'vitest';
import {initialSim, simReducer, type SimAction, type SimState} from './orderSim';

const run = (state: SimState, ...actions: SimAction[]) => actions.reduce(simReducer, state);
const drift = (from: number, to: number, step = 0.0001): SimAction[] => {
  const actions: SimAction[] = [];
  const direction = to > from ? 1 : -1;
  for (let price = from + direction * step; direction > 0 ? price <= to + 1e-9 : price >= to - 1e-9; price += direction * step) actions.push({type: 'tick', to: Number(price.toFixed(6)), jump: false});
  return actions;
};

describe('order simulator', () => {
  const start = initialSim();

  it('starts at 1.1050 with one line of guidance', () => {
    expect(start.price).toBe(1.105);
    expect(start.log).toHaveLength(1);
    expect(start.position).toBeNull();
  });

  it('a market order fills straight away at the current price', () => {
    const next = run(start, {type: 'place', spec: {kind: 'market', side: 'buy', price: null}});
    expect(next.orderState).toEqual({status: 'filled', price: 1.105, slippage: 0});
    expect(next.position).toEqual({side: 'buy', fill: 1.105});
  });

  it('a buy limit at 1.1000 waits, then fills as the market drifts down to it', () => {
    let state = run(start, {type: 'place', spec: {kind: 'limit', side: 'buy', price: 1.1}});
    expect(state.orderState.status).toBe('pending');
    state = run(state, ...drift(1.105, 1.1005));
    expect(state.orderState.status).toBe('pending');
    state = run(state, ...drift(1.1005, 1.1));
    expect(state.orderState).toEqual({status: 'filled', price: 1.1, slippage: 0});
    expect(state.position).toEqual({side: 'buy', fill: 1.1});
    expect(state.log.some((line) => line.includes('ORDER FILLED'))).toBe(true);
  });

  it('refuses an order on the wrong side of the market', () => {
    const next = run(start, {type: 'place', spec: {kind: 'limit', side: 'buy', price: 1.11}});
    expect(next.order).toBeNull();
    expect(next).toBe(start);
  });

  it('a buy stop slips in a fast market and explains why', () => {
    let state = run(start, {type: 'place', spec: {kind: 'stop', side: 'buy', price: 1.11}});
    state = run(state, {type: 'tick', to: 1.113, jump: true});
    expect(state.orderState.status).toBe('filled');
    expect(state.orderState.status === 'filled' && state.orderState.price).toBeCloseTo(1.113);
    expect(state.log.join(' ')).toContain('Slippage');
    expect(state.log.join(' ')).toContain('30 pips');
  });

  it('a stop-limit triggers first, and only fills if price comes back', () => {
    let state = run(start, {type: 'place', spec: {kind: 'stop-limit', side: 'buy', price: 1.11, limitPrice: 1.108}});
    state = run(state, ...drift(1.105, 1.1105));
    expect(state.orderState.status).toBe('triggered');
    expect(state.log.join(' ')).toContain('now a buy limit order');
    state = run(state, ...drift(1.1105, 1.1135));
    expect(state.orderState.status).toBe('triggered');
    state = run(state, ...drift(1.1135, 1.108));
    expect(state.orderState.status).toBe('filled');
    expect(state.position?.fill).toBeCloseTo(1.108);
  });

  it('snaps float drift so a level is never stepped over', () => {
    let state = run(start, {type: 'place', spec: {kind: 'limit', side: 'sell', price: 1.11}});
    // 1.105 + 50 tiny steps of 0.0001 accumulates binary float error; the order must still fill at 1.1100
    let price = 1.105;
    for (let i = 0; i < 50; i += 1) {
      price += 0.0001;
      state = run(state, {type: 'tick', to: price, jump: false});
    }
    expect(state.orderState.status).toBe('filled');
    expect(state.price).toBe(1.11);
  });

  it('keeps the price inside the practice market', () => {
    const state = run(start, {type: 'tick', to: 9, jump: true});
    expect(state.price).toBe(1.115);
    expect(run(start, {type: 'tick', to: 0, jump: true}).price).toBe(1.095);
  });

  it('can cancel a waiting order, and reset everything', () => {
    let state = run(start, {type: 'place', spec: {kind: 'limit', side: 'buy', price: 1.1}}, {type: 'cancel'});
    expect(state.order).toBeNull();
    state = run(state, {type: 'tick', to: 1.11, jump: false}, {type: 'reset'});
    expect(state.price).toBe(1.105);
    expect(state.history).toEqual([1.105]);
  });

  it('does not allow a second order while one is working', () => {
    const first = run(start, {type: 'place', spec: {kind: 'limit', side: 'buy', price: 1.1}});
    const second = run(first, {type: 'place', spec: {kind: 'limit', side: 'sell', price: 1.11}});
    expect(second).toBe(first);
  });
});
