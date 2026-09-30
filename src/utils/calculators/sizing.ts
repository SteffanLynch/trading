import {riskAmount, rewardToRisk, unitsForRisk} from './core';
import {resolveQuoteToAccountRate, type RateSource} from './currency';
import {distanceUnit, priceToPips, type CurrencyCode, type Instrument} from './instruments';
import {breakEvenWinRate} from './risk';
import {floorToStep, incomplete, invalid, isNum, ok, type Calc} from './result';

export type Direction = 'long' | 'short';

export interface SizingContext {
  instrument: Instrument;
  accountCurrency: CurrencyCode;
  balance: number | null;
  riskPct: number | null;
  /** Account-currency value of 1 unit of quote currency. Only needed for crosses (e.g. GBP account, EUR/USD). */
  manualRate?: number | null;
  /** Units per standard lot (forex) or value of a one-point move per contract (other). */
  contractSize?: number | null;
  /** Smallest tradable size, in lots (forex) or units (other). */
  lotStep?: number | null;
}

export type StopSpec =
  | {mode: 'prices'; entry: number | null; stop: number | null}
  | {mode: 'distance'; distance: number | null; referencePrice: number | null};

export interface SizingValue {
  /** The money you chose to risk. */
  targetRisk: number;
  /** Stop distance as a price difference. */
  stopDistance: number;
  /** Stop distance in pips (forex) or points (other). */
  stopDistanceInUnits: number;
  unitLabel: 'pips' | 'points';
  /** Account-currency value of 1 unit of quote currency, and where it came from. */
  rate: number;
  rateSource: RateSource;
  contractSize: number;
  lotStep: number;
  /** Exact result before rounding. */
  unitsExact: number;
  lotsExact: number | null;
  /** Rounded down to the smallest tradable step, so risk never exceeds the target. */
  units: number;
  lots: number | null;
  /** True when even one step would risk more than the target. */
  belowMinimum: boolean;
  /** Risk if you trade at the smallest step (shown when `belowMinimum`). */
  minimumStepRisk: number;
  /** Money lost if the stop is hit at the rounded size, and as % of the account. */
  actualRisk: number;
  actualRiskPct: number;
  /** Account currency gained/lost per pip (or point) at the rounded size. */
  valuePerPip: number;
  /** Money lost per unit traded per unit of price. */
  lossPerUnit: number;
  wasRounded: boolean;
}

const MAX_RISK_PCT = 100;
/** 0.01 lots for forex; 0.01 units for everything else (set 1 for whole shares). */
const DEFAULT_LOT_STEP = 0.01;

/** Shared by the Position Size calculator and the Trade Planner. */
export function sizePosition(context: SizingContext, stop: StopSpec): Calc<SizingValue> {
  const {instrument, accountCurrency, balance, riskPct} = context;

  let stopDistance: number;
  let referencePrice: number | null;

  if (stop.mode === 'prices') {
    if (!isNum(stop.entry) || !isNum(stop.stop)) return incomplete();
    if (stop.entry <= 0 || stop.stop <= 0) return invalid('Prices must be greater than zero.');
    stopDistance = Math.abs(stop.entry - stop.stop);
    referencePrice = stop.entry;
  } else {
    if (!isNum(stop.distance)) return incomplete();
    if (stop.distance <= 0) return invalid('Stop distance must be greater than zero.');
    stopDistance = stop.distance * instrument.pipSize;
    referencePrice = stop.referencePrice;
  }

  if (!isNum(balance) || !isNum(riskPct)) return incomplete();
  if (balance <= 0 || riskPct <= 0) return invalid('Account balance and risk percentage must be greater than zero.');
  if (riskPct > MAX_RISK_PCT) return invalid('Risk cannot be more than 100% of your account.');
  if (stopDistance === 0) return invalid('Entry price and stop loss price cannot be identical.');

  const contractSize = isNum(context.contractSize) && context.contractSize > 0 ? context.contractSize : instrument.contractSize;
  const lotStep = isNum(context.lotStep) && context.lotStep > 0 ? context.lotStep : DEFAULT_LOT_STEP;

  const rateResolution = resolveQuoteToAccountRate(instrument, accountCurrency, referencePrice, context.manualRate);
  if (rateResolution.status === 'incomplete') return incomplete();
  if (rateResolution.status === 'needs-rate') return {status: 'needs-rate', from: rateResolution.from, to: rateResolution.to};
  const {rate, source} = rateResolution;

  // Forex units are currency units, so a 1.0 price move is worth 1.0 per unit. For other markets each
  // unit/contract is worth `contractSize` per point.
  const valueMultiplier = instrument.kind === 'forex' ? 1 : contractSize;
  const lossPerUnit = stopDistance * valueMultiplier * rate;
  const targetRisk = riskAmount(balance, riskPct);
  const unitsExact = unitsForRisk(targetRisk, lossPerUnit);

  let lotsExact: number | null = null;
  let lots: number | null = null;
  let units: number;
  let stepInUnits: number;

  if (instrument.kind === 'forex') {
    lotsExact = unitsExact / contractSize;
    lots = floorToStep(lotsExact, lotStep);
    units = Math.round(lots * contractSize);
    stepInUnits = lotStep * contractSize;
  } else {
    units = floorToStep(unitsExact, lotStep);
    stepInUnits = lotStep;
  }

  const actualRisk = units * lossPerUnit;
  const minimumStepRisk = stepInUnits * lossPerUnit;
  const valuePerPip = units * instrument.pipSize * valueMultiplier * rate;

  if (!Number.isFinite(unitsExact) || !Number.isFinite(actualRisk)) return invalid('These numbers are too large to calculate.');

  return ok({
    targetRisk,
    stopDistance,
    stopDistanceInUnits: priceToPips(stopDistance, instrument),
    unitLabel: distanceUnit(instrument),
    rate,
    rateSource: source,
    contractSize,
    lotStep,
    unitsExact,
    lotsExact,
    units,
    lots,
    belowMinimum: units === 0,
    minimumStepRisk,
    actualRisk,
    actualRiskPct: (actualRisk / balance) * 100,
    valuePerPip,
    lossPerUnit,
    wasRounded: units < unitsExact - 1e-9 && units > 0,
  });
}

export interface TradePlanInputs extends SizingContext {
  direction: Direction;
  entry: number | null;
  stop: number | null;
  /** Optional. Without a target the plan shows risk and size only. */
  target: number | null;
}

export interface TargetOutcome {
  distance: number;
  distanceInUnits: number;
  profit: number;
  gainPct: number;
  /** Reward per 1 of risk. */
  ratio: number;
  /** Win rate needed to break even at this ratio, before costs (percent). */
  breakEvenWinRate: number;
}

export interface TradePlanValue {
  sizing: SizingValue;
  direction: Direction;
  /** Present when a target was supplied and sits on the correct side of entry. */
  target: TargetOutcome | null;
  /** A problem with the target only (e.g. wrong side of entry). Sizing is still shown. */
  targetIssue: string | null;
}

export function planTrade(inputs: TradePlanInputs): Calc<TradePlanValue> {
  const {direction, entry, stop, target} = inputs;

  if (isNum(entry) && isNum(stop) && entry > 0 && stop > 0 && entry !== stop) {
    if (direction === 'long' && stop > entry) return invalid('For a long trade your stop loss must be below your entry price.');
    if (direction === 'short' && stop < entry) return invalid('For a short trade your stop loss must be above your entry price.');
  }

  const sized = sizePosition(inputs, {mode: 'prices', entry, stop});
  if (sized.status !== 'ok') return sized;
  const sizing = sized.value;

  let outcome: TargetOutcome | null = null;
  let targetIssue: string | null = null;

  if (isNum(target) && isNum(entry)) {
    if (target <= 0) {
      targetIssue = 'Target price must be greater than zero.';
    } else if (direction === 'long' ? target <= entry : target >= entry) {
      targetIssue =
        direction === 'long'
          ? 'For a long trade your target must be above your entry price.'
          : 'For a short trade your target must be below your entry price.';
    } else {
      const distance = Math.abs(target - entry);
      const ratio = rewardToRisk(sizing.stopDistance, distance);
      const profit = sizing.units * distance * (sizing.lossPerUnit / sizing.stopDistance);
      outcome = {
        distance,
        distanceInUnits: priceToPips(distance, inputs.instrument),
        profit,
        gainPct: isNum(inputs.balance) && inputs.balance > 0 ? (profit / inputs.balance) * 100 : 0,
        ratio,
        breakEvenWinRate: breakEvenWinRate(ratio),
      };
    }
  }

  return ok({sizing, direction, target: outcome, targetIssue});
}
