export type OrderKind = 'market' | 'limit' | 'stop' | 'stop-limit';
export type Side = 'buy' | 'sell';

export interface OrderSpec {
  kind: OrderKind;
  side: Side;
  /** The order price, or for a stop-limit order the stop (trigger) price. Unused for a market order. */
  price: number | null;
  /** Stop-limit only: the limit price the order becomes once triggered. */
  limitPrice?: number | null;
}

export type OrderState =
  | {status: 'pending'}
  /** A stop-limit order whose stop price has been touched: it is now waiting as a limit order. */
  | {status: 'triggered'}
  | {status: 'filled'; price: number; /** Price difference against the trader versus the order price (0 if none). */ slippage: number};

export interface OrderGuide {
  title: string;
  /** One-line definition. */
  summary: string;
  /** Where the order price must sit relative to the current price. */
  placement: string;
  /** When a trader would use it. */
  use: string;
}

const GUIDES: Record<string, OrderGuide> = {
  'market-buy': {title: 'Market buy', summary: 'Buy right now at the best available price.', placement: 'No price needed.', use: 'When getting in matters more than the exact price.'},
  'market-sell': {title: 'Market sell', summary: 'Sell right now at the best available price.', placement: 'No price needed.', use: 'When getting out matters more than the exact price.'},
  'limit-buy': {title: 'Buy limit', summary: 'Buy only at this price or lower.', placement: 'Below the current price.', use: 'To buy on a pullback, at a better price than the market offers now. It may never fill if price never gets there.'},
  'limit-sell': {title: 'Sell limit', summary: 'Sell only at this price or higher.', placement: 'Above the current price.', use: 'To sell into a rally, at a better price than the market offers now. It may never fill if price never gets there.'},
  'stop-buy': {title: 'Buy stop', summary: 'Buy once price rises to this level.', placement: 'Above the current price.', use: 'To join a breakout upward, or as the stop loss of a short trade. It becomes a market order when touched, so it can fill at a worse price.'},
  'stop-sell': {title: 'Sell stop', summary: 'Sell once price falls to this level.', placement: 'Below the current price.', use: 'To join a breakdown, or as the stop loss of a long trade. It becomes a market order when touched, so it can fill at a worse price.'},
  'stop-limit-buy': {title: 'Buy stop-limit', summary: 'Once price rises to the stop price, place a buy limit at the limit price.', placement: 'Stop price above the current price; limit price below the stop price.', use: 'To buy a breakout only if price then pulls back. It can be triggered and still never fill.'},
  'stop-limit-sell': {title: 'Sell stop-limit', summary: 'Once price falls to the stop price, place a sell limit at the limit price.', placement: 'Stop price below the current price; limit price above the stop price.', use: 'To sell a breakdown only if price then bounces. It can be triggered and still never fill.'},
};

export function orderGuide(kind: OrderKind, side: Side): OrderGuide {
  return GUIDES[`${kind}-${side}`];
}

export interface OrderCheck {
  valid: boolean;
  message?: string;
}

/** Whether the order price sits on the correct side of the current price for this type of order. */
export function validateOrder(spec: OrderSpec, current: number): OrderCheck {
  if (spec.kind === 'market') return {valid: true};
  const {side, price, limitPrice} = spec;
  if (price === null || !Number.isFinite(price)) return {valid: false, message: spec.kind === 'stop-limit' ? 'Enter a stop price.' : 'Enter an order price.'};

  const buy = side === 'buy';
  if (spec.kind === 'limit') {
    if (buy && price >= current) return {valid: false, message: 'A buy limit must sit below the current price. To buy above the current price, use a buy stop.'};
    if (!buy && price <= current) return {valid: false, message: 'A sell limit must sit above the current price. To sell below the current price, use a sell stop.'};
  }
  if (spec.kind === 'stop') {
    if (buy && price <= current) return {valid: false, message: 'A buy stop must sit above the current price. To buy below the current price, use a buy limit.'};
    if (!buy && price >= current) return {valid: false, message: 'A sell stop must sit below the current price. To sell above the current price, use a sell limit.'};
  }
  if (spec.kind === 'stop-limit') {
    if (buy && price <= current) return {valid: false, message: 'The stop price of a buy stop-limit must sit above the current price.'};
    if (!buy && price >= current) return {valid: false, message: 'The stop price of a sell stop-limit must sit below the current price.'};
    if (limitPrice === null || limitPrice === undefined || !Number.isFinite(limitPrice)) return {valid: false, message: 'Enter a limit price.'};
    if (buy && limitPrice >= price) return {valid: false, message: 'The limit price of a buy stop-limit must sit below its stop price.'};
    if (!buy && limitPrice <= price) return {valid: false, message: 'The limit price of a sell stop-limit must sit above its stop price.'};
  }
  return {valid: true};
}

/** A level is crossed when price moves through it or lands on it. */
const crossedUp = (level: number, from: number, to: number) => from < level && to >= level;
const crossedDown = (level: number, from: number, to: number) => from > level && to <= level;

/**
 * Moves an order forward as the market goes from `from` to `to`.
 *
 * `jump` marks a fast, gapping move: price leaps instead of drifting through every level. A stop order then fills
 * at the price reached (slippage, usually worse), while a limit order fills at its price or better.
 */
export function advanceOrder(spec: OrderSpec, state: OrderState, from: number, to: number, jump = false): OrderState {
  if (state.status === 'filled' || spec.kind === 'market' || spec.price === null) return state;
  const buy = spec.side === 'buy';
  const level = spec.price;

  if (spec.kind === 'limit') {
    if (buy && crossedDown(level, from, to)) return {status: 'filled', price: jump && to < level ? to : level, slippage: 0};
    if (!buy && crossedUp(level, from, to)) return {status: 'filled', price: jump && to > level ? to : level, slippage: 0};
  }

  if (spec.kind === 'stop') {
    if (buy && crossedUp(level, from, to)) return {status: 'filled', price: jump ? to : level, slippage: jump ? to - level : 0};
    if (!buy && crossedDown(level, from, to)) return {status: 'filled', price: jump ? to : level, slippage: jump ? level - to : 0};
  }

  if (spec.kind === 'stop-limit' && spec.limitPrice !== null && spec.limitPrice !== undefined) {
    const limit = spec.limitPrice;
    if (state.status === 'pending') {
      if (buy && crossedUp(level, from, to)) return {status: 'triggered'};
      if (!buy && crossedDown(level, from, to)) return {status: 'triggered'};
    } else if (state.status === 'triggered') {
      if (buy && crossedDown(limit, from, to)) return {status: 'filled', price: jump && to < limit ? to : limit, slippage: 0};
      if (!buy && crossedUp(limit, from, to)) return {status: 'filled', price: jump && to > limit ? to : limit, slippage: 0};
    }
  }
  return state;
}

/** Open profit or loss in pips for a position opened at `fill`. */
export function positionPips(side: Side, fill: number, current: number, pipSize: number): number {
  return ((side === 'buy' ? current - fill : fill - current) / pipSize);
}
