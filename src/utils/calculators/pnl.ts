import {resolveQuoteToAccountRate, type RateSource} from './currency';
import {distanceUnit, priceToPips, type CurrencyCode, type Instrument} from './instruments';
import {incomplete, invalid, isNum, ok, type Calc} from './result';
import type {Direction} from './sizing';

export interface PnLInputs {
  instrument: Instrument;
  accountCurrency: CurrencyCode;
  direction: Direction;
  entry: number | null;
  exit: number | null;
  /** Position size in units (forex currency units, or shares/contracts). */
  units: number | null;
  /** Fees, commission, spread etc. in the account currency. Empty counts as zero. */
  costs?: number | null;
  /** Optional, used only to express the result as a percentage of the account. */
  balance?: number | null;
  manualRate?: number | null;
  /** Multiplier for non-forex contracts (value of one point per contract). */
  contractSize?: number | null;
}

export interface PnLValue {
  outcome: 'profit' | 'loss' | 'flat';
  gross: number;
  costs: number;
  net: number;
  /** Favourable move (negative when the trade lost), as a price difference. */
  move: number;
  moveInUnits: number;
  unitLabel: 'pips' | 'points';
  /** Favourable move as a percentage of the entry price. */
  movePct: number;
  /** Net result as a percentage of the account, when a balance is supplied. */
  returnPct: number | null;
  rate: number;
  rateSource: RateSource;
}

export function calculatePnL(inputs: PnLInputs): Calc<PnLValue> {
  const {instrument, accountCurrency, direction, entry, exit, units} = inputs;
  if (!isNum(entry) || !isNum(exit) || !isNum(units)) return incomplete();
  if (entry <= 0 || exit <= 0) return invalid('Prices must be greater than zero.');
  if (units <= 0) return invalid('Position size must be greater than zero.');

  const costs = isNum(inputs.costs) ? inputs.costs : 0;
  if (costs < 0) return invalid('Costs cannot be negative.');

  const resolution = resolveQuoteToAccountRate(instrument, accountCurrency, exit, inputs.manualRate);
  if (resolution.status === 'incomplete') return incomplete();
  if (resolution.status === 'needs-rate') return {status: 'needs-rate', from: resolution.from, to: resolution.to};

  const multiplier = instrument.kind === 'forex' ? 1 : isNum(inputs.contractSize) && inputs.contractSize > 0 ? inputs.contractSize : 1;
  const move = direction === 'long' ? exit - entry : entry - exit;
  const gross = move * units * multiplier * resolution.rate;
  const net = gross - costs;

  if (!Number.isFinite(net)) return invalid('These numbers are too large to calculate.');

  return ok({
    // Classify on half-a-cent so float noise (e.g. -8.9e-15) can't flip a break-even trade into a loss.
    outcome: Math.abs(net) < 0.005 ? 'flat' : net > 0 ? 'profit' : 'loss',
    gross,
    costs,
    net,
    move,
    moveInUnits: priceToPips(move, instrument),
    unitLabel: distanceUnit(instrument),
    movePct: (move / entry) * 100,
    returnPct: isNum(inputs.balance) && inputs.balance > 0 ? (net / inputs.balance) * 100 : null,
    rate: resolution.rate,
    rateSource: resolution.source,
  });
}
