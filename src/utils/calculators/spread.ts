import {calculatePipValue} from './pips';
import type {CurrencyCode, ForexInstrument} from './instruments';
import {incomplete, invalid, isNum, ok, type Calc} from './result';

export interface SpreadInputs {
  instrument: ForexInstrument;
  accountCurrency: CurrencyCode;
  /** The bid (sell) price. */
  bid: number | null;
  spreadPips: number | null;
  lots: number | null;
  /** Optional commission for the round trip, in the account currency. */
  commission?: number | null;
  /** Optional planned stop or target distance in pips, to show how big a bite the spread takes. */
  distancePips?: number | null;
  manualRate?: number | null;
}

export interface SpreadValue {
  bid: number;
  ask: number;
  spreadPrice: number;
  spreadPips: number;
  /** Money lost the instant a trade opens (the spread at this size). */
  spreadCost: number;
  commission: number;
  totalCost: number;
  /** Pips price must move in favour before the trade is at break-even. */
  breakEvenPips: number;
  perPip: number;
  /** Spread as a percentage of the planned distance, if one was supplied. */
  shareOfDistancePct: number | null;
}

export function spreadCost(inputs: SpreadInputs): Calc<SpreadValue> {
  const {instrument, accountCurrency, bid, spreadPips, lots} = inputs;
  if (!isNum(bid) || !isNum(spreadPips) || !isNum(lots)) return incomplete();
  if (bid <= 0) return invalid('The price must be greater than zero.');
  if (spreadPips < 0) return invalid('The spread cannot be negative.');
  if (lots <= 0) return invalid('Position size must be greater than zero.');

  const pip = calculatePipValue({instrument, accountCurrency, units: lots * instrument.contractSize, price: bid, manualRate: inputs.manualRate});
  if (pip.status !== 'ok') return pip;

  const commission = isNum(inputs.commission) && inputs.commission > 0 ? inputs.commission : 0;
  const cost = spreadPips * pip.value.perPip;
  const distance = isNum(inputs.distancePips) && inputs.distancePips > 0 ? inputs.distancePips : null;
  const spreadPrice = spreadPips * instrument.pipSize;

  return ok({
    bid,
    ask: bid + spreadPrice,
    spreadPrice,
    spreadPips,
    spreadCost: cost,
    commission,
    totalCost: cost + commission,
    breakEvenPips: spreadPips + (commission > 0 && pip.value.perPip > 0 ? commission / pip.value.perPip : 0),
    perPip: pip.value.perPip,
    shareOfDistancePct: distance !== null ? (spreadPips / distance) * 100 : null,
  });
}
