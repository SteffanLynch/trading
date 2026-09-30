import {formatPrice} from './format';
import {advanceOrder, orderGuide, validateOrder, type OrderSpec, type OrderState, type Side} from './orders';

export interface SimConfig {
  /** Lowest and highest price the practice market can reach. */
  floor: number;
  ceiling: number;
  pipSize: number;
  decimals: number;
}

export interface SimState {
  config: SimConfig;
  price: number;
  /** Recent prices, oldest first, drawn as the line on the chart. */
  history: number[];
  order: OrderSpec | null;
  orderState: OrderState;
  position: {side: Side; fill: number} | null;
  /** Plain-English events, oldest first. */
  log: string[];
}

export type SimAction =
  | {type: 'place'; spec: OrderSpec}
  | {type: 'cancel'}
  | {type: 'tick'; to: number; jump: boolean}
  | {type: 'reset'};

const START_PRICE = 1.105;
export const DEFAULT_CONFIG: SimConfig = {floor: 1.095, ceiling: 1.115, pipSize: 0.0001, decimals: 4};
const MAX_HISTORY = 160;
const MAX_LOG = 40;

export function initialSim(config: SimConfig = DEFAULT_CONFIG, price = START_PRICE): SimState {
  return {config, price, history: [price], order: null, orderState: {status: 'pending'}, position: null, log: [`The practice market is at ${formatPrice(price, config.decimals)}. Choose an order type and place an order.`]};
}

const say = (state: SimState, ...lines: string[]): string[] => [...state.log, ...lines].slice(-MAX_LOG);

export function simReducer(state: SimState, action: SimAction): SimState {
  const {decimals, pipSize} = state.config;
  const fmt = (price: number) => formatPrice(price, decimals);

  switch (action.type) {
    case 'reset':
      return initialSim(state.config);

    case 'cancel': {
      if (!state.order || state.orderState.status === 'filled') return state;
      return {...state, order: null, orderState: {status: 'pending'}, log: say(state, 'Order cancelled. Nothing was bought or sold.')};
    }

    case 'place': {
      const {spec} = action;
      if (state.order && state.orderState.status !== 'filled') return state;
      if (!validateOrder(spec, state.price).valid) return state;
      const guide = orderGuide(spec.kind, spec.side);

      if (spec.kind === 'market') {
        return {
          ...state,
          order: spec,
          orderState: {status: 'filled', price: state.price, slippage: 0},
          position: {side: spec.side, fill: state.price},
          log: say(state, `${guide.title} sent. It filled immediately at the current price, ${fmt(state.price)}.`),
        };
      }

      const where = spec.kind === 'stop-limit' ? `stop price ${fmt(spec.price ?? 0)}, limit price ${fmt(spec.limitPrice ?? 0)}` : fmt(spec.price ?? 0);
      return {...state, order: spec, orderState: {status: 'pending'}, position: null, log: say(state, `${guide.title} placed (${where}). It waits until the market gets there.`)};
    }

    case 'tick': {
      // Snap to a tenth of a pip so float drift (1.10199999…) can never step over a level that sits at exactly 1.1020.
      const to = Number(Math.min(state.config.ceiling, Math.max(state.config.floor, action.to)).toFixed(decimals + 1));
      if (to === state.price) return state;
      const from = state.price;
      const history = [...state.history, to].slice(-MAX_HISTORY);
      let log = state.log;
      let {orderState, position} = state;

      if (action.jump) log = say({...state, log}, `Fast move: the price jumped from ${fmt(from)} to ${fmt(to)} with no trading in between.`);

      if (state.order && orderState.status !== 'filled') {
        const next = advanceOrder(state.order, orderState, from, to, action.jump);
        if (next.status !== orderState.status) {
          const title = orderGuide(state.order.kind, state.order.side).title;
          if (next.status === 'triggered') {
            log = say({...state, log}, `Stop price touched: the ${title.toLowerCase()} is now a ${state.order.side} limit order at ${fmt(state.order.limitPrice ?? 0)}. It only fills if price reaches that limit.`);
          } else if (next.status === 'filled') {
            position = {side: state.order.side, fill: next.price};
            log = say({...state, log}, `ORDER FILLED: ${state.order.side === 'buy' ? 'bought' : 'sold'} at ${fmt(next.price)}.`);
            if (next.slippage > pipSize / 2) {
              log = say({...state, log}, `Slippage: a stop order becomes a market order when touched, and in a fast market it filled ${Math.round(next.slippage / pipSize)} pips worse than the stop price.`);
            } else if (state.order.kind === 'limit' && action.jump && Math.abs(next.price - (state.order.price ?? next.price)) > pipSize / 2) {
              log = say({...state, log}, `Price improvement: a limit order fills at its price or better, and the market gapped through it.`);
            }
          }
          orderState = next;
        }
      }

      return {...state, price: to, history, orderState, position, log};
    }
  }
}
