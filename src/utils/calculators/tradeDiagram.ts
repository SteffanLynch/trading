import {resolveQuoteToAccountRate, type RateSource} from './currency';
import {distanceUnit, priceToPips, type CurrencyCode, type Instrument} from './instruments';
import {breakEvenWinRate} from './risk';
import {incomplete, invalid, isNum, ok, type Calc} from './result';
import type {Direction} from './sizing';

export interface TradeDiagramInputs {
  instrument: Instrument;
  accountCurrency: CurrencyCode;
  direction: Direction;
  entry: number | null;
  stop: number | null;
  target: number | null;
  /** Position size in units (forex currency units, or shares/contracts). */
  units: number | null;
  manualRate?: number | null;
  /** Multiplier for non-forex contracts. */
  contractSize?: number | null;
}

export interface TradeDiagramValue {
  riskDistance: number;
  rewardDistance: number;
  riskPips: number;
  rewardPips: number;
  unitLabel: 'pips' | 'points';
  risk: number;
  reward: number;
  ratio: number;
  breakEvenWinRate: number;
  rate: number;
  rateSource: RateSource;
}

/** Risk and reward in distance and money for a position of a fixed size. The entry, stop and target can all be moved. */
export function visualiseTrade(inputs: TradeDiagramInputs): Calc<TradeDiagramValue> {
  const {instrument, accountCurrency, direction, entry, stop, target, units} = inputs;
  if (!isNum(entry) || !isNum(stop) || !isNum(target) || !isNum(units)) return incomplete();
  if (entry <= 0 || stop <= 0 || target <= 0) return invalid('Prices must be greater than zero.');
  if (units <= 0) return invalid('Position size must be greater than zero.');
  if (direction === 'long' ? !(stop < entry && target > entry) : !(stop > entry && target < entry)) {
    return invalid(direction === 'long' ? 'For a long trade the stop sits below the entry and the target above it.' : 'For a short trade the stop sits above the entry and the target below it.');
  }

  const resolution = resolveQuoteToAccountRate(instrument, accountCurrency, entry, inputs.manualRate);
  if (resolution.status === 'incomplete') return incomplete();
  if (resolution.status === 'needs-rate') return {status: 'needs-rate', from: resolution.from, to: resolution.to};

  const multiplier = instrument.kind === 'forex' ? 1 : isNum(inputs.contractSize) && inputs.contractSize > 0 ? inputs.contractSize : 1;
  const riskDistance = Math.abs(entry - stop);
  const rewardDistance = Math.abs(target - entry);
  const perPrice = units * multiplier * resolution.rate;
  const ratio = rewardDistance / riskDistance;

  return ok({
    riskDistance,
    rewardDistance,
    riskPips: priceToPips(riskDistance, instrument),
    rewardPips: priceToPips(rewardDistance, instrument),
    unitLabel: distanceUnit(instrument),
    risk: riskDistance * perPrice,
    reward: rewardDistance * perPrice,
    ratio,
    breakEvenWinRate: breakEvenWinRate(ratio),
    rate: resolution.rate,
    rateSource: resolution.source,
  });
}
